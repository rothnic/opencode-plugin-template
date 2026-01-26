/**
 * Basic test examples for the OpenCode plugin
 * 
 * These tests demonstrate how to test your plugin functionality.
 * Add more tests as you develop your plugin.
 */

import { describe, test, expect } from "bun:test";

describe("Plugin Tests", () => {
  test("example test - should pass", () => {
    expect(true).toBe(true);
  });

  test("version format", () => {
    const packageJson = require("./package.json");
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe("Version Bump Utility", () => {
  test("parseVersion - should parse version string correctly", () => {
    const parseVersion = (version: string): [number, number, number] => {
      const parts = version.split(".").map(Number);
      return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
    };

    expect(parseVersion("1.2.3")).toEqual([1, 2, 3]);
    expect(parseVersion("0.1.0")).toEqual([0, 1, 0]);
  });

  test("bumpVersion - should bump patch version", () => {
    const bumpVersion = (version: string, type: "major" | "minor" | "patch"): string => {
      const [major, minor, patch] = version.split(".").map(Number);
      
      switch (type) {
        case "major":
          return `${major + 1}.0.0`;
        case "minor":
          return `${major}.${minor + 1}.0`;
        case "patch":
          return `${major}.${minor}.${patch + 1}`;
      }
    };

    expect(bumpVersion("1.2.3", "patch")).toBe("1.2.4");
    expect(bumpVersion("1.2.3", "minor")).toBe("1.3.0");
    expect(bumpVersion("1.2.3", "major")).toBe("2.0.0");
  });
});

describe("Hook Validation", () => {
  test("should validate dangerous command patterns", () => {
    const DANGEROUS_PATTERNS = [
      /rm\s+-rf\s+\//,
      /mkfs/,
      /dd\s+if=/,
    ];

    const isDangerous = (cmd: string): boolean => {
      return DANGEROUS_PATTERNS.some(pattern => pattern.test(cmd));
    };

    expect(isDangerous("rm -rf /")).toBe(true);
    expect(isDangerous("rm file.txt")).toBe(false);
    expect(isDangerous("mkfs /dev/sda1")).toBe(true);
    expect(isDangerous("ls -la")).toBe(false);
  });
});

describe("Tool Configuration", () => {
  test("should have valid tool schema structure", () => {
    const exampleTool = {
      name: "example_tool",
      description: "An example tool",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The query",
          },
        },
        required: ["query"],
      },
    };

    expect(exampleTool.name).toBeTruthy();
    expect(exampleTool.description).toBeTruthy();
    expect(exampleTool.inputSchema.type).toBe("object");
    expect(Array.isArray(exampleTool.inputSchema.required)).toBe(true);
  });
});
