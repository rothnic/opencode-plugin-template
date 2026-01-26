/**
 * Custom Tools Registration Tests
 * 
 * Tests to verify that custom tools are properly structured and can be registered with OpenCode.
 * These tests ensure tools have correct schemas, handlers, and metadata.
 */

import { describe, test, expect, beforeAll } from "bun:test";

describe("Custom Tools Structure Tests", () => {
  let customTools: any;

  beforeAll(async () => {
    const toolsModule = await import("../.opencode/tools/example-tool");
    customTools = toolsModule.customTools;
  });

  test("customTools should be exported", () => {
    expect(customTools).toBeDefined();
    expect(typeof customTools).toBe("object");
  });

  test("customTools should contain tool definitions", () => {
    expect(Object.keys(customTools).length).toBeGreaterThan(0);
  });

  test("each tool should have required fields", () => {
    for (const [toolKey, tool] of Object.entries(customTools)) {
      const t = tool as any;
      
      // Required fields
      expect(t.name).toBeDefined();
      expect(typeof t.name).toBe("string");
      
      expect(t.description).toBeDefined();
      expect(typeof t.description).toBe("string");
      
      expect(t.inputSchema).toBeDefined();
      expect(typeof t.inputSchema).toBe("object");
      
      expect(t.handler).toBeDefined();
      expect(typeof t.handler).toBe("function");
    }
  });

  test("tool names should follow naming convention", () => {
    for (const [toolKey, tool] of Object.entries(customTools)) {
      const t = tool as any;
      // Tool names should be lowercase with underscores
      expect(t.name).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });

  test("tool input schemas should be valid JSON Schema", () => {
    for (const [toolKey, tool] of Object.entries(customTools)) {
      const t = tool as any;
      const schema = t.inputSchema;
      
      expect(schema.type).toBeDefined();
      expect(schema.properties).toBeDefined();
      expect(typeof schema.properties).toBe("object");
    }
  });

  test("tool handlers should be async functions", () => {
    for (const [toolKey, tool] of Object.entries(customTools)) {
      const t = tool as any;
      expect(typeof t.handler).toBe("function");
      
      // Check that handler returns a Promise
      const result = t.handler({ query: "test" });
      expect(result instanceof Promise).toBe(true);
    }
  });
});

describe("Example Custom Tool Functionality Tests", () => {
  let exampleCustomTool: any;

  beforeAll(async () => {
    const toolsModule = await import("../.opencode/tools/example-tool");
    exampleCustomTool = toolsModule.exampleCustomTool;
  });

  test("exampleCustomTool should process input correctly", async () => {
    const input = {
      query: "test query",
      options: {
        verbose: true,
      },
    };

    const result = await exampleCustomTool(input);
    
    expect(result).toBeDefined();
    expect(result.result).toBeDefined();
    expect(result.result).toContain("test query");
    expect(result.metadata).toBeDefined();
    expect(result.metadata.verbose).toBe(true);
  });

  test("exampleCustomTool should handle missing options", async () => {
    const input = {
      query: "simple query",
    };

    const result = await exampleCustomTool(input);
    
    expect(result).toBeDefined();
    expect(result.result).toContain("simple query");
    expect(result.metadata.verbose).toBe(false);
  });

  test("exampleCustomTool should include timestamp in metadata", async () => {
    const input = { query: "test" };
    const result = await exampleCustomTool(input);
    
    expect(result.metadata.timestamp).toBeDefined();
    expect(typeof result.metadata.timestamp).toBe("string");
    // Check if it's a valid ISO 8601 timestamp
    expect(new Date(result.metadata.timestamp).toISOString()).toBe(result.metadata.timestamp);
  });
});

describe("Tool Registration Verification Tests", () => {
  test("tools can be registered with OpenCode format", async () => {
    const toolsModule = await import("../.opencode/tools/example-tool");
    const customTools = toolsModule.customTools;

    // Simulate OpenCode registration process
    const registeredTools = new Map();
    
    for (const [key, tool] of Object.entries(customTools)) {
      const t = tool as any;
      registeredTools.set(t.name, {
        handler: t.handler,
        schema: t.inputSchema,
        description: t.description,
      });
    }

    expect(registeredTools.size).toBeGreaterThan(0);
    expect(registeredTools.has("example_custom_tool")).toBe(true);
  });

  test("registered tools can be invoked through registry", async () => {
    const toolsModule = await import("../.opencode/tools/example-tool");
    const customTools = toolsModule.customTools;

    // Simulate tool invocation
    const tool = customTools.exampleCustomTool;
    const result = await tool.handler({ query: "registry test" });
    
    expect(result).toBeDefined();
    expect(result.result).toContain("registry test");
  });
});

describe("Tool Schema Validation Tests", () => {
  let customTools: any;

  beforeAll(async () => {
    const toolsModule = await import("../.opencode/tools/example-tool");
    customTools = toolsModule.customTools;
  });

  test("tool schema should define required fields", () => {
    const tool = customTools.exampleCustomTool;
    
    expect(tool.inputSchema.required).toBeDefined();
    expect(Array.isArray(tool.inputSchema.required)).toBe(true);
    expect(tool.inputSchema.required.length).toBeGreaterThan(0);
  });

  test("tool schema properties should have descriptions", () => {
    const tool = customTools.exampleCustomTool;
    const properties = tool.inputSchema.properties;
    
    for (const [propName, propDef] of Object.entries(properties)) {
      const prop = propDef as any;
      expect(prop.description).toBeDefined();
      expect(typeof prop.description).toBe("string");
      expect(prop.description.length).toBeGreaterThan(0);
    }
  });

  test("tool schema should specify property types", () => {
    const tool = customTools.exampleCustomTool;
    const properties = tool.inputSchema.properties;
    
    for (const [propName, propDef] of Object.entries(properties)) {
      const prop = propDef as any;
      expect(prop.type || prop.properties).toBeDefined();
    }
  });
});
