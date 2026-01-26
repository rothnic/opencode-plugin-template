#!/usr/bin/env bun

/**
 * Setup script for OpenCode Plugin Template
 * 
 * This script runs after `bun create` to initialize the plugin project.
 * It prompts for plugin details and configures the project accordingly.
 */

import { $ } from "bun";
import * as fs from "fs/promises";
import * as path from "path";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function prompt(question: string, defaultValue?: string): Promise<string> {
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  process.stdout.write(`${colors.cyan}${question}${suffix}: ${colors.reset}`);
  
  const buf = Buffer.alloc(1024);
  const bytesRead = await new Promise<number>((resolve) => {
    process.stdin.once("readable", () => {
      const chunk = process.stdin.read();
      if (chunk) {
        buf.write(chunk.toString());
        resolve(chunk.length);
      } else {
        resolve(0);
      }
    });
  });
  
  const answer = buf.toString("utf-8", 0, bytesRead).trim();
  return answer || defaultValue || "";
}

async function updatePackageJson(pluginName: string, description: string, author: string) {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
  
  packageJson.name = pluginName;
  packageJson.description = description;
  packageJson.author = author;
  
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
  log("✓ Updated package.json", colors.green);
}

async function updateOpencodeJson(pluginName: string) {
  const opencodeJsonPath = path.join(process.cwd(), "opencode.json");
  const opencodeJson = JSON.parse(await fs.readFile(opencodeJsonPath, "utf-8"));
  
  opencodeJson.plugin = [pluginName];
  
  await fs.writeFile(opencodeJsonPath, JSON.stringify(opencodeJson, null, 2) + "\n");
  log("✓ Updated opencode.json", colors.green);
}

async function updateReadme(pluginName: string, description: string) {
  const readmePath = path.join(process.cwd(), "README.md");
  let readme = await fs.readFile(readmePath, "utf-8");
  
  readme = readme.replace(/opencode-plugin-template/g, pluginName);
  readme = readme.replace(
    /A template repository for quickly creating OpenCode plugins with best practices/,
    description
  );
  
  await fs.writeFile(readmePath, readme);
  log("✓ Updated README.md", colors.green);
}

async function installDependencies() {
  log("\nInstalling dependencies...", colors.cyan);
  await $`bun install`.quiet();
  log("✓ Dependencies installed", colors.green);
}

async function setupGitHooks() {
  log("\nSetting up git hooks...", colors.cyan);
  try {
    await $`bun run prepare`.quiet();
    log("✓ Git hooks configured", colors.green);
  } catch (error) {
    log("⚠ Could not setup git hooks (not a git repository?)", colors.yellow);
  }
}

async function main() {
  log("\n" + "=".repeat(60), colors.bright);
  log("  OpenCode Plugin Template Setup", colors.bright + colors.cyan);
  log("=".repeat(60) + "\n", colors.bright);

  log("Let's configure your new OpenCode plugin!\n", colors.blue);

  // Get plugin details
  const pluginName = await prompt("Plugin name", "my-opencode-plugin");
  const description = await prompt(
    "Description",
    "An OpenCode plugin with best practices"
  );
  const author = await prompt("Author", "");

  log("\nConfiguring plugin...", colors.cyan);

  // Update configuration files
  await updatePackageJson(pluginName, description, author);
  await updateOpencodeJson(pluginName);
  await updateReadme(pluginName, description);

  // Install dependencies
  await installDependencies();

  // Setup git hooks
  await setupGitHooks();

  // Success message
  log("\n" + "=".repeat(60), colors.bright);
  log("  ✓ Setup Complete!", colors.bright + colors.green);
  log("=".repeat(60) + "\n", colors.bright);

  log("Next steps:", colors.cyan);
  log("  1. Customize your plugin in .opencode/plugins/", colors.reset);
  log("  2. Add custom tools in .opencode/tools/", colors.reset);
  log("  3. Create agents in .opencode/agent/*.md", colors.reset);
  log("  4. Create skills in .opencode/skill/*.md", colors.reset);
  log("  5. Run tests: bun test", colors.reset);
  log("  6. Build: bun run build", colors.reset);

  log("\nDocumentation:", colors.cyan);
  log("  - QUICKSTART.md - 5-minute getting started guide", colors.reset);
  log("  - PLUGIN_BEST_PRACTICES.md - Detailed best practices", colors.reset);
  log("  - BEST_PRACTICES.md - General development practices", colors.reset);
  log("  - REFERENCE.md - Complete API reference", colors.reset);

  log("\nHappy coding! 🚀\n", colors.green);
}

main().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, colors.reset);
  process.exit(1);
});
