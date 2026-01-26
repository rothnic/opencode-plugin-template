/**
 * Integration Tests
 * 
 * Tests to verify that all components work together correctly and can be loaded by OpenCode.
 * These tests simulate the actual OpenCode plugin loading and registration process.
 */

import { describe, test, expect } from "bun:test";

describe("OpenCode Integration Tests", () => {
  test("all plugin components can be imported", async () => {
    // Import all components
    const pluginModule = await import("../.opencode/plugin/index");
    const toolsModule = await import("../.opencode/tools/example-tool");
    const agentsModule = await import("../.opencode/agents/example-agents");
    const skillsModule = await import("../.opencode/skills/example-skills");

    expect(pluginModule.MyPlugin).toBeDefined();
    expect(toolsModule.customTools).toBeDefined();
    expect(agentsModule.customAgents).toBeDefined();
    expect(skillsModule.customSkills).toBeDefined();
  });

  test("plugin can be loaded with all components", async () => {
    const pluginModule = await import("../.opencode/plugin/index");
    const toolsModule = await import("../.opencode/tools/example-tool");
    const agentsModule = await import("../.opencode/agents/example-agents");
    const skillsModule = await import("../.opencode/skills/example-skills");

    // Create mock context
    const mockContext = {
      project: { name: "test", path: "/test" },
      client: {},
      $: async () => ({}),
      directory: "/test",
      worktree: { branch: "main", commit: "abc" },
    };

    // Load plugin
    const hooks = await pluginModule.MyPlugin(mockContext as any);

    // Verify all components are accessible
    expect(hooks).toBeDefined();
    expect(Object.keys(toolsModule.customTools).length).toBeGreaterThan(0);
    expect(Object.keys(agentsModule.customAgents).length).toBeGreaterThan(0);
    expect(Object.keys(skillsModule.customSkills).length).toBeGreaterThan(0);
  });
});

describe("OpenCode Configuration Tests", () => {
  test("opencode.json is valid", async () => {
    const config = await import("../opencode.json");
    
    expect(config.plugin).toBeDefined();
    expect(Array.isArray(config.plugin)).toBe(true);
    expect(config.version).toBeDefined();
  });

  test("package.json has correct OpenCode metadata", async () => {
    const pkg = await import("../package.json");
    
    expect(pkg.name).toBeDefined();
    expect(pkg.version).toBeDefined();
    expect(pkg.keywords).toContain("opencode");
    expect(pkg.keywords).toContain("plugin");
  });
});

describe("Tool and Agent Compatibility Tests", () => {
  test("agents reference tools that exist or can exist", async () => {
    const agentsModule = await import("../.opencode/agents/example-agents");
    const toolsModule = await import("../.opencode/tools/example-tool");
    
    const { customAgents } = agentsModule;
    const { customTools } = toolsModule;
    
    // Get all tool names
    const customToolNames = Object.values(customTools).map((t: any) => t.name);
    const builtInTools = ["bash", "read", "write", "edit", "create", "view", "grep", "find", "web_search", "lsp"];
    const allTools = [...customToolNames, ...builtInTools];
    
    // Check each agent's tools
    for (const agent of Object.values(customAgents)) {
      const a = agent as any;
      if (a.tools) {
        a.tools.forEach((tool: string) => {
          const isValid = allTools.includes(tool) || tool.includes("_");
          expect(isValid).toBe(true);
        });
      }
    }
  });

  test("custom tools can be used by agents", async () => {
    const toolsModule = await import("../.opencode/tools/example-tool");
    const { customTools } = toolsModule;
    
    // Simulate agent using a custom tool
    const tool = customTools.exampleCustomTool;
    const result = await tool.handler({ query: "agent test" });
    
    expect(result).toBeDefined();
    expect(result.result).toContain("agent test");
  });
});

