# OpenCode Plugin Best Practices

This guide provides detailed best practices for developing OpenCode plugins, based on official documentation and community standards.

## Table of Contents

1. [Logging and Debugging](#logging-and-debugging)
2. [Plugin Structure](#plugin-structure)
3. [Error Handling](#error-handling)
4. [Performance](#performance)
5. [Security](#security)
6. [Testing](#testing)
7. [TypeScript Best Practices](#typescript-best-practices)
8. [Hook Implementation](#hook-implementation)
9. [Tool Development](#tool-development)
10. [Agent and Skill Integration](#agent-and-skill-integration)

---

## Logging and Debugging

### ❌ DON'T: Use console.log in Production Code

```typescript
// BAD - console.log is not captured by OpenCode's logging system
export const MyPlugin = async (context) => {
  console.log("Plugin loaded");  // ❌
  return {
    "tool.execute.before": async (input) => {
      console.log("Tool:", input.tool);  // ❌
    }
  };
};
```

**Problems:**
- Not captured in OpenCode's centralized logs
- Not visible in UI or log management systems
- Can't be filtered or searched effectively
- Creates noise in terminal output

### ✅ DO: Use Structured Logging

```typescript
// GOOD - Use client.app.log for structured logging
export const MyPlugin = async (context) => {
  context.client.app?.log({
    level: 'info',
    message: 'Plugin loaded',
    data: { version: '1.0.0' }
  });

  return {
    "tool.execute.before": async (input) => {
      context.client.app?.log({
        level: 'debug',
        message: 'Tool execution starting',
        data: { tool: input.tool }
      });
    }
  };
};
```

### ✅ Better: Use a Logger Utility

```typescript
// BEST - Centralized logger utility
import { Logger } from './utils';

export const MyPlugin = async (context) => {
  const logger = new Logger(context, 'my-plugin');
  
  logger.info('Plugin initialized', { 
    project: context.project.name 
  });

  return {
    "tool.execute.before": async (input) => {
      logger.debug('Tool executing', { tool: input.tool });
    }
  };
};
```

**This template provides a Logger utility** in `.opencode/plugin/utils/index.ts` that:
- Uses `client.app.log()` when available
- Falls back to `process.stderr` for development
- Automatically sanitizes sensitive data
- Provides consistent log formatting

### Log Levels

Use appropriate log levels:

```typescript
logger.debug('Detailed diagnostic info');    // Development only
logger.info('Normal operation events');       // General information
logger.warn('Warning conditions');            // Potential issues
logger.error('Error conditions');             // Actual errors
```

### Development Debugging

For development-only output, use `process.stderr`:

```typescript
if (process.env.DEBUG) {
  process.stderr.write(`Debug: ${JSON.stringify(data)}\n`);
}
```

---

## Plugin Structure

### ✅ Organize by Subdirectories

```
.opencode/plugin/
├── index.ts           # Main plugin entry point
├── types/
│   └── index.ts       # Type definitions
├── utils/
│   └── index.ts       # Shared utilities
├── hooks/
│   └── index.ts       # Hook implementations
└── __tests__/
    ├── utils.test.ts
    └── integration.test.ts
```

**Benefits:**
- Easy to navigate and maintain
- Clear separation of concerns
- Facilitates testing
- Scales well as plugin grows

### Main Plugin Entry (index.ts)

```typescript
import type { PluginContext, PluginHooks } from './types';
import { Logger } from './utils';
import { createToolHooks, createSessionHooks } from './hooks';

export const MyPlugin = async (context: PluginContext): Promise<PluginHooks> => {
  // Initialize once
  const logger = new Logger(context, 'my-plugin');
  
  // Create hooks
  const toolHooks = createToolHooks(logger);
  const sessionHooks = createSessionHooks(logger);
  
  // Return combined hooks
  return {
    ...toolHooks,
    ...sessionHooks,
  };
};
```

---

## Error Handling

### ✅ Handle Errors Gracefully

```typescript
export const MyPlugin = async (context) => {
  const logger = new Logger(context, 'my-plugin');

  return {
    "tool.execute.before": async (input, output) => {
      try {
        // Your logic here
        if (someCondition) {
          throw new Error('Validation failed');
        }
      } catch (error) {
        // Log the error
        logger.error('Tool execution failed', {
          tool: input.tool,
          error: error.message
        });
        
        // Re-throw to prevent tool execution
        throw error;
      }
    }
  };
};
```

### ✅ Provide Meaningful Error Messages

```typescript
// BAD
throw new Error('Error');

// GOOD
throw new Error('Cannot execute bash command: dangerous pattern detected (rm -rf /)');
```

### ✅ Don't Swallow Errors

```typescript
// BAD
try {
  await someOperation();
} catch (error) {
  // Silent failure - user doesn't know what happened
}

// GOOD
try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed', { error: error.message });
  throw error; // Let OpenCode handle it
}
```

---

## Performance

### ✅ Initialize Once, Use Many Times

```typescript
// BAD - Creates new logger for each hook call
return {
  "tool.execute.before": async (input) => {
    const logger = new Logger(context, 'my-plugin'); // ❌ Re-created every time
    logger.info('Tool executing');
  }
};

// GOOD - Logger created once during plugin initialization
const logger = new Logger(context, 'my-plugin'); // ✅ Created once

return {
  "tool.execute.before": async (input) => {
    logger.info('Tool executing'); // ✅ Reuses same instance
  }
};
```

### ✅ Avoid Heavy Operations in Hooks

```typescript
// BAD - Slow synchronous operation blocks hook
"tool.execute.before": async (input) => {
  const result = heavyComputation(); // ❌ Blocks
  logger.info('Result', { result });
}

// GOOD - Defer heavy operations
"tool.execute.before": async (input) => {
  logger.debug('Tool starting', { tool: input.tool }); // Fast
  // Heavy operations happen in the tool itself, not the hook
}
```

### ✅ Cache Expensive Operations

```typescript
const cache = new Map();

return {
  "tool.execute.before": async (input) => {
    if (cache.has(input.tool)) {
      return cache.get(input.tool);
    }
    
    const result = await expensiveOperation();
    cache.set(input.tool, result);
    return result;
  }
};
```

---

## Security

### ✅ Validate and Sanitize Inputs

```typescript
"tool.execute.before": async (input, output) => {
  if (input.tool === 'bash' && output.args?.command) {
    const command = output.args.command as string;
    
    // Validate command is safe
    if (isDangerousCommand(command)) {
      logger.error('Dangerous command blocked', { 
        command: command.substring(0, 100) // Only log first 100 chars
      });
      throw new Error('Command blocked for security');
    }
  }
}
```

### ✅ Never Log Sensitive Data

```typescript
// BAD
logger.info('User authenticated', {
  username: user.username,
  password: user.password  // ❌ Exposes sensitive data
});

// GOOD - Use sanitization utility
import { sanitizeForLog } from './utils';

logger.info('User authenticated', sanitizeForLog({
  username: user.username,
  password: user.password  // ✅ Will be redacted
}));
```

**This template provides** `sanitizeForLog()` utility that automatically redacts:
- password
- token
- secret
- apiKey
- api_key
- accessToken
- privateKey

### ✅ Validate Tool Permissions

```typescript
const ALLOWED_TOOLS = ['view', 'grep', 'web_search'];

"tool.execute.before": async (input) => {
  if (!ALLOWED_TOOLS.includes(input.tool)) {
    throw new Error(`Tool ${input.tool} not allowed by plugin policy`);
  }
}
```

---

## Testing

### ✅ Write Tests for Your Plugin

```typescript
// .opencode/plugin/__tests__/integration.test.ts
import { describe, test, expect } from "bun:test";

describe("Plugin Integration", () => {
  test("should initialize correctly", async () => {
    const mockContext = createMockContext();
    const hooks = await MyPlugin(mockContext);
    
    expect(hooks).toBeDefined();
    expect(typeof hooks["tool.execute.before"]).toBe("function");
  });

  test("should block dangerous commands", async () => {
    const mockContext = createMockContext();
    const hooks = await MyPlugin(mockContext);
    
    await expect(
      hooks["tool.execute.before"](
        { tool: "bash" },
        { args: { command: "rm -rf /" } }
      )
    ).rejects.toThrow("Dangerous command");
  });
});
```

### ✅ Test Utilities Separately

```typescript
// .opencode/plugin/__tests__/utils.test.ts
import { describe, test, expect } from "bun:test";
import { isDangerousCommand, sanitizeForLog } from "../utils";

describe("isDangerousCommand", () => {
  test("should detect rm -rf /", () => {
    expect(isDangerousCommand("rm -rf /")).toBe(true);
  });

  test("should allow safe commands", () => {
    expect(isDangerousCommand("ls -la")).toBe(false);
  });
});
```

**This template includes:**
- Unit tests for utilities (`__tests__/utils.test.ts`)
- Integration tests for full plugin (`__tests__/integration.test.ts`)
- Test documentation (`__tests__/README.md`)

---

## TypeScript Best Practices

### ✅ Define Strong Types

```typescript
// types/index.ts
export interface ToolExecutionInput {
  tool: string;
  args?: Record<string, any>;
}

export interface ToolExecutionOutput {
  args?: Record<string, any>;
}

export type PluginHooks = {
  'tool.execute.before'?: (
    input: ToolExecutionInput,
    output: ToolExecutionOutput
  ) => Promise<void>;
  // ... other hooks
};
```

### ✅ Use Type Guards

```typescript
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

if (isStringArray(input.data)) {
  // TypeScript knows input.data is string[]
  input.data.forEach(item => logger.info(item));
}
```

### ✅ Avoid `any`, Prefer `unknown`

```typescript
// BAD
function processData(data: any) {  // ❌
  return data.someProperty;
}

// GOOD
function processData(data: unknown) {  // ✅
  if (typeof data === 'object' && data !== null && 'someProperty' in data) {
    return (data as { someProperty: unknown }).someProperty;
  }
}
```

---

## Hook Implementation

### ✅ Keep Hooks Focused

Each hook should do one thing well:

```typescript
// GOOD - Focused responsibility
"tool.execute.before": async (input, output) => {
  // Only validates command safety
  if (input.tool === 'bash') {
    validateBashCommand(output.args?.command);
  }
}

// BAD - Too many responsibilities
"tool.execute.before": async (input, output) => {
  validateCommand(output);
  logExecution(input);
  trackMetrics(input);
  notifyWebhook(input);  // ❌ Too much in one hook
}
```

### ✅ Handle Missing Context Gracefully

```typescript
"tool.execute.before": async (input, output) => {
  // Context may not always have all properties
  if (context.client.app?.log) {
    context.client.app.log({ level: 'info', message: 'Tool executing' });
  } else {
    // Fallback for development
    process.stderr.write('Tool executing\n');
  }
}
```

### ✅ Return Quickly

```typescript
"tool.execute.before": async (input, output) => {
  // Quick validation
  if (input.tool !== 'bash') {
    return; // ✅ Exit early if not relevant
  }
  
  // Only process relevant tools
  validateBashCommand(output.args?.command);
}
```

---

## Tool Development

### ✅ Use JSON Schema for Validation

```typescript
// .opencode/tools/my-tool.ts
export const myTool = {
  name: "my_custom_tool",
  description: "Does something useful",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The query to process"
      },
      options: {
        type: "object",
        properties: {
          verbose: { type: "boolean" }
        }
      }
    },
    required: ["query"]
  },
  handler: async (input) => {
    // TypeScript types inferred from schema
    return { result: `Processed: ${input.query}` };
  }
};
```

### ✅ Provide Good Tool Descriptions

```typescript
// BAD
description: "Tool that does things"  // ❌ Vague

// GOOD
description: "Searches code for patterns using regex, returns matching files and line numbers"  // ✅ Clear
```

---

## Agent and Skill Integration

### ✅ Use Markdown for Agents and Skills

Agents and skills should be defined as markdown files with YAML frontmatter:

```markdown
---
name: code-reviewer
description: 'Specialized code review agent'
mode: primary
model: anthropic/claude-sonnet-4-5
temperature: 0.3
permission:
  edit: ask
  bash: deny
---

# Code Review Expert

You are a code review expert...
```

### ✅ Reference Skills from Agents

```markdown
## Related Skills

Use these skills for better results:
- `@.opencode/skill/systematic-debugging.md`
- `@.opencode/skill/safe-refactoring.md`
```

### ✅ Create Discoverable Scripts

Agents can discover and use scripts in `.opencode/scripts/`:

```typescript
// .opencode/scripts/debug-helper.ts
export async function collectDebugInfo() {
  // Utility that agents can discover
  return { /* debug info */ };
}

// Make it runnable
if (import.meta.main) {
  const info = await collectDebugInfo();
  console.log(JSON.stringify(info, null, 2));
}
```

Reference in skills:
```markdown
Agents can use the debug helper:
`@.opencode/scripts/debug-helper.ts`
```

---

## Pre-commit Checks

This template includes **lefthook** with automatic checks:

### Console.log Detection

Prevents committing console.log statements:

```yaml
pre-commit:
  commands:
    no-console-log:
      glob: ".opencode/**/*.{ts,tsx,js,jsx}"
      run: |
        if grep -rn "console\.\(log\|info\)" .opencode/plugin/; then
          echo "❌ console.log found! Use Logger utility instead."
          exit 1
        fi
```

**To bypass** (not recommended):
```bash
git commit --no-verify
```

---

## Summary Checklist

✅ Use `client.app.log()` or Logger utility, never `console.log`  
✅ Organize plugin code into subdirectories (types/, utils/, hooks/)  
✅ Handle errors gracefully with meaningful messages  
✅ Initialize expensive resources once, not per hook call  
✅ Validate and sanitize all inputs  
✅ Never log sensitive data (use `sanitizeForLog()`)  
✅ Write unit and integration tests  
✅ Use strong TypeScript types  
✅ Keep hooks focused and fast  
✅ Use JSON Schema for tool validation  
✅ Define agents and skills as markdown files  
✅ Make utility scripts discoverable by agents  
✅ Run tests before committing (`bun test`)  
✅ Let pre-commit hooks catch issues  

---

## Additional Resources

- [Official Plugin Documentation](https://opencode.ai/docs/plugins/)
- [OpenCode GitHub Repository](https://github.com/anomalyco/opencode)
- [Community Plugin Manual](https://github.com/Laelia-Succubus/Opencode-Plugin-Manual)
- [REFERENCE.md](./REFERENCE.md) - Complete API reference
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - General development practices
