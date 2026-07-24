# backend/services/pipeline/public_artifacts.py

"""Atomic, validated writes into the data/public classification boundary.

Every pipeline that publishes an artifact for the frontend goes through
write_public_json. The helper enforces the two non-negotiable rules of the
namespace (see data/public/README.md): no internal metadata ever lands
there, and a failed write leaves the previous valid artifact intact.
"""

import json
import os
import tempfile
from typing import Any, Callable

PUBLIC_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "../../../data/public")
)

# Keys that must never appear anywhere in a public artifact. The frontend
# repo test scans the written files for the same set (defense in depth).
# This is a tripwire, NOT the allowlist: every publisher must still
# construct its artifact field by field through the require_* validators.
BANNED_KEYS = frozenset({"model_used", "cost_estimate", "prompt", "provider"})


def require_str(value: Any, context: str) -> str:
    """Admit a value into a public artifact only if it is a real string.

    Publication code validates, it never repairs: coercing None or a dict
    with str() would turn invalid internal data into superficially valid
    public data.

    Raises:
        ValueError: If the value is not a str.
    """
    if not isinstance(value, str):
        raise ValueError(
            "%s must be a string, got %s" % (context, type(value).__name__)
        )
    return value


def require_str_or_none(value: Any, context: str) -> str | None:
    """Like require_str but permits an explicit None."""
    if value is None:
        return None
    return require_str(value, context)


def require_int(value: Any, context: str) -> int:
    """Admit a value only if it is a real integer (bool excluded).

    Raises:
        ValueError: If the value is not an int.
    """
    if not isinstance(value, int) or isinstance(value, bool):
        raise ValueError(
            "%s must be an integer, got %s" % (context, type(value).__name__)
        )
    return value


def require_exact_keys(value: Any, keys: set[str], context: str) -> dict:
    """Admit a dict only if its key set EXACTLY equals the public schema.

    Extra keys fail (unclassified disclosure), missing keys fail
    (malformed artifact). A subset check would silently accept fields
    that were never classified public.

    Raises:
        ValueError: If the value is not a dict or its keys deviate.
    """
    if not isinstance(value, dict):
        raise ValueError(
            "%s must be an object, got %s" % (context, type(value).__name__)
        )
    if set(value.keys()) != keys:
        raise ValueError(
            "%s keys %s deviate from public schema %s"
            % (context, sorted(value.keys()), sorted(keys))
        )
    return value


def assert_publicly_classified(obj: Any, path: str = "$") -> None:
    """Recursively reject objects carrying internal pipeline metadata.

    Args:
        obj: Parsed JSON value to inspect.
        path: JSON path of obj, used in the error message.

    Raises:
        ValueError: If any banned key exists at any depth.
    """
    if isinstance(obj, dict):
        for key, value in obj.items():
            if key in BANNED_KEYS:
                raise ValueError(
                    "Internal key %r at %s must not enter data/public" % (key, path)
                )
            assert_publicly_classified(value, "%s.%s" % (path, key))
    elif isinstance(obj, list):
        for index, item in enumerate(obj):
            assert_publicly_classified(item, "%s[%d]" % (path, index))


def write_public_json(
    relative_path: str, obj: Any, validator: Callable[[Any], None]
) -> str:
    """Validate obj and atomically publish it inside data/public.

    Publication structurally requires an artifact-specific validator: an
    internal object cannot reach data/public without passing an explicit
    schema check, so S2 is a property of the primitive, not a convention
    callers are trusted to follow. The banned-key tripwire runs after the
    validator as defense in depth only.

    The temp file is created in the target's own directory so the final
    os.replace is a same-filesystem atomic rename.

    Args:
        relative_path: Path under data/public (e.g. "stories/universe_x.json").
        obj: JSON-serializable, fully projected public artifact.
        validator: Artifact-specific structural check; must raise on any
            deviation from the artifact's exact public schema.

    Returns:
        The absolute path of the written artifact.

    Raises:
        ValueError: If validation fails, the path escapes data/public, or
            obj carries internal metadata.
    """
    validator(obj)
    assert_publicly_classified(obj)

    # Containment is guaranteed by this primitive, not by callers: reject
    # absolute paths outright, then resolve symlinks and traversal and
    # require the real target to live inside the real public root.
    if os.path.isabs(relative_path):
        raise ValueError("Refusing absolute path: %r" % relative_path)
    root = os.path.realpath(PUBLIC_DIR)
    target = os.path.realpath(os.path.join(root, relative_path))
    if target == root or os.path.commonpath([root, target]) != root:
        raise ValueError("Refusing to write outside data/public: %r" % relative_path)

    target_dir = os.path.dirname(target)
    os.makedirs(target_dir, exist_ok=True)

    fd, tmp_path = tempfile.mkstemp(
        dir=target_dir, prefix=".%s." % os.path.basename(target), suffix=".tmp"
    )
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(obj, f, indent=2, ensure_ascii=False)
            f.write("\n")
        os.replace(tmp_path, target)
    except BaseException:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise

    return target
