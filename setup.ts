#!/usr/bin/env bun

import { mkdir, readdir, rename, rm } from "node:fs/promises";

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

function joinPath(...parts: string[]) {
  return parts
    .filter(Boolean)
    .join("/")
    .replace(/\/{2,}/g, "/");
}

function basename(pathname: string) {
  return pathname.split(/[/\\]+/).filter(Boolean).at(-1) ?? pathname;
}

function writeLine(message = "", color = colors.reset) {
  process.stdout.write(`${color}${message}${colors.reset}\n`);
}

function ask(question: string, fallback: string) {
  const answer = prompt(`${colors.cyan}${question}${colors.reset}`) ?? "";
  return answer.trim() || fallback;
}

async function copyDirectory(src: string, dest: string) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = joinPath(src, entry.name);
    const destPath = joinPath(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await Bun.write(destPath, Bun.file(srcPath));
    }
  }
}

async function replaceInFile(filePath: string, replacements: Record<string, string>) {
  const content = await Bun.file(filePath).text();
  let updated = content;

  for (const [key, value] of Object.entries(replacements)) {
    updated = updated.replaceAll(`{{${key}}}`, value);
  }

  if (updated !== content) {
    await Bun.write(filePath, updated);
  }
}

async function replaceInDirectory(dir: string, replacements: Record<string, string>) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = joinPath(dir, entry.name);
    if (entry.isDirectory()) {
      await replaceInDirectory(fullPath, replacements);
      continue;
    }

    if (entry.name.match(/\.(ts|js|json|md|yml|yaml)$/)) {
      await replaceInFile(fullPath, replacements);
    }
  }
}

