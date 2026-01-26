#!/usr/bin/env bun

/**
 * Setup script for OpenCode Plugin Template
 * Runs automatically after `bun create`
 */

import * as fs from "fs/promises";
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
      if (answer === "") {
        resolve(defaultYes);
      } else {
        resolve(answer === "y" || answer === "yes");
      }
    });
  });
}

async function removeFile(filePath: string) {
  try {
    await fs.unlink(filePath);
    log(`  ✓ Removed ${path.basename(filePath)}`, colors.green);
  } catch (error) {
    // File might not exist, that's ok
  }
}

async function removeDirectory(dirPath: string) {
  try {
    await fs.rm(dirPath, { recursive: true });
    log(`  ✓ Removed ${path.basename(dirPath)}/`, colors.green);
  } catch (error) {
    // Directory might not exist, that's ok
  }
}

async function main() {
  log("\n" + "=".repeat(60));
  log("  OpenCode Plugin Template Setup", colors.cyan);
  log("=".repeat(60) + "\n");

  log("This template includes optional example components.", colors.yellow);
  log("You can remove what you don't need:\n");

  // Ask about each optional component
  const keepAgentTemplate = await promptYesNo("Keep example agent template (.opencode/agent/)?", true);
  const keepSkillTemplate = await promptYesNo("Keep example skill template (.opencode/skill/)?", true);
  const keepToolExample = await promptYesNo("Keep example custom tool (.opencode/tools/)?", true);
  
  log("\nRemoving unwanted components...", colors.cyan);

  // Remove components user doesn't want
  if (!keepAgentTemplate) {
    await removeDirectory(path.join(process.cwd(), ".opencode/agent"));
  }

  if (!keepSkillTemplate) {
    await removeDirectory(path.join(process.cwd(), ".opencode/skill"));
  }

  if (!keepToolExample) {
    await removeDirectory(path.join(process.cwd(), ".opencode/tools"));
  }

  // Clean up setup script and bun-create section from package.json
  log("\nFinalizing setup...", colors.cyan);
  
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
  
  // Remove bun-create section (as per bun create convention)
  delete packageJson.bunCreate;
  
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
  log("  ✓ Cleaned up package.json", colors.green);

  // Remove setup script itself
  await removeFile(path.join(process.cwd(), "setup.ts"));

  log("\n" + "=".repeat(60));
  log("  ✓ Setup Complete!", colors.green);
  log("=".repeat(60) + "\n");

  log("Next steps:", colors.cyan);
  log("  1. Customize .opencode/plugins/ for your plugin logic");
  log("  2. Run: bun install");
  log("  3. Run: bun test");
  log("  4. See QUICKSTART.md for a 5-minute guide\n");

  process.exit(0);
}

main().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, colors.reset);
  process.exit(1);
});
