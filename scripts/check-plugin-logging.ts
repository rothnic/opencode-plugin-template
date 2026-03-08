#!/usr/bin/env bun

type Mode = "warn" | "block";

const mode = (process.argv[2] === "block" ? "block" : "warn") satisfies Mode;
const root = process.argv[3] || ".";
const patterns = [
  "index.ts",
  ".opencode/plugins/**/*.ts",
  ".opencode/plugins/**/*.tsx",
  ".opencode/plugins/**/*.js",
  ".opencode/plugins/**/*.jsx",
  ".opencode/plugins/**/*.mts",
  ".opencode/plugins/**/*.cts",
  ".opencode/tools/**/*.ts",
  ".opencode/tools/**/*.tsx",
  ".opencode/tools/**/*.js",
  ".opencode/tools/**/*.jsx",
  ".opencode/tools/**/*.mts",
  ".opencode/tools/**/*.cts",
];
// Match direct console logging in the forms `console.log(...)` and
// `console["log"](...)`, allowing whitespace between the console receiver,
// method selection, and opening parenthesis.
const directConsoleCallPattern =
  /\bconsole\s*(?:\.\s*(?:debug|info|log|warn|error)|\[\s*["'](?:debug|info|log|warn|error)["']\s*\])\s*\(/gm;

interface Violation {
  file: string;
  line: number;
  snippet: string;
}

function getLineNumber(lines: string[], offset: number) {
  let characterCount = 0;

  for (const [index, line] of lines.entries()) {
    characterCount += line.length + 1;
    if (characterCount > offset) {
      return index + 1;
    }
  }

  return lines.length;
}

async function collectFiles() {
  const files = new Set<string>();

  for (const pattern of patterns) {
    const glob = new Bun.Glob(pattern);
    for await (const file of glob.scan({ cwd: root, onlyFiles: true, dot: true })) {
      files.add(file);
    }
  }

  return [...files].sort();
}

async function findViolations() {
  const violations: Violation[] = [];

  for (const file of await collectFiles()) {
    const contents = await Bun.file(`${root}/${file}`).text();
    const matches = [...contents.matchAll(directConsoleCallPattern)];
    if (matches.length === 0) continue;

    const lines = contents.split("\n");

    for (const match of matches) {
      const line = getLineNumber(lines, match.index ?? 0);
      violations.push({
        file,
        line,
        snippet: lines[line - 1]?.trim() ?? "console call",
      });
    }
  }

  return violations;
}

function printViolations(violations: Violation[]) {
  const headline =
    mode === "warn"
      ? "Warning: direct console logging found in plugin code."
      : "Direct console logging is blocked in plugin code.";

  console.error(headline);
  console.error("Use the Logger helper so logging stays consistent with client.app.log().");
  console.error("If you need extra destinations, extend the Logger rather than calling console directly.\n");

  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line}`);
    console.error(`  ${violation.snippet}`);
  }
}

const violations = await findViolations();

if (violations.length > 0) {
  printViolations(violations);

  if (mode === "block") {
    process.exit(1);
  }
}
