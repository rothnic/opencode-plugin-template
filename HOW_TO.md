# How-To Guide: OpenCode Plugin Development

This guide answers common questions and provides practical examples for plugin development scenarios.

## Table of Contents

1. [Configuration](#configuration)
2. [State Management](#state-management)
3. [Security & Validation](#security--validation)
4. [Hooks & Interception](#hooks--interception)
5. [Custom Tools](#custom-tools)
6. [Agents & Skills](#agents--skills)
7. [Testing](#testing)
8. [Deployment & Distribution](#deployment--distribution)
9. [Cleanup & Uninstall](#cleanup--uninstall)

---

## Configuration

### How do I load plugin configuration?

Use the `ConfigManager` to load configuration from global and project levels:

```typescript
import { createConfigManager } from "./config";
import type { PluginContext } from "./types";

// Define your plugin's config interface
interface MyPluginConfig {
  enabled?: boolean;
  logLevel?: "debug" | "info" | "warn" | "error";
  customOption?: string;
  featureFlags?: {
    enableFeatureX?: boolean;
  };
}

export const MyPlugin = async (context: PluginContext) => {
  const configManager = createConfigManager<MyPluginConfig>(context, "my-plugin");
  
  // Load with defaults
  const { config, source, path } = await configManager.load({
    enabled: true,
    logLevel: "info",
    featureFlags: {
      enableFeatureX: false,
    },
  });
  
  console.log(`Config loaded from: ${source}`); // global, project, or runtime
  console.log(`Config path: ${path}`);
  
  if (config.featureFlags?.enableFeatureX) {
    // Enable feature X
  }
};
```

### How do I define plugin configuration in opencode.json?

**Project-level** (`./.opencode/opencode.json` or `./opencode.json`):

```json
{
  "plugin": ["my-plugin"],
  "plugins": {
    "my-plugin": {
      "enabled": true,
      "logLevel": "debug",
      "customOption": "project-specific-value",
      "featureFlags": {
        "enableFeatureX": true
      }
    }
  }
}
```

**Global-level** (`~/.config/opencode/opencode.json`):

```json
{
  "plugins": {
    "my-plugin": {
      "enabled": true,
      "logLevel": "info"
    }
  }
}
```

**Precedence**: Project config > Global config > Defaults

### How do I access a specific config value?

```typescript
const configManager = createConfigManager(context, "my-plugin");

// Get specific key
const logLevel = await configManager.get("logLevel"); // "debug"

// Get nested value with dot notation
const featureX = await configManager.get("featureFlags.enableFeatureX"); // true

// Check config source
const isProject = await configManager.isProjectConfig(); // true if from project
const isGlobal = await configManager.isGlobalConfig(); // true if from global
```

### How do I provide runtime configuration overrides?

Set an environment variable:

```bash
MY_PLUGIN_CONFIG='{"enabled":false,"logLevel":"error"}' opencode
```

The plugin will automatically load this with highest precedence.

---

## State Management

### How do I persist plugin state?

Use the `StateManager` to save and load persistent state:

```typescript
import { createStateManager, StateLevel } from "./state";

interface MyPluginState {
  counter: number;
  lastRun?: string;
  cache?: Record<string, unknown>;
}

export const MyPlugin = async (context: PluginContext) => {
  const stateManager = createStateManager<MyPluginState>(context, "my-plugin");
  
  // Load project-level state with defaults
  const state = await stateManager.load(StateLevel.PROJECT, {
    counter: 0,
  });
  
  // Modify state
  state.counter++;
  state.lastRun = new Date().toISOString();
  
  // Save state
  await stateManager.save(StateLevel.PROJECT, state);
};
```

### Where is state stored?

- **Project-level**: `./.opencode/plugins/{plugin-name}/state.json`
- **Global-level**: `~/.config/opencode/plugins/{plugin-name}/state.json`

State files are automatically created when you save state for the first time.

### How do I update a single value without loading/saving everything?

```typescript
const stateManager = createStateManager(context, "my-plugin");

// Update specific keys
await stateManager.update(StateLevel.PROJECT, {
  counter: 42,
  lastRun: new Date().toISOString(),
});

// Or use set for a single value
await stateManager.set(StateLevel.PROJECT, "counter", 42);

// Get a single value
const counter = await stateManager.get(StateLevel.PROJECT, "counter"); // 42
```

### How do I clear state on plugin uninstall?

```typescript
import { StateLevel } from "./state";

// Clear all state for this plugin
await stateManager.clear(StateLevel.PROJECT); // Remove project state
await stateManager.clear(StateLevel.GLOBAL);  // Remove global state

// Or manually delete the state file
const statePath = stateManager.getPath(StateLevel.PROJECT);
console.log(`State file: ${statePath}`);
```

### When should I use project vs global state?

| Use Project State When... | Use Global State When... |
|----------------------------|--------------------------|
| State is specific to a repository/project | State is user preference across projects |
| Collaborators should share the same state | Each user should have their own settings |
| State should reset on project clone | State should persist across all projects |
| Example: Project-specific cache, history | Example: User theme, API tokens |

---

## Security & Validation

### How do I validate bash commands before execution?

Use the security utilities in `utils/index.ts`:

```typescript
import { isDangerousCommand, isCommandAllowed } from "./utils";

export const MyPlugin = async (context: PluginContext) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "bash") {
        const command = output.args?.command;
        
        if (isDangerousCommand(command)) {
          throw new Error(`Blocked dangerous command: ${command}`);
        }
        
        // Or use the simplified check
        if (!isCommandAllowed(command)) {
          throw new Error("Command not allowed");
        }
      }
    },
  };
};
```

### How do I prevent sensitive data from appearing in logs?

```typescript
import { sanitizeForLog, Logger } from "./utils";

const logger = new Logger(context);

const data = {
  username: "john",
  password: "secret123",
  apiKey: "sk-abc123",
  config: {
    database: "mydb",
    credentials: {
      user: "admin",
      token: "xyz789",
    },
  },
};

// Sanitize before logging
const sanitized = sanitizeForLog(data);
logger.info("User data", { data: sanitized });

// Output: { username: "john", password: "[REDACTED]", apiKey: "[REDACTED]", ... }
```

### How do I validate user input in custom tools?

Use Zod schemas for type-safe validation:

```typescript
import { z } from "zod";

const MyToolSchema = z.object({
  query: z.string().min(1).max(1000),
  options: z.object({
    caseSensitive: z.boolean().optional(),
    maxResults: z.number().int().min(1).max(100).optional(),
  }).optional(),
});

export const myCustomTool = {
  name: "my_tool",
  description: "My custom tool",
  inputSchema: MyToolSchema,
  handler: async (input: unknown) => {
    // Zod will validate input
    const validated = MyToolSchema.parse(input);
    
    // Now TypeScript knows the types
    console.log(validated.query); // string
    console.log(validated.options?.maxResults); // number | undefined
    
    // Your tool logic here
    return { success: true };
  },
};
```

---

## Hooks & Interception

### How do I intercept tool execution?

```typescript
export const MyPlugin = async (context: PluginContext) => {
  return {
    // Before any tool executes
    "tool.execute.before": async (input, output) => {
      console.log(`Tool: ${input.tool}`);
      console.log(`Args:`, output.args);
      
      // Block execution by throwing an error
      if (shouldBlock(input.tool)) {
        throw new Error("Tool execution blocked");
      }
    },
    
    // After tool executes
    "tool.execute.after": async (input, output) => {
      console.log(`Tool completed: ${input.tool}`);
      console.log(`Result:`, output.result);
      
      // Modify the result
      output.result = transformResult(output.result);
    },
  };
};
```

### How do I intercept file operations?

```typescript
export const MyPlugin = async (context: PluginContext) => {
  return {
    "file.create": async (input) => {
      console.log(`Creating file: ${input.path}`);
      
      // Validate or block file creation
      if (isRestrictedPath(input.path)) {
        throw new Error("Cannot create file in restricted path");
      }
    },
    
    "file.edit": async (input) => {
      console.log(`Editing file: ${input.path}`);
      
      // Log or validate edits
      if (isSensitiveFile(input.path)) {
        // Send notification, log to audit trail, etc.
      }
    },
  };
};
```

### How do I add custom behavior on session start/end?

```typescript
export const MyPlugin = async (context: PluginContext) => {
  return {
    "session.create": async (input) => {
      console.log("Session starting");
      
      // Initialize state, load config, set up resources
      const stateManager = createStateManager(context, "my-plugin");
      await stateManager.update(StateLevel.PROJECT, {
        sessionCount: (await stateManager.get(StateLevel.PROJECT, "sessionCount") as number || 0) + 1,
        lastSessionStart: new Date().toISOString(),
      });
    },
    
    "session.complete": async (input) => {
      console.log("Session ending");
      
      // Clean up resources, save final state, generate reports
      const stateManager = createStateManager(context, "my-plugin");
      await stateManager.set(StateLevel.PROJECT, "lastSessionEnd", new Date().toISOString());
    },
  };
};
```

### What hooks are available?

| Hook | When it fires | Use case |
|------|---------------|----------|
| `session.create` | Session starts | Initialize resources, load config |
| `session.complete` | Session ends | Clean up, save state, generate reports |
| `tool.execute.before` | Before tool runs | Validate, log, block execution |
| `tool.execute.after` | After tool completes | Transform results, log outcomes |
| `message.create` | New message | Log conversations, analyze prompts |
| `message.complete` | Message finished | Track completions, measure latency |
| `file.create` | Before file creation | Validate paths, enforce policies |
| `file.edit` | Before file edit | Audit changes, enforce conventions |
| `permission.request` | Permission requested | Custom permission logic |
| `git.before` | Before git operation | Validate commits, enforce conventions |
| `git.after` | After git operation | Trigger CI, send notifications |
| `error` | Error occurs | Custom error handling, logging |

---

## Custom Tools

### How do I create a custom tool?

Create a tool file in `.opencode/tools/`:

```typescript
// .opencode/tools/my-tool.ts
import { z } from "zod";

const MyToolInputSchema = z.object({
  query: z.string(),
  limit: z.number().optional(),
});

type MyToolInput = z.infer<typeof MyToolInputSchema>;

async function myToolHandler(input: MyToolInput) {
  // Your tool logic here
  const results = await searchDatabase(input.query, input.limit);
  
  return {
    success: true,
    results,
    count: results.length,
  };
}

export const myCustomTool = {
  name: "my_custom_tool",  // snake_case for tool names
  description: "Search the database for matching records",
  inputSchema: MyToolInputSchema,
  handler: myToolHandler,
};
```

### How do I register custom tools in my plugin?

```typescript
// .opencode/plugins/index.ts
import { myCustomTool } from "../tools/my-tool";

export const MyPlugin = async (context: PluginContext) => {
  // Register tools (if your plugin system supports it)
  // Note: Most plugins don't need to explicitly register tools
  // OpenCode discovers them automatically from .opencode/tools/
  
  return {
    // Your hooks here
  };
};
```

### How do I make tools available to agents?

Tools in `.opencode/tools/` are automatically discovered by OpenCode. Reference them in agent markdown files:

```markdown
---
name: My Agent
tools:
  - my_custom_tool
  - grep
  - view
---

# My Agent

This agent has access to my_custom_tool, grep, and view.
```

---

## Agents & Skills

### How do I create a custom agent?

Create a markdown file in `.opencode/agent/`:

```markdown
<!-- .opencode/agent/code-reviewer.md -->
---
name: Code Reviewer
mode: code
model: anthropic/claude-sonnet-4-5
temperature: 0.3
permission:
  view: allow
  edit: ask
  bash: deny
prompt: |
  You are an expert code reviewer. Focus on:
  - Security vulnerabilities
  - Performance issues
  - Code quality and maintainability
  - Best practices
---

# Code Reviewer

Reviews code changes for security, performance, and quality issues.

## Review Checklist

- Check for SQL injection vulnerabilities
- Validate input sanitization
- Review error handling
- Assess performance implications
- Verify test coverage
```

### How do I create a custom skill?

Create a markdown file in `.opencode/skill/`:

```markdown
<!-- .opencode/skill/api-debugging.md -->
---
name: API Debugging
description: Systematic approach to debugging API integration issues
license: MIT
compatibility: opencode
metadata:
  tags: [debugging, api, troubleshooting, http]
  category: debugging
  difficulty: intermediate
---

# API Debugging

A systematic approach to debugging API integration issues.

## Steps

1. **Verify API Endpoint**
   - Check URL is correct
   - Verify HTTP method (GET, POST, etc.)

2. **Inspect Request**
   - Check headers (Authorization, Content-Type)
   - Validate request body format
   - Use `curl` to test directly

3. **Analyze Response**
   - Check status code
   - Inspect response headers
   - Parse response body

4. **Debug Common Issues**
   - CORS errors: Check Access-Control headers
   - Authentication: Verify API keys/tokens
   - Rate limiting: Check retry headers

## Tools

Use these OpenCode tools:
- `bash` - Run curl commands
- `view` - Inspect API client code
- `grep` - Search for API configuration
```

### How do I reference other skills or files in a skill?

```markdown
---
name: Advanced Refactoring
metadata:
  tags: [refactoring, architecture]
---

# Advanced Refactoring

## Prerequisites

Before using this skill, review:
- `@.opencode/skill/safe-refactoring.md` - Basic refactoring principles
- `@.opencode/skill/testing-strategy.md` - Ensure tests are in place

## Related Resources

- Project refactoring guidelines: `@./docs/REFACTORING.md`
- Architecture patterns: `@./docs/ARCHITECTURE.md`
```

---

## Testing

### How do I test my plugin?

This template includes comprehensive test examples:

**Unit Tests** (`.opencode/plugins/*.test.ts`):

```typescript
import { describe, test, expect } from "bun:test";
import { isDangerousCommand, sanitizeForLog } from "./utils";

describe("Security Utilities", () => {
  test("detects dangerous commands", () => {
    expect(isDangerousCommand("rm -rf /")).toBe(true);
    expect(isDangerousCommand("ls -la")).toBe(false);
  });
  
  test("sanitizes sensitive data", () => {
    const data = { username: "test", password: "secret" };
    const sanitized = sanitizeForLog(data);
    expect(sanitized).toEqual({ username: "test", password: "[REDACTED]" });
  });
});
```

**Integration Tests** (`tests/integration.test.ts`):

```typescript
import { describe, test, expect } from "bun:test";
import { MyPlugin } from "../.opencode/plugins";

describe("Plugin Integration", () => {
  test("plugin initializes correctly", async () => {
    const mockContext = createMockContext();
    const hooks = await MyPlugin(mockContext);
    
    expect(hooks).toHaveProperty("tool.execute.before");
    expect(typeof hooks["tool.execute.before"]).toBe("function");
  });
});
```

### How do I run tests?

```bash
# Run all tests
bun test

# Run specific test file
bun test .opencode/plugins/utils.test.ts

# Run tests in watch mode
bun test --watch

# Run only integration tests
bun test tests/integration.test.ts
```

---

## Deployment & Distribution

### How do I publish my plugin to npm?

1. Update `package.json`:

```json
{
  "name": "@yourorg/opencode-plugin-name",
  "version": "1.0.0",
  "description": "Your plugin description",
  "main": "index.ts",
  "files": [
    ".opencode/",
    "index.ts",
    "opencode.json"
  ]
}
```

2. Build and publish:

```bash
bun run build
npm publish
```

3. Users install with:

```json
{
  "plugin": ["@yourorg/opencode-plugin-name"]
}
```

### How do I distribute without npm?

**Option 1: Direct file copy**

Users copy your `.opencode/` directory to their project:

```bash
cp -r path/to/your-plugin/.opencode/* my-project/.opencode/
```

**Option 2: Git submodule**

```bash
cd my-project
git submodule add https://github.com/you/plugin.git .opencode/plugins/your-plugin
```

**Option 3: Symlink for local development**

```bash
ln -s /path/to/your-plugin/.opencode/plugins/index.ts .opencode/plugins/my-plugin.ts
```

---

## Cleanup & Uninstall

### How do I cleanly uninstall a plugin?

Create an uninstall script in your plugin:

```typescript
// .opencode/plugins/uninstall.ts
import { StateLevel, createStateManager } from "./state";
import type { PluginContext } from "./types";

export async function uninstall(context: PluginContext) {
  const stateManager = createStateManager(context, "my-plugin");
  
  // Clear all state
  await stateManager.clear(StateLevel.PROJECT);
  await stateManager.clear(StateLevel.GLOBAL);
  
  console.log("Plugin state cleared");
  console.log(`Project state was at: ${stateManager.getPath(StateLevel.PROJECT)}`);
  console.log(`Global state was at: ${stateManager.getPath(StateLevel.GLOBAL)}`);
}
```

### Where are plugin files stored?

| Type | Location | Cleanup |
|------|----------|---------|
| Plugin code | `./.opencode/plugins/` or `node_modules/` | Remove package or delete directory |
| Project state | `./.opencode/plugins/{name}/state.json` | Delete file or use `stateManager.clear()` |
| Global state | `~/.config/opencode/plugins/{name}/` | Delete directory |
| Project config | `./opencode.json` | Remove plugin from config |
| Global config | `~/.config/opencode/opencode.json` | Remove plugin config section |

---

## Advanced Patterns

### How do I implement feature flags?

```typescript
interface MyPluginConfig {
  features?: {
    advancedLogging?: boolean;
    experimentalFeature?: boolean;
  };
}

const configManager = createConfigManager<MyPluginConfig>(context, "my-plugin");
const { config } = await configManager.load({
  features: {
    advancedLogging: false,
    experimentalFeature: false,
  },
});

if (config.features?.advancedLogging) {
  // Enable advanced logging
}
```

### How do I implement plugin-to-plugin communication?

Use the state manager with a shared namespace:

```typescript
// Plugin A writes
const stateManager = createStateManager(context, "shared");
await stateManager.set(StateLevel.PROJECT, "pluginA.message", "Hello Plugin B");

// Plugin B reads
const message = await stateManager.get(StateLevel.PROJECT, "pluginA.message");
```

### How do I implement caching?

```typescript
interface CacheState {
  cache: Record<string, { data: unknown; expiry: number }>;
}

const stateManager = createStateManager<CacheState>(context, "my-plugin");

async function getCached(key: string): Promise<unknown | null> {
  const state = await stateManager.load(StateLevel.PROJECT, { cache: {} });
  const entry = state.cache[key];
  
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    // Expired
    await stateManager.delete(StateLevel.PROJECT, `cache.${key}`);
    return null;
  }
  
  return entry.data;
}

async function setCache(key: string, data: unknown, ttlMs: number = 3600000) {
  await stateManager.set(StateLevel.PROJECT, `cache.${key}`, {
    data,
    expiry: Date.now() + ttlMs,
  });
}
```

---

## Best Practices Summary

✅ **DO:**
- Use `ConfigManager` for configuration
- Use `StateManager` for persistent data
- Use `Logger` instead of `console.log`
- Validate commands with security utilities
- Sanitize sensitive data in logs
- Provide defaults for all config/state
- Clean up state on uninstall
- Test your hooks and utilities
- Document your plugin's config options

❌ **DON'T:**
- Use `console.log` (use `Logger` instead)
- Store sensitive data in plain text state
- Assume config/state files exist
- Block file operations unnecessarily
- Leave orphaned state files
- Forget to handle errors in hooks
- Skip input validation
- Ignore security implications

---

For more examples, see:
- **PLUGIN_BEST_PRACTICES.md** - Detailed best practices
- **REFERENCE.md** - Complete API reference
- **tests/** - Comprehensive test examples
