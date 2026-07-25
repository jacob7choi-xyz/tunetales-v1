// Dependency vulnerability policy.
//
// Two rules:
//   1. No high or critical advisory may exist in the PRODUCTION dependency
//      graph (npm's `--omit=dev` tree). That graph is broader than the
//      browser bundle: it includes server and build-time code. Browser
//      reachability is a narrower question, reasoned about separately.
//   2. The full dependency graph may carry high or critical advisories ONLY
//      where the explicit, expiring waiver below admits them.
//
// The waiver is pinned to an advisory IDENTITY and to the exact dependency
// topology it travels. It is exact in both directions: an unexpected finding
// fails, and a MISSING expected finding fails too, so any movement in the
// lockfile or toolchain forces re-evaluation rather than silently widening
// what is accepted.
//
// Fail-closed means fail-closed. Every vulnerability record is validated
// before it is classified: a record with a missing or unrecognized severity,
// or a malformed `via`, is a hard failure rather than a row that quietly
// disappears from consideration.
//
// Pure, so the policy can be tested adversarially against crafted reports
// and against real captured npm output.

const KNOWN_SEVERITIES = new Set([
  "info",
  "low",
  "moderate",
  "high",
  "critical",
]);
const BLOCKING_SEVERITIES = new Set(["high", "critical"]);
const SUPPORTED_REPORT_VERSION = 2;

// ---------------------------------------------------------------------------
// Accepted waiver
// ---------------------------------------------------------------------------
// GHSA-mh99-v99m-4gvg (CVE-2026-14257): brace-expansion through 5.0.7 can be
// driven to exhaust memory by a crafted brace expression. Remediated in
// 5.0.8. Availability impact only; no confidentiality or integrity impact.
//
// Why accepted rather than fixed (evidence gathered 2026-07-25):
//   * Absent from the production dependency graph. Rule 1 re-proves that on
//     every run rather than trusting the claim.
//   * Both real remediations break the build. Overriding brace-expansion to
//     5.0.8 makes the audit clean and then crashes ESLint, because 5.x is
//     incompatible with the CommonJS minimatch@3 that ESLint 9 resolves.
//     Upgrading to eslint@10.8.0 crashes eslint-plugin-react as vendored by
//     eslint-config-next, and still does not clear the audit.
//
// Reachability, stated accurately:
//   The vulnerable function is reached through ESLint's config matching,
//   which evaluates `files`/`ignores` globs with minimatch. This repository
//   is public and CI runs on pull_request with the PR's own code checked
//   out, so a fork PR CAN author a glob that reaches brace-expansion. The
//   earlier claim that no PR-supplied string reaches this path was wrong and
//   is withdrawn.
//
//   The waiver rests instead on blast radius. A PR that can author a
//   malicious glob already controls code that executes in the same runner:
//   `npm ci` runs lifecycle scripts from the PR's package.json, and the
//   test and build steps execute PR-authored source. Arbitrary execution in
//   that runner is therefore pre-existing and strictly stronger than a
//   memory-exhaustion crash of one lint job. This advisory does not
//   meaningfully widen the CI attack surface. Fork PRs on a public
//   repository also receive a read-only token and no repository secrets, so
//   the exposure is the availability of one ephemeral job.
//
// Production exposure: none demonstrated, and re-proven every run.
// CI exposure: reachable, bounded by a threat that already dominates it.
export const WAIVER = {
  advisory: "https://github.com/advisories/GHSA-mh99-v99m-4gvg",
  cve: "CVE-2026-14257",
  rootPackage: "brace-expansion",
  owner: "jacob7choi-xyz",
  acceptedAt: "2026-07-25",
  // The toolchain the evidence and fixtures were captured against. CI runs a
  // different npm, which is fine: the report-version check fails closed if
  // the schema moves, and CI logs its own versions.
  characterizedWith: { node: "v25.8.0", npm: "11.11.0" },
  // The risk facts this acceptance was made under. Accepting an advisory
  // identity is not the same as accepting whatever that advisory later turns
  // out to be: a rescoring is material new information, so severity, CVSS
  // vector, and affected range are all pinned. Any of them moving fails.
  expectedSeverity: "high",
  expectedCvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
  expectedRange: "<=5.0.7",
  // The installed locations of the vulnerable package AND the version at
  // each. Two COMPLEMENTARY oracles with different responsibilities, not
  // independent evidence: npm audit derives its analysis from this same
  // lockfile, so it is one source read two ways. The audit report carries
  // the vulnerability interpretation; the lockfile carries installed-state
  // identity. The advisory's `range` is the vulnerable range, not the
  // installed version, so range alone cannot detect a node moving from
  // 1.1.16 to 5.0.7 while both remain in range.
  expectedNodes: {
    "node_modules/brace-expansion": "1.1.16",
    "node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion":
      "5.0.7",
  },
  // A waiver that cannot expire becomes permanent by inattention. On or
  // after this date the gate fails until the waiver is renewed with fresh
  // evidence or deleted because it is no longer needed.
  expiresAt: "2026-08-22",
  // Packages npm reports as vulnerable solely because they depend on the
  // root above, each mapped to the exact dependencies that carry it to them.
  metaChain: {
    minimatch: ["brace-expansion"],
    "@eslint/config-array": ["minimatch"],
    "@eslint/eslintrc": ["minimatch"],
    "eslint-plugin-import": ["minimatch"],
    "eslint-plugin-jsx-a11y": ["minimatch"],
    "eslint-plugin-react": ["minimatch"],
    eslint: ["@eslint/config-array", "@eslint/eslintrc", "minimatch"],
    "eslint-config-next": [
      "eslint-plugin-import",
      "eslint-plugin-jsx-a11y",
      "eslint-plugin-react",
    ],
  },
};

