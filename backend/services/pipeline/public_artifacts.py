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
from typing import Any

PUBLIC_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "../../../data/public")
)

# Keys that must never appear anywhere in a public artifact. The frontend
# repo test scans the written files for the same set (defense in depth).
BANNED_KEYS = frozenset({"model_used", "cost_estimate", "prompt", "provider"})


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


def write_public_json(relative_path: str, obj: Any) -> str:
    """Validate obj and atomically publish it inside data/public.

    The temp file is created in the target's own directory so the final
    os.replace is a same-filesystem atomic rename.

    Args:
        relative_path: Path under data/public (e.g. "stories/universe_x.json").
        obj: JSON-serializable, fully projected public artifact.

    Returns:
        The absolute path of the written artifact.

    Raises:
        ValueError: If the path escapes data/public or obj carries
            internal metadata.
    """
    assert_publicly_classified(obj)

    target = os.path.normpath(os.path.join(PUBLIC_DIR, relative_path))
    if not target.startswith(PUBLIC_DIR + os.sep):
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
