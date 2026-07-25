import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import {
  WAIVER,
  AuditPolicyError,
  evaluateAudit,
  interpretAuditInvocation,
} from "../../scripts/audit-policy.mjs";

// The dependency gate is itself a security control, so it is tested the way
// a control should be: overwhelmingly by proving it REJECTS. A gate that has
// only been shown to pass has not been shown to gate anything.

const CLEAN = JSON.stringify({
  auditReportVersion: 2,
  vulnerabilities: {},
  metadata: {},
});

// Real captured npm output, not a hand-written approximation of the schema:
// tests built only against an imagined shape prove nothing about the shape
// npm actually emits.
const realFull = readFileSync(
  join(process.cwd(), "tests/fixtures/npm-audit-full.json"),
  "utf8"
);
const realProduction = readFileSync(
  join(process.cwd(), "tests/fixtures/npm-audit-production.json"),
  "utf8"
);

const BEFORE_EXPIRY = new Date("2026-07-26T00:00:00Z");

// The real lockfile is the installed-state oracle, alongside the real audit
// report as the vulnerability oracle.
const realLockfile = readFileSync(
  join(process.cwd(), "package-lock.json"),
  "utf8"
);

const lockWith = (packages: Record<string, unknown>) =>
  JSON.stringify({ lockfileVersion: 3, packages });

const matchingLock = () =>
  lockWith(
    Object.fromEntries(
      Object.entries(WAIVER.expectedNodes).map(([path, version]) => [
        path,
        { version },
      ])
    )
  );

const report = (vulns: Record<string, unknown>) =>
  JSON.stringify({ auditReportVersion: 2, vulnerabilities: vulns, metadata: {} });

const root = (overrides: Record<string, unknown> = {}) => ({
  name: "brace-expansion",
  severity: WAIVER.expectedSeverity,
  isDirect: false,
  range: WAIVER.expectedRange,
  nodes: Object.keys(WAIVER.expectedNodes),
  via: [
    {
      source: 1,
      url: WAIVER.advisory,
      severity: WAIVER.expectedSeverity,
      cvss: { score: 7.5, vectorString: WAIVER.expectedCvssVector },
    },
  ],
  ...overrides,
});

const meta = (name: string, carriers: string[]) => ({
  name,
  severity: "high",
  isDirect: false,
  via: carriers,
});

// The exact topology the waiver was evidenced against
function waivedTree(overrides: Record<string, unknown> = {}) {
  const tree: Record<string, unknown> = { "brace-expansion": root() };
  for (const [name, carriers] of Object.entries(WAIVER.metaChain)) {
    tree[name] = meta(name, carriers as string[]);
  }
  return report({ ...tree, ...overrides });
}

const evaluate = (
  fullRaw: string,
  shippedRaw = CLEAN,
  lockfileRaw = matchingLock()
) => evaluateAudit({ shippedRaw, fullRaw, lockfileRaw, today: BEFORE_EXPIRY });

