/**
 * Custom Agents Configuration Tests
 * 
 * Tests to verify that custom agents are properly configured and can be registered with OpenCode.
 * These tests ensure agents have valid configurations, instructions, and metadata.
 */

import { describe, test, expect, beforeAll } from "bun:test";
import type { AgentConfig } from "../.opencode/agents/example-agents";

describe("Custom Agents Structure Tests", () => {
  let customAgents: any;

  beforeAll(async () => {
    const agentsModule = await import("../.opencode/agents/example-agents");
    customAgents = agentsModule.customAgents;
  });

  test("customAgents should be exported", () => {
    expect(customAgents).toBeDefined();
    expect(typeof customAgents).toBe("object");
  });

  test("customAgents should contain agent definitions", () => {
    expect(Object.keys(customAgents).length).toBeGreaterThan(0);
  });

  test("each agent should have required fields", () => {
    for (const [agentKey, agent] of Object.entries(customAgents)) {
      const a = agent as AgentConfig;
      
      // Required fields
      expect(a.name).toBeDefined();
      expect(typeof a.name).toBe("string");
      expect(a.name.length).toBeGreaterThan(0);
      
      expect(a.description).toBeDefined();
      expect(typeof a.description).toBe("string");
      expect(a.description.length).toBeGreaterThan(0);
      
      expect(a.instructions).toBeDefined();
      expect(typeof a.instructions).toBe("string");
      expect(a.instructions.length).toBeGreaterThan(0);
    }
  });

  test("agent names should follow naming convention", () => {
    for (const [agentKey, agent] of Object.entries(customAgents)) {
      const a = agent as AgentConfig;
      // Agent names should be lowercase with hyphens
      expect(a.name).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  test("agents should have optional model configuration", () => {
    for (const [agentKey, agent] of Object.entries(customAgents)) {
      const a = agent as AgentConfig;
      if (a.model) {
        expect(typeof a.model).toBe("string");
        expect(a.model.length).toBeGreaterThan(0);
      }
    }
  });

  test("agents should have optional tools array", () => {
    for (const [agentKey, agent] of Object.entries(customAgents)) {
      const a = agent as AgentConfig;
      if (a.tools) {
        expect(Array.isArray(a.tools)).toBe(true);
        expect(a.tools.length).toBeGreaterThan(0);
        
        // Each tool should be a string
        a.tools.forEach(tool => {
          expect(typeof tool).toBe("string");
        });
      }
    }
  });

  test("agents should have valid temperature if specified", () => {
    for (const [agentKey, agent] of Object.entries(customAgents)) {
      const a = agent as AgentConfig;
      if (a.temperature !== undefined) {
        expect(typeof a.temperature).toBe("number");
        expect(a.temperature).toBeGreaterThanOrEqual(0);
        expect(a.temperature).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe("Agent Instructions Quality Tests", () => {
  let customAgents: any;

  beforeAll(async () => {
    const agentsModule = await import("../.opencode/agents/example-agents");
    customAgents = agentsModule.customAgents;
  });

  test("agent instructions should be detailed", () => {
    for (const [agentKey, agent] of Object.entries(customAgents)) {
      const a = agent as AgentConfig;
      
      // Instructions should be at least 50 characters
      expect(a.instructions.length).toBeGreaterThan(50);
    }
  });

  test("agent instructions should contain actionable guidance", () => {
    for (const [agentKey, agent] of Object.entries(customAgents)) {
      const a = agent as AgentConfig;
      
      // Instructions should contain common instruction patterns
      const hasNumberedList = /\d+\.\s+/.test(a.instructions);
      const hasBulletPoints = /[-•]\s+/.test(a.instructions);
      const hasDirective = /should|must|always|never/i.test(a.instructions);
      
      expect(hasNumberedList || hasBulletPoints || hasDirective).toBe(true);
    }
  });
});

describe("Specific Agent Tests", () => {
  let codeReviewAgent: AgentConfig;
  let documentationAgent: AgentConfig;

  beforeAll(async () => {
    const agentsModule = await import("../.opencode/agents/example-agents");
    codeReviewAgent = agentsModule.codeReviewAgent;
    documentationAgent = agentsModule.documentationAgent;
  });

  test("code review agent should have appropriate configuration", () => {
    expect(codeReviewAgent.name).toBe("code-reviewer");
    expect(codeReviewAgent.description).toContain("code review");
    expect(codeReviewAgent.instructions).toContain("security");
    expect(codeReviewAgent.model).toBeDefined();
    expect(codeReviewAgent.tools).toBeDefined();
    expect(codeReviewAgent.temperature).toBeLessThan(1); // Should be more deterministic
  });

  test("documentation agent should have appropriate configuration", () => {
    expect(documentationAgent.name).toBe("doc-writer");
    expect(documentationAgent.description).toContain("documentation");
    expect(documentationAgent.instructions).toContain("clear");
    expect(documentationAgent.model).toBeDefined();
    expect(documentationAgent.tools).toBeDefined();
  });

  test("code review agent should include relevant tools", () => {
    const expectedTools = ["grep", "view"];
    const hasRelevantTools = expectedTools.some(tool => 
      codeReviewAgent.tools?.includes(tool)
    );
    expect(hasRelevantTools).toBe(true);
  });

  test("documentation agent should include relevant tools", () => {
    const expectedTools = ["view", "edit", "create"];
    const hasRelevantTools = expectedTools.some(tool => 
      documentationAgent.tools?.includes(tool)
    );
    expect(hasRelevantTools).toBe(true);
  });
});

describe("Agent Registration Verification Tests", () => {
  test("agents can be registered with OpenCode format", async () => {
    const agentsModule = await import("../.opencode/agents/example-agents");
    const customAgents = agentsModule.customAgents;

    // Simulate OpenCode agent registration
    const registeredAgents = new Map();
    
    for (const [key, agent] of Object.entries(customAgents)) {
      const a = agent as AgentConfig;
      registeredAgents.set(a.name, {
        description: a.description,
        instructions: a.instructions,
        model: a.model,
        tools: a.tools,
        temperature: a.temperature,
      });
    }

    expect(registeredAgents.size).toBeGreaterThan(0);
    expect(registeredAgents.has("code-reviewer")).toBe(true);
    expect(registeredAgents.has("doc-writer")).toBe(true);
  });

  test("agent configurations are serializable", async () => {
    const agentsModule = await import("../.opencode/agents/example-agents");
    const customAgents = agentsModule.customAgents;

    for (const [key, agent] of Object.entries(customAgents)) {
      // Should be able to serialize to JSON (important for config files)
      const serialized = JSON.stringify(agent);
      expect(serialized).toBeDefined();
      
      const deserialized = JSON.parse(serialized);
      expect(deserialized.name).toBe((agent as AgentConfig).name);
    }
  });
});

describe("Agent Validation Tests", () => {
  test("all agents have unique names", async () => {
    const agentsModule = await import("../.opencode/agents/example-agents");
    const customAgents = agentsModule.customAgents;

    const names = Object.values(customAgents).map((a: any) => a.name);
    const uniqueNames = new Set(names);
    
    expect(names.length).toBe(uniqueNames.size);
  });

  test("agent tools reference valid tool names", async () => {
    const agentsModule = await import("../.opencode/agents/example-agents");
    const customAgents = agentsModule.customAgents;

    // Common OpenCode tool names
    const validTools = [
      "bash", "read", "write", "edit", "create", "view", 
      "grep", "find", "web_search", "lsp"
    ];

    for (const [key, agent] of Object.entries(customAgents)) {
      const a = agent as AgentConfig;
      if (a.tools) {
        a.tools.forEach(tool => {
          // Tool should either be a known tool or a custom tool (with underscore)
          const isValidTool = validTools.includes(tool) || tool.includes("_");
          expect(isValidTool).toBe(true);
        });
      }
    }
  });
});