async function main() {
  writeLine("\n" + "=".repeat(60));
  writeLine("  OpenCode Plugin Template Setup", colors.cyan);
  writeLine("=".repeat(60) + "\n");

  const cwd = process.cwd();
  const templateDir = joinPath(cwd, "template");
  const dirName = basename(cwd);
  const inferredPluginName = dirName.startsWith("opencode-plugin-")
    ? dirName.slice("opencode-plugin-".length)
    : dirName;

  const nonInteractive = process.env.OPENCODE_TEMPLATE_NONINTERACTIVE === "1";

  try {
    const pluginName = nonInteractive
      ? process.env.OPENCODE_TEMPLATE_PLUGIN_NAME || inferredPluginName
      : ask(`Plugin package name (${inferredPluginName}): `, inferredPluginName);
    const pluginDescription = nonInteractive
      ? process.env.OPENCODE_TEMPLATE_PLUGIN_DESCRIPTION || `OpenCode plugin: ${pluginName}`
      : ask(`Plugin description (OpenCode plugin: ${pluginName}): `, `OpenCode plugin: ${pluginName}`);
    const pluginAuthor = nonInteractive
      ? process.env.OPENCODE_TEMPLATE_PLUGIN_AUTHOR || ""
      : ask("Author (): ", "");
    const pluginLicense = nonInteractive
      ? process.env.OPENCODE_TEMPLATE_PLUGIN_LICENSE || "MIT"
      : ask("License (MIT): ", "MIT");

    writeLine("\nCleaning template-repo files...", colors.cyan);
    for (const repoOnlyPath of ["README.md", "AGENTS.md", "docs", "tests", ".ls-lint.yml", "lefthook.yml", ".github"]) {
      await rm(joinPath(cwd, repoOnlyPath), { recursive: true, force: true });
    }

    writeLine("\nCopying template files...", colors.cyan);
    const entries = await readdir(templateDir, { withFileTypes: true });

    for (const entry of entries) {
      const src = joinPath(templateDir, entry.name);
      const dest = joinPath(cwd, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(src, dest);
        writeLine(`  ✓ Copied ${entry.name}/`, colors.green);
        continue;
      }

      if (entry.name === "package.json.template") {
        await Bun.write(joinPath(cwd, "package.json"), Bun.file(src));
        writeLine("  ✓ Copied package.json", colors.green);
        continue;
      }

      await Bun.write(dest, Bun.file(src));
      writeLine(`  ✓ Copied ${entry.name}`, colors.green);
    }

    const replacements = {
      PLUGIN_NAME: pluginName,
      PLUGIN_DESCRIPTION: pluginDescription,
      PLUGIN_AUTHOR: pluginAuthor,
      PLUGIN_LICENSE: pluginLicense,
    };

    writeLine("\nApplying template variables...", colors.cyan);
    await replaceInDirectory(cwd, replacements);
    writeLine("  ✓ Replaced template variables", colors.green);

    const pluginTemplateDir = joinPath(cwd, ".opencode", "plugins", "{{PLUGIN_NAME}}");
    const pluginActualDir = joinPath(cwd, ".opencode", "plugins", pluginName);
    try {
      await rename(pluginTemplateDir, pluginActualDir);
      writeLine(`  ✓ Created .opencode/plugins/${pluginName}/`, colors.green);
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      if (code !== "ENOENT") {
        throw error;
      }
      writeLine("  ! Plugin directory placeholder not found; continuing without rename", colors.yellow);
    }

    writeLine("\nOptional components:", colors.yellow);
    const keepAgent = (
      nonInteractive
        ? process.env.OPENCODE_TEMPLATE_KEEP_AGENT || "y"
        : ask("Keep agent template (.opencode/agents/)? [Y/n]: ", "y")
    ).toLowerCase();
    const keepSkill = (
      nonInteractive
        ? process.env.OPENCODE_TEMPLATE_KEEP_SKILL || "y"
        : ask("Keep skill template (.opencode/skills/)? [Y/n]: ", "y")
    ).toLowerCase();
    const keepCommand = (
      nonInteractive
        ? process.env.OPENCODE_TEMPLATE_KEEP_COMMAND || "y"
        : ask("Keep command template (.opencode/commands/)? [Y/n]: ", "y")
    ).toLowerCase();
    const keepTool = (
      nonInteractive
        ? process.env.OPENCODE_TEMPLATE_KEEP_TOOL || "y"
        : ask("Keep tool example (.opencode/tools/)? [Y/n]: ", "y")
    ).toLowerCase();
    const keepState = (
      nonInteractive
        ? process.env.OPENCODE_TEMPLATE_KEEP_STATE || "y"
        : ask("Keep optional config/state helpers? [Y/n]: ", "y")
    ).toLowerCase();
    const keepDatabase = (
      nonInteractive
        ? process.env.OPENCODE_TEMPLATE_KEEP_DATABASE || "y"
        : ask("Keep optional Bun SQLite helper? [Y/n]: ", "y")
    ).toLowerCase();

    if (!keepAgent.startsWith("y")) await rm(joinPath(cwd, ".opencode", "agents"), { recursive: true, force: true });
    if (!keepSkill.startsWith("y")) await rm(joinPath(cwd, ".opencode", "skills"), { recursive: true, force: true });
    if (!keepCommand.startsWith("y")) await rm(joinPath(cwd, ".opencode", "commands"), { recursive: true, force: true });
    if (!keepTool.startsWith("y")) await rm(joinPath(cwd, ".opencode", "tools"), { recursive: true, force: true });
    if (!keepState.startsWith("y")) {
      await rm(joinPath(cwd, ".opencode", "plugins", pluginName, "config"), { recursive: true, force: true });
      await rm(joinPath(cwd, ".opencode", "plugins", pluginName, "state"), { recursive: true, force: true });
    }
    if (!keepDatabase.startsWith("y")) {
      await rm(joinPath(cwd, ".opencode", "plugins", pluginName, "database"), { recursive: true, force: true });
    }

    const pkgPath = joinPath(cwd, "package.json");
    const pkg = (await Bun.file(pkgPath).json()) as Record<string, unknown>;
    delete pkg["bun-create"];
    await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    await rm(templateDir, { recursive: true, force: true });
    await Bun.file(joinPath(cwd, "setup.ts")).delete();

    writeLine("\n" + "=".repeat(60));
    writeLine("  ✓ Setup Complete", colors.green);
    writeLine("=".repeat(60));
    writeLine(`\nNext steps:\n  1. bun install\n  2. bun test\n  3. Review README.md for local and npm install instructions\n`, colors.cyan);
  } finally {
    // No interactive resources to close when using Bun's built-in prompt().
  }
}

main().catch((error) => {
  writeLine(`\nSetup failed: ${error instanceof Error ? error.message : String(error)}`, colors.red);
  process.exit(1);
});