export class AuditPolicyError extends Error {}

// Interpretation of the npm subprocess result, kept pure and beside the
// policy because the adapter is part of the same fail-closed boundary: a
// hardened policy fed by a sloppy adapter is still unsafe.
//
// npm documents exit 0 for "no vulnerabilities found" and a non-zero exit
// when findings meet the configured audit-level; it does not promise that
// the only legitimate non-zero status is 1. Accepting only 0 and 1 is
// therefore this gate's own characterized policy against the pinned
// toolchain, not an npm API guarantee. Any other status fails closed and
// asks for review, which is the behaviour we want if npm's contract shifts.
// A crash, a signal, or a missing binary is likewise a failure, never a
// pass just because stdout happened to contain something.
/**
 * @param {{
 *   stdout?: string,
 *   status?: number | null,
 *   signal?: string | null,
 *   stderr?: string,
 *   spawnError?: string,
 * }} result
 * @param {string} label
 * @returns {string} the raw report body
 */
export function interpretAuditInvocation(
  { stdout, status, signal, stderr, spawnError },
  label
) {
  if (signal) {
    throw new AuditPolicyError(
      `npm audit (${label}) was terminated by ${signal}.`
    );
  }
  if (spawnError) {
    throw new AuditPolicyError(
      `npm audit (${label}) could not be run: ${spawnError}`
    );
  }
  if (status !== 0 && status !== 1) {
    throw new AuditPolicyError(
      `npm audit (${label}) exited ${status ?? "with no status"}. This gate ` +
        `accepts only 0 and 1, the statuses characterized against the pinned ` +
        `toolchain; anything else needs review.\n${stderr ?? ""}`.trim()
    );
  }
  if (typeof stdout !== "string" || stdout.trim() === "") {
    throw new AuditPolicyError(
      `npm audit (${label}) produced no report.\n${stderr ?? ""}`.trim()
    );
  }
  return stdout;
}

function reject(message) {
  throw new AuditPolicyError(message);
}

const sameSet = (a, b) => {
  const left = new Set(a);
  const right = new Set(b);
  if (left.size !== right.size) return false;
  for (const value of left) if (!right.has(value)) return false;
  return true;
};

