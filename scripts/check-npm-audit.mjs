#!/usr/bin/env node
// Thin IO shell around scripts/audit-policy.mjs. It runs npm and hands the
// raw subprocess result to the policy; every decision, including how to
// treat a failed invocation, lives in the policy so both can be tested
// adversarially without touching the network.

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  AuditPolicyError,
  evaluateAudit,
  interpretAuditInvocation,
} from "./audit-policy.mjs";

function runAudit(extraArgs, label) {
  const result = spawnSync("npm", ["audit", "--json", ...extraArgs], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return interpretAuditInvocation(
    {
      stdout: result.stdout,
      stderr: result.stderr,
      status: result.status,
      signal: result.signal,
      spawnError: result.error?.message,
    },
    label
  );
}

try {
  console.log(
    evaluateAudit({
      shippedRaw: runAudit(["--omit=dev"], "production dependencies"),
      fullRaw: runAudit([], "full dependency graph"),
      lockfileRaw: readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"),
    })
  );
} catch (error) {
  if (error instanceof AuditPolicyError) {
    console.error(`\nDEPENDENCY AUDIT FAILED\n${error.message}\n`);
    process.exit(1);
  }
  throw error;
}
