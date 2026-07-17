import { readFile } from "node:fs/promises";

import { lint } from "@google/design.md/linter";

const report = lint(await readFile(new URL("../DESIGN.md", import.meta.url), "utf8"));

console.log(
  JSON.stringify(
    {
      findings: report.findings,
      summary: report.summary,
    },
    null,
    2
  )
);

if (report.summary.errors > 0) {
  process.exitCode = 1;
}