export function parseReport(raw, label) {
  if (typeof raw !== "string" || raw.trim() === "") {
    reject(`npm audit (${label}) produced no report.`);
  }
  let report;
  try {
    report = JSON.parse(raw);
  } catch {
    reject(`npm audit (${label}) did not return parseable JSON.`);
  }
  if (report?.auditReportVersion !== SUPPORTED_REPORT_VERSION) {
    reject(
      `Unrecognized audit report version ${report?.auditReportVersion} (${label}). ` +
        `This gate understands version ${SUPPORTED_REPORT_VERSION}; review it ` +
        `before trusting a newer format.`
    );
  }
  const vulnerabilities = report.vulnerabilities;
  if (
    !vulnerabilities ||
    typeof vulnerabilities !== "object" ||
    Array.isArray(vulnerabilities)
  ) {
    reject(`npm audit (${label}) report has no vulnerabilities map.`);
  }

  // Validate BEFORE classifying. An entry this policy cannot read is a
  // failure, never a row that silently drops out of the severity filter.
  for (const [key, entry] of Object.entries(vulnerabilities)) {
    const where = `${label}: vulnerability "${key}"`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      reject(`${where} is not an object.`);
    }
    if (typeof entry.name !== "string" || entry.name === "") {
      reject(`${where} has no usable name.`);
    }
    if (entry.name !== key) {
      reject(`${where} disagrees with its own name "${entry.name}".`);
    }
    if (typeof entry.severity !== "string" || !KNOWN_SEVERITIES.has(entry.severity)) {
      reject(
        `${where} has an unrecognized severity ${JSON.stringify(entry.severity)}. ` +
          `Refusing to guess whether it is blocking.`
      );
    }
    if (!Array.isArray(entry.via)) {
      reject(`${where} has a malformed "via" (expected an array).`);
    }
    if (entry.nodes !== undefined) {
      if (
        !Array.isArray(entry.nodes) ||
        entry.nodes.some((n) => typeof n !== "string" || n === "")
      ) {
        reject(`${where} has a malformed "nodes" (expected an array of paths).`);
      }
    }
    for (const via of entry.via) {
      const isCarrier = typeof via === "string" && via !== "";
      const isAdvisory =
        via && typeof via === "object" && !Array.isArray(via) && typeof via.url === "string";
      if (!isCarrier && !isAdvisory) {
        reject(
          `${where} has a "via" entry that is neither a package name nor an ` +
            `advisory with a url: ${JSON.stringify(via)}`
        );
      }
    }
  }
  return report;
}

function blocking(report) {
  return Object.values(report.vulnerabilities).filter((entry) =>
    BLOCKING_SEVERITIES.has(entry.severity)
  );
}

// The installed-state oracle. The audit report says which nodes are
// vulnerable; the lockfile says what is actually installed at them. Keeping
// the two responsibilities separate avoids overloading either with a job it
// cannot do, though they are complementary readings of one dependency tree
// rather than independent sources of evidence.
export function parseLockfile(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    reject("package-lock.json could not be read.");
  }
  let lock;
  try {
    lock = JSON.parse(raw);
  } catch {
    reject("package-lock.json is not parseable JSON.");
  }
  if (!lock?.packages || typeof lock.packages !== "object") {
    reject("package-lock.json has no packages map; cannot verify installed state.");
  }
  return lock;
}

function verifyInstalledState(lockfileRaw) {
  const lock = parseLockfile(lockfileRaw);
  for (const [path, expectedVersion] of Object.entries(WAIVER.expectedNodes)) {
    const installed = lock.packages[path];
    if (!installed) {
      reject(
        `package-lock.json no longer contains ${path}. The waived installation ` +
          `moved; re-evaluate the waiver against the current lockfile.`
      );
    }
    if (installed.version !== expectedVersion) {
      reject(
        `${path} is now version ${installed.version ?? "unknown"}; the waiver was ` +
          `evidenced against ${expectedVersion}. The installed state changed even ` +
          `though the advisory range did not.`
      );
    }
  }
}