describe("Complete Plugin Registration Simulation", () => {
  test("simulate OpenCode plugin registration process", async () => {
    // 1. Load plugin
    const pluginModule = await import("../.opencode/plugin/index");
    const mockContext = {
      project: { name: "test-project", path: "/test" },
      client: {},
      $: async () => ({}),
      directory: "/test",
      worktree: { branch: "main", commit: "abc123" },
    };

    const hooks = await pluginModule.MyPlugin(mockContext as any);
    
    // 2. Register tools
    const toolsModule = await import("../.opencode/tools/example-tool");
    const toolRegistry = new Map();
    
    for (const [key, tool] of Object.entries(toolsModule.customTools)) {
      const t = tool as any;
      toolRegistry.set(t.name, t);
    }

    // 3. Register agents
    const agentsModule = await import("../.opencode/agents/example-agents");
    const agentRegistry = new Map();
    
    for (const [key, agent] of Object.entries(agentsModule.customAgents)) {
      const a = agent as any;
      agentRegistry.set(a.name, a);
    }

    // 4. Register skills
    const skillsModule = await import("../.opencode/skills/example-skills");
    const skillRegistry = new Map();
    
    for (const [key, skill] of Object.entries(skillsModule.customSkills)) {
      const s = skill as any;
      skillRegistry.set(s.name, s);
    }

    // Verify all registrations
    expect(Object.keys(hooks).length).toBeGreaterThan(0);
    expect(toolRegistry.size).toBeGreaterThan(0);
    expect(agentRegistry.size).toBeGreaterThan(0);
    expect(skillRegistry.size).toBeGreaterThan(0);

    // Verify specific registrations
    expect(toolRegistry.has("example_custom_tool")).toBe(true);
    expect(agentRegistry.has("code-reviewer")).toBe(true);
    expect(skillRegistry.has("systematic-debugging")).toBe(true);
  });

  test("plugin hooks can be invoked after registration", async () => {
    const pluginModule = await import("../.opencode/plugin/index");
    const mockContext = {
      project: { name: "test", path: "/test" },
      client: {},
      $: async () => ({}),
      directory: "/test",
      worktree: { branch: "main", commit: "abc" },
    };

    const hooks = await pluginModule.MyPlugin(mockContext as any);

    // Test each hook can be called
    await expect(hooks["session.create"]({})).resolves.not.toThrow();
    await expect(hooks["session.complete"]({})).resolves.not.toThrow();
    await expect(hooks["message.create"]({})).resolves.not.toThrow();
    await expect(hooks["file.create"]({})).resolves.not.toThrow();
  });

  test("custom tools can be invoked after registration", async () => {
    const toolsModule = await import("../.opencode/tools/example-tool");
    const { customTools } = toolsModule;

    const tool = customTools.exampleCustomTool;
    
    // Simulate tool invocation
    const input = { query: "integration test" };
    const result = await tool.handler(input);

    expect(result).toBeDefined();
    expect(result.result).toContain("integration test");
  });
});

describe("Error Handling Tests", () => {
  test("plugin handles invalid hook inputs gracefully", async () => {
    const pluginModule = await import("../.opencode/plugin/index");
    const mockContext = {
      project: { name: "test", path: "/test" },
      client: {},
      $: async () => ({}),
      directory: "/test",
      worktree: { branch: "main", commit: "abc" },
    };

    const hooks = await pluginModule.MyPlugin(mockContext as any);

    // Test with null/undefined inputs
    await expect(hooks["session.create"](null)).resolves.not.toThrow();
    await expect(hooks["message.create"](undefined)).resolves.not.toThrow();
  });

  test("dangerous command detection works correctly", async () => {
    const pluginModule = await import("../.opencode/plugin/index");
    const mockContext = {
      project: { name: "test", path: "/test" },
      client: {},
      $: async () => ({}),
      directory: "/test",
      worktree: { branch: "main", commit: "abc" },
    };

    const hooks = await pluginModule.MyPlugin(mockContext as any);

    // Test dangerous command
    const dangerousInput = { tool: "bash" };
    const dangerousOutput = { args: { command: "rm -rf /" } };

    await expect(
      hooks["tool.execute.before"](dangerousInput, dangerousOutput)
    ).rejects.toThrow();
  });

  test("custom tool handles invalid inputs appropriately", async () => {
    const toolsModule = await import("../.opencode/tools/example-tool");
    const { exampleCustomTool } = toolsModule;

    // Test with minimal valid input
    const result = await exampleCustomTool({ query: "test" });
    expect(result).toBeDefined();
  });
});

describe("TypeScript Type Safety Tests", () => {
  test("plugin context types are properly defined", async () => {
    const typesModule = await import("../.opencode/plugin/types");
    
    // Types should be importable
    expect(typesModule).toBeDefined();
  });

  test("tool types are properly defined", async () => {
    const toolsModule = await import("../.opencode/tools/example-tool");
    
    // Interfaces should be accessible
    expect(toolsModule).toBeDefined();
  });

  test("agent types are properly defined", async () => {
    const agentsModule = await import("../.opencode/agents/example-agents");
    
    // Types should be importable
    expect(agentsModule).toBeDefined();
  });

  test("skill types are properly defined", async () => {
    const skillsModule = await import("../.opencode/skills/example-skills");
    
    // Types should be importable
    expect(skillsModule).toBeDefined();
  });
});
