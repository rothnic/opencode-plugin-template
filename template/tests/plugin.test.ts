/**
 * Plugin Registration Tests
 * 
 * Tests to verify that the plugin structure is correct and can be loaded by OpenCode.
 * These tests ensure that your plugin exports the expected hooks and structure.
 */

import { describe, test, expect, beforeAll } from "bun:test";
import type { PluginContext } from "../.opencode/plugins/types";

describe("Plugin Structure Tests", () => {
  let plugin: any;
  let mockContext: PluginContext;

  beforeAll(async () => {
    // Import the plugin
    const pluginModule = await import("../.opencode/plugins/index");
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

  test("plugin should be a function", () => {
    expect(typeof plugin).toBe("function");
  });

  test("plugin should return hooks object when called", async () => {
    const hooks = await plugin(mockContext);
    expect(typeof hooks).toBe("object");
    expect(hooks).not.toBeNull();
  });

  test("plugin should export session hooks", async () => {
    const hooks = await plugin(mockContext);
    
    expect(typeof hooks["session.create"]).toBe("function");
    expect(typeof hooks["session.complete"]).toBe("function");
  });

  test("plugin should export tool hooks", async () => {
    const hooks = await plugin(mockContext);
    
    expect(typeof hooks["tool.execute.before"]).toBe("function");
    expect(typeof hooks["tool.execute.after"]).toBe("function");
  });

  test("plugin should export message hooks", async () => {
    const hooks = await plugin(mockContext);
    
    expect(typeof hooks["message.create"]).toBe("function");
    expect(typeof hooks["message.complete"]).toBe("function");
  });

  test("plugin should export file operation hooks", async () => {
    const hooks = await plugin(mockContext);
    
    expect(typeof hooks["file.create"]).toBe("function");
    expect(typeof hooks["file.edit"]).toBe("function");
  });

  test("plugin should export permission hook", async () => {
    const hooks = await plugin(mockContext);
    
    expect(typeof hooks["permission.request"]).toBe("function");
  });

  test("all hooks should be async functions", async () => {
    const hooks = await plugin(mockContext);
    
    for (const [hookName, hookFn] of Object.entries(hooks)) {
      expect(typeof hookFn).toBe("function");
      // Call the function and check if it returns a Promise
      const result = (hookFn as Function)({});
      expect(result instanceof Promise).toBe(true);
      await result; // Wait for it to complete
    }
  });
});

describe("Plugin Hook Behavior Tests", () => {
  let hooks: any;
  let mockContext: PluginContext;

  beforeAll(async () => {
    mockContext = {
      project: { name: "test-project", path: "/test/path" },
      client: {},
      $: async (cmd: string) => ({ stdout: "", stderr: "", exitCode: 0 }),
      directory: "/test/directory",
      worktree: { branch: "main", commit: "abc123" },
    };

    const pluginModule = await import("../.opencode/plugins/index");
    hooks = await pluginModule.MyPlugin(mockContext);
  });

  test("tool.execute.before should block dangerous commands", async () => {
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

  test("session.create hook should execute without errors", async () => {
    await expect(hooks["session.create"]({})).resolves.not.toThrow();
  });

  test("session.complete hook should execute without errors", async () => {
    await expect(hooks["session.complete"]({})).resolves.not.toThrow();
  });
});

describe("Plugin Context Tests", () => {
  test("plugin should receive and use context correctly", async () => {
    const pluginModule = await import("../.opencode/plugins/index");
    
    const customContext: PluginContext = {
      project: {
        name: "my-project",
        path: "/custom/path",
      },
      client: { custom: "client" },
      $: async (cmd: string) => ({ stdout: "test", stderr: "", exitCode: 0 }),
      directory: "/custom/directory",
      worktree: {
        branch: "develop",
        commit: "xyz789",
      },
    };

    const hooks = await pluginModule.MyPlugin(customContext);
    
    expect(hooks).toBeDefined();
    expect(typeof hooks).toBe("object");
  });
});
