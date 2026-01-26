#!/usr/bin/env bun

/**
 * Setup script for OpenCode Plugin Template
 * Runs automatically after `bun create`
 */

import * as fs from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function promptYesNo(question: string, defaultYes = true): Promise<boolean> {
  const suffix = defaultYes ? " [Y/n]" : " [y/N]";
  process.stdout.write(`${colors.cyan}${question}${suffix}: ${colors.reset}`);
  
  return new Promise((resolve) => {
    process.stdin.once("data", (data) => {
      const answer = data.toString().trim().toLowerCase();
      resolve(answer === "" ? defaultYes : (answer === "y" || answer === "yes"));
    });
  });
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

async function main() {
  log("\n" + "=".repeat(60));
  log("  OpenCode Plugin Template Setup", colors.cyan);
  log("=".repeat(60) + "\n");

  const cwd = process.cwd();
  const templateDir = path.join(cwd, "template");
  
  // Get plugin name from directory or prompt
  const dirName = path.basename(cwd);
  const pluginName = dirName.startsWith("opencode-plugin-") 
    ? dirName.substring("opencode-plugin-".length)
    : dirName;
  
  log(`Plugin name: ${pluginName}`, colors.green);

  // Copy template files
  log("\nCopying template files...", colors.cyan);
  const entries = await fs.readdir(templateDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const src = path.join(templateDir, entry.name);
    const dest = path.join(cwd, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(src, dest);
      log(`  ✓ Copied ${entry.name}/`, colors.green);
    } else if (entry.name === "package.json.template") {
      await fs.copyFile(src, path.join(cwd, "package.json"));
      log(`  ✓ Copied package.json`, colors.green);
    } else if (entry.name === ".ls-lint.yml") {
      await fs.copyFile(src, dest);
      log(`  ✓ Installed .ls-lint.yml`, colors.green);
    } else {
      await fs.copyFile(src, dest);
      log(`  ✓ Copied ${entry.name}`, colors.green);
    }
  }

  // Replace {{PLUGIN_NAME}} placeholders in all files
  log("\nConfiguring plugin...", colors.cyan);
  const replaceInFile = async (filePath: string) => {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const updated = content.replace(/\{\{PLUGIN_NAME\}\}/g, pluginName);
      if (content !== updated) {
        await fs.writeFile(filePath, updated);
      }
    } catch (error) {
      // Ignore binary files and permission errors
    }
  };

  // Recursively replace in all text files
  const replaceInDir = async (dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await replaceInDir(fullPath);
      } else if (entry.name.match(/\.(ts|js|json|md|yml|yaml)$/)) {
        await replaceInFile(fullPath);
      }
    }
  };
  
  await replaceInDir(cwd);
  log(`  ✓ Replaced {{PLUGIN_NAME}} with ${pluginName}`, colors.green);

  // Rename the plugin directory from {{PLUGIN_NAME}} to actual plugin name
  const pluginTemplateDir = path.join(cwd, ".opencode/plugins/{{PLUGIN_NAME}}");
  const pluginActualDir = path.join(cwd, ".opencode/plugins", pluginName);
  if (existsSync(pluginTemplateDir)) {
    await fs.rename(pluginTemplateDir, pluginActualDir);
    log(`  ✓ Renamed plugin directory to ${pluginName}`, colors.green);
  }

  // Ask about optional components
  log("\nOptional components:", colors.yellow);
  const keepAgent = await promptYesNo("Keep agent template (.opencode/agent/)?", true);
  const keepSkill = await promptYesNo("Keep skill template (.opencode/skill/)?", true);
  const keepTool = await promptYesNo("Keep tool example (.opencode/tools/)?", true);
  
  log("\nCleaning up...", colors.cyan);

  if (!keepAgent) await fs.rm(path.join(cwd, ".opencode/agent"), { recursive: true }).catch(() => {});
  if (!keepSkill) await fs.rm(path.join(cwd, ".opencode/skill"), { recursive: true }).catch(() => {});
  if (!keepTool) await fs.rm(path.join(cwd, ".opencode/tools"), { recursive: true }).catch(() => {});

  // Clean up package.json
  const pkgPath = path.join(cwd, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
  delete pkg.bunCreate;
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  log("  ✓ Cleaned package.json", colors.green);

  // Remove template dir and setup script
  await fs.rm(templateDir, { recursive: true });
  await fs.unlink(path.join(cwd, "setup.ts"));

  log("\n" + "=".repeat(60));
  log("  ✓ Setup Complete!", colors.green);
  log("=".repeat(60) + "\n");
  log("Next steps:", colors.cyan);
  log("  1. Run: bun install");
  log("  2. See docs/quickstart.md\n");

  process.exit(0);
}

main().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, colors.reset);
  process.exit(1);
});
