# Examples

This directory contains practical examples of how to use the OpenCode Plugin Template.

## Example 1: Basic Plugin with Logging

A simple plugin that logs all tool executions:

```typescript
// .opencode/plugins/{{PLUGIN_NAME}}/logging-plugin.ts
export const LoggingPlugin = async (context) => {
  return {
    "tool.execute.before": async (input, output) => {
      console.log(`[${new Date().toISOString()}] Tool: ${input.tool}`);
    },
  };
};
```

## Example 2: Security Plugin

Block dangerous commands:

```typescript
// .opencode/plugins/{{PLUGIN_NAME}}/security-plugin.ts
export const SecurityPlugin = async (context) => {
  const DANGEROUS_PATTERNS = [
    /rm\s+-rf\s+\//,
    /mkfs/,
    /dd\s+if=/,
  ];

  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "bash") {
        const cmd = output.args?.command || "";
        
        for (const pattern of DANGEROUS_PATTERNS) {
          if (pattern.test(cmd)) {
            throw new Error(`⚠️ Blocked dangerous command: ${cmd}`);
          }
        }
      }
    },
  };
};
```

## Example 3: File Template Plugin

Automatically add headers to new TypeScript files:

```typescript
// .opencode/plugins/{{PLUGIN_NAME}}/template-plugin.ts
export const TemplatePlugin = async (context) => {
  return {
    "file.create": async (input) => {
      const { path, content } = input;
      
      if (path.endsWith(".ts") && !content.includes("/**")) {
        const filename = path.split("/").pop();
        const header = `/**\n * ${filename}\n * Created: ${new Date().toISOString()}\n */\n\n`;
        input.content = header + content;
      }
    },
  };
};
```

## Example 4: Analytics Plugin

Track tool usage:

```typescript
// .opencode/plugins/{{PLUGIN_NAME}}/analytics-plugin.ts
export const AnalyticsPlugin = async (context) => {
  const stats = new Map<string, number>();

  return {
    "tool.execute.after": async (input) => {
      const count = stats.get(input.tool) || 0;
      stats.set(input.tool, count + 1);
    },
    
    "session.complete": async () => {
      console.log("\n📊 Tool Usage Statistics:");
      for (const [tool, count] of stats.entries()) {
        console.log(`  ${tool}: ${count} times`);
      }
    },
  };
};
```

## Example 5: Custom Tool with Validation

```typescript
// .opencode/tools/validation-tool.ts
export async function validateJsonTool(input: {
  content: string;
  schema?: object;
}) {
  try {
    const data = JSON.parse(input.content);
    
    if (input.schema) {
      // Add JSON Schema validation here
      console.log("✓ JSON is valid");
    }
    
    return {
      valid: true,
      data,
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
}

export const customTools = {
  validateJson: {
    name: "validate_json",
    description: "Validate JSON content against optional schema",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "JSON content to validate",
        },
        schema: {
          type: "object",
          description: "Optional JSON Schema to validate against",
        },
      },
      required: ["content"],
    },
    handler: validateJsonTool,
  },
};
```

## Example 6: Custom Agent for Testing

```typescript
// .opencode/agents/test-agent.ts
export const testAgent = {
  name: "test-runner",
  description: "Specialized agent for running and analyzing tests",
  instructions: `You are a test automation expert. When running tests:
  
1. First, identify the test framework (Jest, Mocha, Vitest, etc.)
2. Run the appropriate test command
3. Analyze failures and provide clear explanations
4. Suggest fixes for common issues
5. Recommend additional test cases if needed

Always provide actionable feedback.`,
  model: "gpt-4",
  tools: ["bash", "view", "grep"],
  temperature: 0.2,
};
```

## Example 7: Skill for Code Review

```typescript
// .opencode/skills/code-review-skill.ts
export const codeReviewSkill = {
  name: "thorough-code-review",
  description: "Comprehensive code review process",
  tags: ["review", "quality", "best-practices"],
  content: `
# Thorough Code Review Process

## Checklist

### Functionality
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error conditions are covered

### Code Quality
- [ ] Code is readable and maintainable
- [ ] Functions are small and focused
- [ ] No code duplication
- [ ] Consistent naming conventions

### Performance
- [ ] No obvious performance issues
- [ ] Efficient algorithms used
- [ ] No memory leaks

### Security
- [ ] Input validation present
- [ ] No SQL injection vulnerabilities
- [ ] Sensitive data is protected
- [ ] Authentication/authorization correct

### Testing
- [ ] Tests cover main functionality
- [ ] Edge cases have tests
- [ ] Tests are meaningful

### Documentation
- [ ] Public APIs documented
- [ ] Complex logic explained
- [ ] README updated if needed
`,
};
```

## Using These Examples

1. **Copy the example** to your `.opencode/` directory
2. **Modify** to fit your needs
3. **Import** in your main plugin file
4. **Test** in a real OpenCode project

## Combining Plugins

You can combine multiple plugins:

```typescript
// .opencode/plugins/{{PLUGIN_NAME}}/index.ts
import { LoggingPlugin } from "./logging-plugin";
import { SecurityPlugin } from "./security-plugin";

export const MyPlugin = async (context) => {
  const loggingHooks = await LoggingPlugin(context);
  const securityHooks = await SecurityPlugin(context);

  return {
    ...loggingHooks,
    ...securityHooks,
  };
};
```

## Next Steps

- Explore the template files in `.opencode/`
- Read the [BEST_PRACTICES.md](../BEST_PRACTICES.md)
- Check the [README.md](../README.md) for more details
- Start building your own plugin!
