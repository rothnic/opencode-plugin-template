#!/usr/bin/env bun

export {};

const gitCheck = Bun.spawnSync(["git", "rev-parse", "--git-dir"], {
  cwd: process.cwd(),
  stdout: "pipe",
  stderr: "pipe",
});

if (gitCheck.exitCode !== 0) {
  console.log("Skipping lefthook install because this directory is not a Git repository yet.");
  process.exit(0);
}

const lefthook = Bun.which("lefthook");
if (!lefthook) {
  console.warn("Skipping lefthook install because lefthook is not available on PATH.");
  process.exit(0);
}

const install = Bun.spawnSync([lefthook, "install"], {
  cwd: process.cwd(),
  stdout: "inherit",
  stderr: "inherit",
});

process.exit(install.exitCode ?? 0);