// `today` is injectable so expiry is testable without waiting for a date.
export function evaluateAudit({ shippedRaw, fullRaw, lockfileRaw, today = new Date() }) {
  const production = blocking(parseReport(shippedRaw, "production dependencies"));
  if (production.length > 0) {
    reject(
      `${production.length} high or critical advisory in the PRODUCTION ` +
        `dependency graph:\n` +
        production.map((v) => `  ${v.name} (${v.severity})`).join("\n") +
        `\nThere is no waiver for these.`
    );
  }

  const findings = blocking(parseReport(fullRaw, "full dependency graph"));
  const expectedNames = [WAIVER.rootPackage, ...Object.keys(WAIVER.metaChain)];
  const actualNames = findings.map((f) => f.name);

  if (findings.length === 0) {
    // The waiver has outlived its need. Failing here is deliberate: a
    // waiver left in source after the advisory clears can silently
    // re-activate if the same advisory returns later.
    reject(
      `The waived advisory (${WAIVER.advisory}) no longer appears in the ` +
        `dependency graph.\nDelete the waiver from scripts/audit-policy.mjs ` +
        `and restore an unconditional gate.`
    );
  }

  // Exact topology, both directions. An unexpected finding widens what is
  // accepted; a missing expected finding means the graph moved and the
  // evidence behind the waiver no longer describes reality.
  if (!sameSet(actualNames, expectedNames)) {
    const unexpected = actualNames.filter((n) => !expectedNames.includes(n));
    const absent = expectedNames.filter((n) => !actualNames.includes(n));
    reject(
      `The waived dependency topology has changed.\n` +
        (unexpected.length
          ? `  unexpected findings: ${unexpected.join(", ")}\n`
          : "") +
        (absent.length ? `  expected findings now absent: ${absent.join(", ")}\n` : "") +
        `Re-evaluate the waiver in scripts/audit-policy.mjs against the ` +
        `current graph; do not widen it by default.`
    );
  }

  for (const entry of findings) {
    const advisories = entry.via.filter((v) => typeof v === "object");
    const carriers = entry.via.filter((v) => typeof v === "string");

    // A rescoring of the same advisory is new risk information and must not
    // inherit an acceptance made under the old score.
    if (entry.severity !== WAIVER.expectedSeverity) {
      reject(
        `${entry.name} is now ${entry.severity}; the waiver was accepted at ` +
          `${WAIVER.expectedSeverity}. Re-evaluate the risk before renewing.`
      );
    }

    if (entry.name === WAIVER.rootPackage) {
      const urls = advisories.map((a) => a.url);
      // Exactly the waived advisory, and nothing alongside it
      if (!sameSet(urls, [WAIVER.advisory]) || carriers.length > 0) {
        reject(
          `${entry.name} (${entry.severity}) does not carry exactly the waived ` +
            `advisory. Found: ${[...urls, ...carriers].join(", ") || "nothing"}.`
        );
      }
      const advisory = advisories[0];
      if (advisory.severity !== undefined && advisory.severity !== WAIVER.expectedSeverity) {
        reject(
          `${WAIVER.advisory} is now scored ${advisory.severity}; accepted at ` +
            `${WAIVER.expectedSeverity}. Re-evaluate the risk.`
        );
      }
      const vector = advisory.cvss?.vectorString;
      if (vector !== WAIVER.expectedCvssVector) {
        reject(
          `${WAIVER.advisory} CVSS vector is now ${vector ?? "absent"}; accepted ` +
            `as ${WAIVER.expectedCvssVector}. The risk characterization changed.`
        );
      }
      if (entry.range !== WAIVER.expectedRange) {
        reject(
          `${WAIVER.rootPackage} affected range is now ${entry.range ?? "absent"}; ` +
            `accepted as ${WAIVER.expectedRange}.`
        );
      }
      const waivedPaths = Object.keys(WAIVER.expectedNodes);
      if (!sameSet(entry.nodes ?? [], waivedPaths)) {
        reject(
          `${WAIVER.rootPackage} is installed at [${(entry.nodes ?? []).join(", ")}] ` +
            `but the waiver was evidenced against [${waivedPaths.join(", ")}]. ` +
            `The installed graph moved.`
        );
      }
      continue;
    }

    if (advisories.length > 0) {
      reject(
        `${entry.name} (${entry.severity}) carries its own advisory ` +
          `${advisories.map((a) => a.url).join(", ")}, which is not waived.`
      );
    }
    if (!sameSet(carriers, WAIVER.metaChain[entry.name])) {
      reject(
        `${entry.name} (${entry.severity}) is reached through ` +
          `[${carriers.join(", ")}] but the waiver was evidenced against ` +
          `[${WAIVER.metaChain[entry.name].join(", ")}]. The chain has changed.`
      );
    }
  }

  // Second layer: the audit report proved which nodes are vulnerable; the
  // lockfile proves exactly what is installed at them.
  verifyInstalledState(lockfileRaw);

  // Expiry is checked last so a graph problem is reported before a date one.
  const expiry = new Date(`${WAIVER.expiresAt}T00:00:00Z`);
  if (Number.isNaN(expiry.getTime())) {
    reject(`Waiver has an unreadable expiresAt (${WAIVER.expiresAt}).`);
  }
  if (today >= expiry) {
    reject(
      `The waiver for ${WAIVER.advisory} expired on ${WAIVER.expiresAt}.\n` +
        `Owner: ${WAIVER.owner}. Re-verify whether eslint-config-next now ` +
        `resolves onto the patched chain. Renew with fresh evidence, or ` +
        `delete the waiver.`
    );
  }

  return (
    `Production dependency graph: clean.\n` +
    `Full graph: ${findings.length} high advisories, all from the single waived ` +
    `${WAIVER.cve} (${WAIVER.advisory}) in ${WAIVER.rootPackage}, plus the ` +
    `${findings.length - 1} packages that depend on it. Topology matches the ` +
    `evidenced chain exactly, and package-lock.json matches the evidenced ` +
    `installed versions. Waiver expires ${WAIVER.expiresAt}.`
  );
}
