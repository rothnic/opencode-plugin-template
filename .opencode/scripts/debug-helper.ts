/**
 * Debug Helper Script
 * 
 * Utilities for debugging the OpenCode plugin.
 * Agents can discover and use this script via: @.opencode/scripts/debug-helper.ts
 */

export interface DebugInfo {
  timestamp: string;
  pluginVersion: string;
  environment: string;
  config: Record<string, unknown>;
}

/**
 * Collect debug information about the plugin environment
 */
export async function collectDebugInfo(): Promise<DebugInfo> {
  const packageJson = await import("../../package.json");
  
  return {
    timestamp: new Date().toISOString(),
    pluginVersion: packageJson.version,
    environment: process.env.NODE_ENV || "development",
    config: {
      cwd: process.cwd(),
      platform: process.platform,
      nodeVersion: process.version,
    },
  };
}

/**
 * Log debug information in a formatted way
 */
export function logDebugInfo(info: DebugInfo): void {
  console.log("=== Debug Information ===");
  console.log(`Timestamp: ${info.timestamp}`);
  console.log(`Plugin Version: ${info.pluginVersion}`);
  console.log(`Environment: ${info.environment}`);
  console.log("Config:", JSON.stringify(info.config, null, 2));
  console.log("========================");
}

/**
 * Check if plugin components are properly set up
 */
export async function checkPluginSetup(): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if plugin files exist
  const fs = await import("fs/promises");
  const path = await import("path");

  const requiredFiles = [
    ".opencode/plugins/index.ts",
    ".opencode/tools/example-tool.ts",
    "package.json",
    "opencode.json",
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    try {
      await fs.access(filePath);
    } catch {
      errors.push(`Missing required file: ${file}`);
    }
  }

  // Check for optional directories
  const optionalDirs = [".opencode/agent", ".opencode/skill", ".opencode/scripts"];

  for (const dir of optionalDirs) {
    const dirPath = path.join(process.cwd(), dir);
    try {
      await fs.access(dirPath);
    } catch {
      warnings.push(`Optional directory not found: ${dir}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Main function when run directly
 */
if (import.meta.main) {
  const info = await collectDebugInfo();
  logDebugInfo(info);

  console.log("\nChecking plugin setup...");
  const setup = await checkPluginSetup();

  if (setup.errors.length > 0) {
    console.error("\n❌ Errors found:");
    setup.errors.forEach((err) => console.error(`  - ${err}`));
  }

  if (setup.warnings.length > 0) {
    console.warn("\n⚠️  Warnings:");
    setup.warnings.forEach((warn) => console.warn(`  - ${warn}`));
  }

  if (setup.valid) {
    console.log("\n✅ Plugin setup is valid!");
  }

  process.exit(setup.valid ? 0 : 1);
}
