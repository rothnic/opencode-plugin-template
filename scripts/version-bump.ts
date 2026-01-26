#!/usr/bin/env bun

/**
 * Version Bump Script
 * 
 * This script helps manage version bumping across multiple files
 * in the OpenCode plugin template.
 * 
 * Usage: bun run version:bump [major|minor|patch]
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";

type VersionType = "major" | "minor" | "patch";

interface PackageJson {
  version: string;
  [key: string]: any;
}

interface OpenCodeJson {
  version: string;
  [key: string]: any;
}

/**
 * Parse semantic version string
 */
function parseVersion(version: string): [number, number, number] {
  const parts = version.split(".").map(Number);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

/**
 * Bump version based on type
 */
function bumpVersion(version: string, type: VersionType): string {
  const [major, minor, patch] = parseVersion(version);

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid version type: ${type}`);
  }
}

/**
 * Update version in file
 */
async function updateVersionInFile(
  filePath: string,
  newVersion: string
): Promise<void> {
  try {
    const content = await readFile(filePath, "utf-8");
    const json = JSON.parse(content);
    json.version = newVersion;
    await writeFile(filePath, JSON.stringify(json, null, 2) + "\n");
    console.log(`✅ Updated ${filePath} to version ${newVersion}`);
  } catch (error) {
    console.error(`❌ Failed to update ${filePath}:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const versionType = (args[0] || "patch") as VersionType;

  if (!["major", "minor", "patch"].includes(versionType)) {
    console.error(
      "❌ Invalid version type. Use: major, minor, or patch"
    );
    process.exit(1);
  }

  const rootDir = process.cwd();
  const packageJsonPath = join(rootDir, "package.json");
  const openCodeJsonPath = join(rootDir, "opencode.json");

  try {
    // Read current version from package.json
    const packageJson: PackageJson = JSON.parse(
      await readFile(packageJsonPath, "utf-8")
    );
    const currentVersion = packageJson.version;
    const newVersion = bumpVersion(currentVersion, versionType);

    console.log(`📦 Bumping version: ${currentVersion} → ${newVersion}`);
    console.log(`📝 Version type: ${versionType}\n`);

    // Update package.json
    await updateVersionInFile(packageJsonPath, newVersion);

    // Update opencode.json if it exists
    try {
      await updateVersionInFile(openCodeJsonPath, newVersion);
    } catch (error) {
      console.warn("⚠️  opencode.json not found or invalid, skipping...");
    }

    console.log(`\n✨ Version bump complete!`);
    console.log(`\nNext steps:`);
    console.log(`  1. Review the changes: git diff`);
    console.log(`  2. Commit: git commit -am "chore: bump version to ${newVersion}"`);
    console.log(`  3. Tag: git tag v${newVersion}`);
    console.log(`  4. Push: git push && git push --tags`);
  } catch (error) {
    console.error("\n❌ Version bump failed:", error);
    process.exit(1);
  }
}

main();
