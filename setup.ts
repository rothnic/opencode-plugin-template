#!/usr/bin/env bun

import * as fs from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

function writeLine(message = "", color = colors.reset) {
  output.write(`${color}${message}${colors.reset}\n`);
}

async function copyDirectory(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function replaceInFile(filePath: string, replacements: Record<string, string>) {
  const content = await fs.readFile(filePath, "utf-8");
  let updated = content;

  for (const [key, value] of Object.entries(replacements)) {
    updated = updated.replaceAll(`{{${key}}}`, value);
  }

  if (updated !== content) {
    await fs.writeFile(filePath, updated);
  }
}

async function replaceInDirectory(dir: string, replacements: Record<string, string>) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await replaceInDirectory(fullPath, replacements);
      continue;
    }

    if (entry.name.match(/\.(ts|js|json|md|yml|yaml)$/)) {
      await replaceInFile(fullPath, replacements);
    }
  }
}

function withDefault(answer: string, fallback: string) {
  return answer.trim() || fallback;
}

async function main() {
  writeLine("\n" + "=".repeat(60));
  writeLine("  OpenCode Plugin Template Setup", colors.cyan);
  writeLine("=".repeat(60) + "\n");

  const cwd = process.cwd();
  const templateDir = path.join(cwd, "template");
  const dirName = path.basename(cwd);
  const inferredPluginName = dirName.startsWith("opencode-plugin-")
    ? dirName.slice("opencode-plugin-".length)
    : dirName;

  const nonInteractive = process.env.OPENCODE_TEMPLATE_NONINTERACTIVE === "1";
  const rl = nonInteractive ? null : createInterface({ input, output });

  try {
    const pluginName = nonInteractive
      ? process.env.OPENCODE_TEMPLATE_PLUGIN_NAME || inferredPluginName
      : withDefault(await rl!.question(`${colors.cyan}Plugin package name (${inferredPluginName}): ${colors.reset}`), inferredPluginName);
    const pluginDescription = nonInteractive
      ? process.env.OPENCODE_TEMPLATE_PLUGIN_DESCRIPTION || `OpenCode plugin: ${pluginName}`
      : withDefault(
          await rl!.question(`${colors.cyan}Plugin description (OpenCode plugin: ${pluginName}): ${colors.reset}`),
          `OpenCode plugin: ${pluginName}`,
        );
    const pluginAuthor = nonInteractive
      ? process.env.OPENCODE_TEMPLATE_PLUGIN_AUTHOR || ""
      : withDefault(await rl!.question(`${colors.cyan}Author (): ${colors.reset}`), "");
    const pluginLicense = nonInteractive
      ? process.env.OPENCODE_TEMPLATE_PLUGIN_LICENSE || "MIT"
      : withDefault(await rl!.question(`${colors.cyan}License (MIT): ${colors.reset}`), "MIT");

    writeLine("\nCleaning template-repo files...", colors.cyan);
    for (const repoOnlyPath of ["README.md", "AGENTS.md", "docs", "tests", ".ls-lint.yml", "lefthook.yml", ".github"]) {
      await fs.rm(path.join(cwd, repoOnlyPath), { recursive: true, force: true });
    }

    writeLine("\nCopying template files...", colors.cyan);
    const entries = await fs.readdir(templateDir, { withFileTypes: true });

    for (const entry of entries) {
      const src = path.join(templateDir, entry.name);
      const dest = path.join(cwd, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(src, dest);
        writeLine(`  ✓ Copied ${entry.name}/`, colors.green);
        continue;
      }

      if (entry.name === "package.json.template") {
        await fs.copyFile(src, path.join(cwd, "package.json"));
        writeLine("  ✓ Copied package.json", colors.green);
        continue;
      }

      await fs.copyFile(src, dest);
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

    const pluginTemplateDir = path.join(cwd, ".opencode", "plugins", "{{PLUGIN_NAME}}");
    const pluginActualDir = path.join(cwd, ".opencode", "plugins", pluginName);
    if (existsSync(pluginTemplateDir)) {
      await fs.rename(pluginTemplateDir, pluginActualDir);
      writeLine(`  ✓ Created .opencode/plugins/${pluginName}/`, colors.green);
    }

    writeLine("\nOptional components:", colors.yellow);
    const keepAgent = (
      nonInteractive
        ? process.env.OPENCODE_TEMPLATE_KEEP_AGENT || "y"
        : withDefault(await rl!.question(`${colors.cyan}Keep agent template (.opencode/agent/)? [Y/n]: ${colors.reset}`), "y")
    ).toLowerCase();
    const keepSkill = (
      nonInteractive
        ? process.env.OPENCODE_TEMPLATE_KEEP_SKILL || "y"
        : withDefault(await rl!.question(`${colors.cyan}Keep skill template (.opencode/skill/)? [Y/n]: ${colors.reset}`), "y")
    ).toLowerCase();
    const keepTool = (
      nonInteractive
        ? process.env.OPENCODE_TEMPLATE_KEEP_TOOL || "y"
        : withDefault(await rl!.question(`${colors.cyan}Keep tool example (.opencode/tools/)? [Y/n]: ${colors.reset}`), "y")
    ).toLowerCase();
    const keepState = (
      nonInteractive
        ? process.env.OPENCODE_TEMPLATE_KEEP_STATE || "y"
        : withDefault(await rl!.question(`${colors.cyan}Keep optional config/state helpers? [Y/n]: ${colors.reset}`), "y")
    ).toLowerCase();

    if (!keepAgent.startsWith("y")) await fs.rm(path.join(cwd, ".opencode", "agent"), { recursive: true, force: true });
    if (!keepSkill.startsWith("y")) await fs.rm(path.join(cwd, ".opencode", "skill"), { recursive: true, force: true });
    if (!keepTool.startsWith("y")) await fs.rm(path.join(cwd, ".opencode", "tools"), { recursive: true, force: true });
    if (!keepState.startsWith("y")) {
      await fs.rm(path.join(cwd, ".opencode", "plugins", pluginName, "config"), { recursive: true, force: true });
      await fs.rm(path.join(cwd, ".opencode", "plugins", pluginName, "state"), { recursive: true, force: true });
    }

    const pkgPath = path.join(cwd, "package.json");
    const pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
    delete pkg["bun-create"];
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    await fs.rm(templateDir, { recursive: true, force: true });
    await fs.unlink(path.join(cwd, "setup.ts"));

    writeLine("\n" + "=".repeat(60));
    writeLine("  ✓ Setup Complete", colors.green);
    writeLine("=".repeat(60));
    writeLine(`\nNext steps:\n  1. bun install\n  2. bun test\n  3. Review README.md for local and npm install instructions\n`, colors.cyan);
  } finally {
    rl?.close();
  }
}

main().catch((error) => {
  writeLine(`\nSetup failed: ${error instanceof Error ? error.message : String(error)}`, colors.red);
  process.exit(1);
});