describe("dependency audit policy", () => {
  it("admits the waived advisory on its evidenced topology", () => {
    const summary = evaluate(waivedTree());
    expect(summary).toContain("Production dependency graph: clean");
    expect(summary).toContain(WAIVER.cve);
  });

  it("admits the real captured npm audit output", () => {
    const summary = evaluateAudit({
      shippedRaw: realProduction,
      fullRaw: realFull,
      lockfileRaw: realLockfile,
      today: BEFORE_EXPIRY,
    });
    expect(summary).toContain("Topology matches the evidenced chain exactly");
    expect(summary).toContain("package-lock.json matches");
  });

  describe("production graph has no waiver", () => {
    it("rejects any high or critical advisory that ships", () => {
      expect(() =>
        evaluate(
          waivedTree(),
          report({
            next: {
              name: "next",
              severity: "critical",
              isDirect: true,
              via: [{ source: 3, url: "https://example.test/GHSA-prod" }],
            },
          })
        )
      ).toThrow(/PRODUCTION dependency graph/);
    });
  });

  describe("the waiver is scoped to an advisory, not a package or severity", () => {
    it("rejects a new unrelated advisory in the dev toolchain", () => {
      expect(() =>
        evaluate(
          waivedTree({
            "evil-build-tool": {
              name: "evil-build-tool",
              severity: "critical",
              isDirect: true,
              via: [{ source: 2, url: "https://example.test/GHSA-rce" }],
            },
          })
        )
      ).toThrow(/topology has changed[\s\S]*evil-build-tool/);
    });

    it("rejects a DIFFERENT advisory in the waived package", () => {
      expect(() =>
        evaluate(
        waivedTree({
          "brace-expansion": root({
            via: [
              {
                source: 1,
                url: "https://example.test/GHSA-other",
                severity: "high",
                cvss: { vectorString: WAIVER.expectedCvssVector },
              },
            ],
          }),
        })
      )
      ).toThrow(/does not carry exactly the waived advisory/);
    });

    it("rejects a second advisory riding alongside the waived one", () => {
      const doubled = root({
        via: [
          {
            source: 1,
            url: WAIVER.advisory,
            severity: "high",
            cvss: { vectorString: WAIVER.expectedCvssVector },
          },
          { source: 7, url: "https://example.test/GHSA-extra", severity: "high" },
        ],
      });
      expect(() => evaluate(waivedTree({ "brace-expansion": doubled }))).toThrow(
        /does not carry exactly the waived advisory/
      );
    });

    it("rejects a waived-chain package that grows its own advisory", () => {
      expect(() =>
        evaluate(
          waivedTree({
            minimatch: {
              name: "minimatch",
              severity: "high",
              isDirect: false,
              via: [{ source: 8, url: "https://example.test/GHSA-minimatch" }],
            },
          })
        )
      ).toThrow(/carries its own advisory/);
    });
  });

  describe("the topology is exact in both directions", () => {
    it("rejects a package outside the evidenced chain", () => {
      expect(() =>
        evaluate(waivedTree({ webpack: meta("webpack", ["minimatch"]) }))
      ).toThrow(/topology has changed[\s\S]*webpack/);
    });

    it("rejects an expected finding going missing", () => {
      const tree = JSON.parse(waivedTree());
      delete tree.vulnerabilities["eslint-plugin-react"];
      expect(() => evaluate(JSON.stringify(tree))).toThrow(
        /expected findings now absent[\s\S]*eslint-plugin-react/
      );
    });

    it("rejects a package reached through an unexpected carrier", () => {
      expect(() =>
        evaluate(waivedTree({ eslint: meta("eslint", ["some-new-package"]) }))
      ).toThrow(/chain has changed/);
    });

    it("rejects a package reached through FEWER carriers than evidenced", () => {
      // A subset check would pass this; the graph has still moved
      expect(() =>
        evaluate(waivedTree({ eslint: meta("eslint", ["minimatch"]) }))
      ).toThrow(/chain has changed/);
    });
  });

  describe("malformed records fail closed rather than dropping out", () => {
    it("rejects an entry with no severity", () => {
      expect(() =>
        evaluate(waivedTree({ mystery: { name: "mystery", via: ["minimatch"] } }))
      ).toThrow(/unrecognized severity/);
    });

    it("rejects an entry with an unknown severity value", () => {
      expect(() =>
        evaluate(
          waivedTree({
            mystery: { name: "mystery", severity: "catastrophic", via: [] },
          })
        )
      ).toThrow(/unrecognized severity/);
    });

    it("rejects a null via", () => {
      expect(() =>
        evaluate(
          waivedTree({ mystery: { name: "mystery", severity: "high", via: null } })
        )
      ).toThrow(/malformed "via"/);
    });

    it("rejects a via member that is neither carrier nor advisory", () => {
      expect(() =>
        evaluate(
          waivedTree({
            mystery: { name: "mystery", severity: "high", via: [{ nope: true }] },
          })
        )
      ).toThrow(/neither a package name nor an advisory/);
    });

    it("rejects an entry whose key disagrees with its name", () => {
      expect(() =>
        evaluate(
          waivedTree({
            minimatch: { name: "something-else", severity: "high", via: ["brace-expansion"] },
          })
        )
      ).toThrow(/disagrees with its own name/);
    });

    it("rejects a non-object entry", () => {
      expect(() => evaluate(waivedTree({ mystery: "not an object" }))).toThrow(
        /is not an object/
      );
    });

    it("fails closed on unparseable output", () => {
      expect(() => evaluate("not json at all {{{")).toThrow(AuditPolicyError);
    });

    it("fails closed on an audit schema it does not understand", () => {
      expect(() =>
        evaluate(JSON.stringify({ auditReportVersion: 3, vulnerabilities: {} }))
      ).toThrow(/Unrecognized audit report version/);
    });

    it("fails closed when the vulnerabilities map is missing", () => {
      expect(() =>
        evaluate(JSON.stringify({ auditReportVersion: 2, metadata: {} }))
      ).toThrow(/no vulnerabilities map/);
    });

    it("fails closed on empty output", () => {
      expect(() => evaluate("")).toThrow(/produced no report/);
    });
  });

  describe("the waiver cannot outlive its justification", () => {
    it("fails once the advisory is gone, demanding the waiver be deleted", () => {
      // Passing here would leave a dormant waiver in source that silently
      // re-activates if the same advisory ever returns
      expect(() => evaluate(CLEAN)).toThrow(/Delete the waiver/);
    });

    it("fails after the expiry date", () => {
      expect(() =>
        evaluateAudit({
          shippedRaw: CLEAN,
          fullRaw: waivedTree(),
          lockfileRaw: matchingLock(),
          today: new Date("2027-01-01T00:00:00Z"),
        })
      ).toThrow(/expired on/);
    });

    it("carries an owner and an acceptance date for the record", () => {
      expect(WAIVER.owner).toBeTruthy();
      expect(WAIVER.acceptedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(WAIVER.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(WAIVER.expiresAt) > new Date(WAIVER.acceptedAt)).toBe(true);
    });
  });

  describe("the accepted RISK, not just the advisory id, is pinned", () => {
    it("rejects the same advisory rescored to critical", () => {
      // Identity and topology are unchanged; the risk is not. Accepting an
      // id must not silently accept whatever that id later becomes.
      const escalated = JSON.parse(waivedTree());
      escalated.vulnerabilities["brace-expansion"].severity = "critical";
      escalated.vulnerabilities["brace-expansion"].via[0].severity = "critical";
      expect(() => evaluate(JSON.stringify(escalated))).toThrow(
        /now critical; the waiver was accepted at high/
      );
    });

    it("rejects a meta package rescored to critical", () => {
      const escalated = JSON.parse(waivedTree());
      escalated.vulnerabilities["eslint"].severity = "critical";
      expect(() => evaluate(JSON.stringify(escalated))).toThrow(
        /eslint is now critical/
      );
    });

    it("rejects a changed CVSS vector", () => {
      expect(() =>
        evaluate(
          waivedTree({
            "brace-expansion": root({
              via: [
                {
                  source: 1,
                  url: WAIVER.advisory,
                  severity: "high",
                  cvss: { vectorString: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" },
                },
              ],
            }),
          })
        )
      ).toThrow(/CVSS vector is now/);
    });

    it("rejects a missing CVSS vector rather than assuming it is unchanged", () => {
      expect(() =>
        evaluate(
          waivedTree({
            "brace-expansion": root({
              via: [{ source: 1, url: WAIVER.advisory, severity: "high" }],
            }),
          })
        )
      ).toThrow(/CVSS vector is now absent/);
    });

    it("rejects a widened affected range", () => {
      expect(() =>
        evaluate(waivedTree({ "brace-expansion": root({ range: "<=6.0.0" }) }))
      ).toThrow(/affected range is now/);
    });

    it("rejects a new installed copy of the vulnerable package", () => {
      // npm aggregates by package, so name equality alone would miss this
      expect(() =>
        evaluate(
          waivedTree({
            "brace-expansion": root({
              nodes: [
                ...Object.keys(WAIVER.expectedNodes),
                "node_modules/somewhere/new/brace-expansion",
              ],
            }),
          })
        )
      ).toThrow(/installed graph moved/);
    });

    it("rejects a vulnerable copy disappearing from a known location", () => {
      expect(() =>
        evaluate(
          waivedTree({
            "brace-expansion": root({ nodes: [Object.keys(WAIVER.expectedNodes)[0]] }),
          })
        )
      ).toThrow(/installed graph moved/);
    });

    it("rejects malformed nodes", () => {
      expect(() =>
        evaluate(waivedTree({ "brace-expansion": root({ nodes: [42] }) }))
      ).toThrow(/malformed "nodes"/);
    });
  });

  describe("the npm adapter fails closed too", () => {
    const ok = (over = {}) => ({ stdout: "{}", status: 0, ...over });

    it("accepts npm's documented vulnerabilities-found exit", () => {
      expect(
        interpretAuditInvocation({ stdout: "{json}", status: 1 }, "test")
      ).toBe("{json}");
    });

    it("accepts a clean exit", () => {
      expect(interpretAuditInvocation(ok(), "test")).toBe("{}");
    });

    it("rejects a process killed by a signal", () => {
      expect(() =>
        interpretAuditInvocation({ stdout: "{}", signal: "SIGKILL" }, "test")
      ).toThrow(/terminated by SIGKILL/);
    });

    it("rejects npm being unavailable", () => {
      expect(() =>
        interpretAuditInvocation(
          { spawnError: "spawn npm ENOENT", status: null },
          "test"
        )
      ).toThrow(/could not be run/);
    });

    it("rejects an undocumented exit code even with output present", () => {
      expect(() =>
        interpretAuditInvocation(
          { stdout: '{"auditReportVersion":2}', status: 137, stderr: "oom" },
          "test"
        )
      ).toThrow(/exited 137/);
    });

    it("rejects empty stdout", () => {
      expect(() =>
        interpretAuditInvocation({ stdout: "", status: 1, stderr: "network" }, "test")
      ).toThrow(/produced no report/);
    });

    it("rejects absent stdout", () => {
      expect(() =>
        interpretAuditInvocation({ status: 1 }, "test")
      ).toThrow(/produced no report/);
    });
  });

  describe("the lockfile is a second, independent installed-state oracle", () => {
    it("rejects a waived node whose installed VERSION moved", () => {
      // The decisive case: the advisory range "<=5.0.7" still covers both
      // 1.1.16 and 5.0.7, so the audit report alone cannot see this move
      const moved = lockWith({
        ...JSON.parse(matchingLock()).packages,
        "node_modules/brace-expansion": { version: "5.0.7" },
      });
      expect(() => evaluate(waivedTree(), CLEAN, moved)).toThrow(
        /installed state changed even though the advisory range did not/
      );
    });

    it("rejects a waived node disappearing from the lockfile", () => {
      const packages = JSON.parse(matchingLock()).packages;
      delete packages["node_modules/brace-expansion"];
      expect(() => evaluate(waivedTree(), CLEAN, lockWith(packages))).toThrow(
        /no longer contains node_modules\/brace-expansion/
      );
    });

    it("fails closed on an unreadable lockfile", () => {
      expect(() => evaluate(waivedTree(), CLEAN, "{{{ not json")).toThrow(
        /not parseable JSON/
      );
    });

    it("fails closed on a lockfile with no packages map", () => {
      expect(() =>
        evaluate(waivedTree(), CLEAN, JSON.stringify({ lockfileVersion: 3 }))
      ).toThrow(/no packages map/);
    });

    it("fails closed on a missing lockfile", () => {
      expect(() => evaluate(waivedTree(), CLEAN, "")).toThrow(
        /could not be read/
      );
    });

    it("agrees with the real lockfile on disk", () => {
      // Guards the waiver's pinned versions against drifting out of sync
      // with the repository they describe
      const lock = JSON.parse(realLockfile);
      for (const [path, version] of Object.entries(WAIVER.expectedNodes)) {
        expect(lock.packages[path]?.version).toBe(version);
      }
    });
  });
});
