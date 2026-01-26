/**
 * Plugin integration tests
 * 
 * Test the full plugin integration with mocked context.
 */

import { describe, test, expect, beforeAll } from "bun:test";
import type { PluginContext } from "../types";

describe("Plugin Integration Tests", () => {
  let plugin: any;
  let mockContext: PluginContext;

  beforeAll(async () => {
    // Import the plugin
    const pluginModule = await import("../index");
    plugin = pluginModule.MyPlugin;

    // Create mock context
    mockContext = {
      project: {
        name: "test-project",
        path: "/test/path",
      },
      client: {},
      $: async (cmd: string) => ({ stdout: "", stderr: "", exitCode: 0 }),
      directory: "/test/directory",
      worktree: {
        branch: "main",
        commit: "abc123",
      },
    };
  });

  test("plugin should initialize and return hooks", async () => {
    const hooks = await plugin(mockContext);
    
    expect(hooks).toBeDefined();
    expect(typeof hooks).toBe("object");
  });

  test("plugin should export all expected hooks", async () => {
    const hooks = await plugin(mockContext);
    
    expect(typeof hooks["session.create"]).toBe("function");
    expect(typeof hooks["session.complete"]).toBe("function");
    expect(typeof hooks["tool.execute.before"]).toBe("function");
    expect(typeof hooks["tool.execute.after"]).toBe("function");
    expect(typeof hooks["message.create"]).toBe("function");
    expect(typeof hooks["message.complete"]).toBe("function");
    expect(typeof hooks["file.create"]).toBe("function");
    expect(typeof hooks["file.edit"]).toBe("function");
    expect(typeof hooks["permission.request"]).toBe("function");
  });

  test("tool.execute.before should block dangerous commands", async () => {
    const hooks = await plugin(mockContext);
    
    const dangerousInput = {
      tool: "bash",
    };
    const dangerousOutput = {
      args: {
        command: "rm -rf /home/user",
      },
    };

    await expect(
      hooks["tool.execute.before"](dangerousInput, dangerousOutput)
    ).rejects.toThrow("Dangerous command blocked");
  });

  test("tool.execute.before should allow safe commands", async () => {
    const hooks = await plugin(mockContext);
    
    const safeInput = {
      tool: "bash",
    };
    const safeOutput = {
      args: {
        command: "ls -la",
      },
    };

    await expect(
      hooks["tool.execute.before"](safeInput, safeOutput)
    ).resolves.not.toThrow();
  });
});
