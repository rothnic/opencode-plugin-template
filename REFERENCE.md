# OpenCode Reference Guide

A comprehensive reference guide for OpenCode plugin development with links to official documentation, GitHub repositories, type definitions, and example implementations.

## Table of Contents

1. [Official Documentation](#official-documentation)
2. [GitHub Repositories](#github-repositories)
3. [SDK & Type Definitions](#sdk--type-definitions)
4. [Plugin Development](#plugin-development)
5. [Custom Tools](#custom-tools)
6. [Configuration](#configuration)
7. [Example Plugins](#example-plugins)
8. [Community Resources](#community-resources)

---

## Official Documentation

| Resource | URL | Description |
|----------|-----|-------------|
| **OpenCode Main Docs** | https://opencode.ai/docs/ | Official documentation hub |
| **Plugins Guide** | https://opencode.ai/docs/plugins/ | Complete plugin development guide |
| **Custom Tools** | https://opencode.ai/docs/custom-tools/ | Guide for creating custom tools |
| **Configuration** | https://opencode.ai/docs/config/ | opencode.json configuration reference |
| **SDK Documentation** | https://opencode.ai/docs/sdk/ | JavaScript/TypeScript SDK guide |
| **Ecosystem** | https://opencode.ai/docs/ecosystem/ | Overview of OpenCode ecosystem |
| **Alt Docs Site** | https://open-code.ai/en/docs/ | Alternative documentation portal |

---

## GitHub Repositories

### Official Repositories

| Repository | URL | Description |
|------------|-----|-------------|
| **OpenCode Main** | https://github.com/opencode-ai/opencode | Main OpenCode repository |
| **OpenCode Organization** | https://github.com/opencode-ai | Official GitHub organization |

### Community Repositories

| Repository | URL | Description |
|------------|-----|-------------|
| **Awesome OpenCode** | https://github.com/awesome-opencode/awesome-opencode | Curated list of plugins, themes, agents |
| **OpenCode Workflows** | https://github.com/IgorWarzocha/Opencode-Workflows | Example workflows, templates, scaffolds |
| **Awesome OpenCode Skills** | https://github.com/TheArchitectit/awesome-opencode-skills | Curated skills and practical plugins |
| **OpenCode Configs** | https://github.com/safzanpirani/opencode-configs | Example configurations |

---

## SDK & Type Definitions

### NPM Packages

| Package | URL | Description |
|---------|-----|-------------|
| **@opencode-ai/sdk** | https://www.npmjs.com/package/@opencode-ai/sdk | Official JavaScript/TypeScript SDK |
| **@opencode-ai/plugin** | (included in SDK) | Plugin API and type definitions |

### Installation

```bash
npm install @opencode-ai/sdk
```

### Key Type Exports

| Type/Interface | Import Path | Description |
|----------------|-------------|-------------|
| **Session, Message, Part** | `@opencode-ai/sdk` | Core API types |
| **Plugin** | `@opencode-ai/plugin` | Plugin function type |
| **tool()** | `@opencode-ai/plugin` | Custom tool helper |
| **PluginContext** | `@opencode-ai/plugin` | Plugin context interface |

### Type Definition Example

```typescript
import type { Plugin } from "@opencode-ai/plugin";
import type { Session, Message } from "@opencode-ai/sdk";

export const MyPlugin: Plugin = (context) => ({
  "session.complete": async (session: Session) => {
    // Your logic
  }
});
```

### SDK Usage

```typescript
// Create OpenCode client
import { createOpencode } from "@opencode-ai/sdk";
const { client } = await createOpencode();

// Or connect to existing instance
import { createOpencodeClient } from "@opencode-ai/sdk";
const client = createOpencodeClient({ 
  baseUrl: "http://localhost:4096" 
});
```

---

## Plugin Development

### Plugin Structure

Plugins are TypeScript/JavaScript modules that export a function receiving a context and returning hook handlers.

### Plugin Context

| Property | Type | Description |
|----------|------|-------------|
| **project** | `{ name: string, path: string }` | Current project information |
| **client** | `OpenCodeClient` | SDK client for API interactions |
| **$** | `(cmd: string) => Promise<any>` | Bun shell executor |
| **directory** | `string` | Current directory path |
| **worktree** | `{ branch: string, commit: string }` | Git worktree info |

### Available Hooks

| Hook Name | Signature | Description |
|-----------|-----------|-------------|
| **session.create** | `async (session) => void` | Called when session starts |
| **session.complete** | `async (session) => void` | Called when session ends |
| **tool.execute.before** | `async (input, output) => void` | Before tool execution |
| **tool.execute.after** | `async (input) => void` | After tool execution |
| **message.create** | `async (message) => void` | When message is created |
| **message.complete** | `async (message) => void` | When message completes |
| **file.create** | `async (fileInfo) => void` | Before file creation |
| **file.edit** | `async (fileInfo) => void` | Before file edit |
| **permission.request** | `async (request) => boolean \| undefined` | Handle permission requests |

### Plugin File Locations

| Location | Type | Description |
|----------|------|-------------|
| `~/.config/opencode/plugins/` | Global | System-wide plugins |
| `.opencode/plugins/` | Project | Project-specific plugins |
| NPM package | External | Installed via package manager |

### Basic Plugin Template

```typescript
// .opencode/plugins/my-plugin.ts
import type { Plugin } from "@opencode-ai/plugin";

export const MyPlugin: Plugin = async (context) => {
  const { project, client, $, directory, worktree } = context;

  return {
    "session.create": async (session) => {
      console.log("Session started!");
    },

    "tool.execute.before": async (input, output) => {
      // Validate or modify tool execution
      if (input.tool === "bash" && isDangerous(output.args?.command)) {
        throw new Error("Dangerous command blocked");
      }
    },

    "session.complete": async (session) => {
      console.log("Session completed!");
    },
  };
};

export default MyPlugin;
```

### Plugin Registration

```json
// opencode.json
{
  "plugin": [
    "my-npm-plugin",
    "@org/another-plugin@1.2.3"
  ]
}
```

---

## Custom Tools

Custom tools extend OpenCode's capabilities with new actions the AI can invoke.

### Tool File Locations

| Location | Type | Description |
|----------|------|-------------|
| `~/.config/opencode/tools/` | Global | System-wide tools |
| `.opencode/tools/` | Project | Project-specific tools |

### Tool Definition Structure

```typescript
// .opencode/tools/hello.ts
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Say hello to someone",
  args: {
    name: tool.schema.string().describe("Name to greet")
  },
  async execute(args) {
    return `Hello, ${args.name}!`;
  }
});
```

### Multiple Tools in One File

```typescript
// .opencode/tools/math.ts
import { tool } from "@opencode-ai/plugin";

export const add = tool({
  description: "Add two numbers",
  args: {
    a: tool.schema.number(),
    b: tool.schema.number()
  },
  async execute(args) {
    return args.a + args.b;
  }
});

export const subtract = tool({
  description: "Subtract two numbers",
  args: {
    a: tool.schema.number(),
    b: tool.schema.number()
  },
  async execute(args) {
    return args.a - args.b;
  }
});

// Tools will be available as: math_add, math_subtract
```

### Tool Context

Tools receive context for deeper integrations:

```typescript
export default tool({
  description: "Tool with context",
  args: { input: tool.schema.string() },
  async execute(args, context) {
    // context includes: agent, sessionID, messageID
    console.log(`Called in session: ${context.sessionID}`);
    return "result";
  }
});
```

### Cross-Language Tools

Wrap any executable:

```typescript
import { tool } from "@opencode-ai/plugin";
import { $ } from "bun";

export default tool({
  description: "Run Python script",
  args: {
    file: tool.schema.string()
  },
  async execute(args) {
    return await $`python analyze.py ${args.file}`.text();
  }
});
```

### Schema Validation

Tools use [Zod](https://zod.dev/) for argument validation:

```typescript
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Validate input",
  args: {
    email: tool.schema.string().email(),
    age: tool.schema.number().min(0).max(120),
    role: tool.schema.enum(["admin", "user", "guest"])
  },
  async execute(args) {
    // args are fully validated and typed
    return `User: ${args.email}`;
  }
});
```

---

## Configuration

### opencode.json Reference

The `opencode.json` file configures OpenCode behavior, tool permissions, plugins, and more.

### File Locations & Precedence

| Location | Priority | Description |
|----------|----------|-------------|
| `OPENCODE_CONFIG` env var | Highest | Custom config path |
| `./opencode.json` | High | Project-specific config |
| `~/.config/opencode/opencode.json` | Medium | User global config |
| `.well-known/opencode` | Low | Remote org defaults |

More specific configs override general ones. Settings are merged.

### Configuration Schema

```json
{
  "$schema": "https://opencode.ai/config.json",
  "theme": "opencode",
  "model": "anthropic/claude-sonnet-4-5",
  "autoupdate": true,
  "customInstructions": "Additional instructions for the AI",
  "tools": {
    "bash": true,
    "read": true,
    "write": true,
    "custom_mytool": true
  },
  "plugin": [
    "my-plugin",
    "@org/another-plugin@1.0.0"
  ]
}
```

### Key Configuration Fields

| Field | Type | Description |
|-------|------|-------------|
| **$schema** | string | Schema URL for validation |
| **theme** | string | UI theme name |
| **model** | string | Default AI model |
| **autoupdate** | boolean | Auto-update OpenCode |
| **customInstructions** | string | Additional AI instructions |
| **tools** | object | Enable/disable tools |
| **plugin** | array | List of plugins to load |

### Tool Configuration

Enable or disable tools:

```json
{
  "tools": {
    "bash": true,
    "read": true,
    "write": false,
    "my_custom_tool": true
  }
}
```

### Per-Agent Configuration

```json
{
  "agent": {
    "my-agent": {
      "tools": {
        "bash": false,
        "custom_tool": true
      }
    }
  }
}
```

---

## Example Plugins

### Security Plugin - Block Dangerous Commands

```typescript
// .opencode/plugins/security.ts
import type { Plugin } from "@opencode-ai/plugin";

const DANGEROUS_PATTERNS = [
  /rm\s+-rf\s+\//,
  /mkfs/,
  /dd\s+if=/,
  />\s*\/dev\/sd[a-z]/,
];

export const SecurityPlugin: Plugin = (context) => ({
  "tool.execute.before": async (input, output) => {
    if (input.tool === "bash") {
      const cmd = output.args?.command || "";
      
      for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.test(cmd)) {
          throw new Error(`⚠️ Blocked dangerous command: ${cmd}`);
        }
      }
    }
  }
});

export default SecurityPlugin;
```

### Notification Plugin - Session Complete

```typescript
// .opencode/plugins/notifications.ts
import type { Plugin } from "@opencode-ai/plugin";
import notifier from "node-notifier";

export const NotificationPlugin: Plugin = (context) => ({
  "session.complete": async (session) => {
    notifier.notify({
      title: "OpenCode",
      message: "Session completed successfully!"
    });
  }
});

export default NotificationPlugin;
```

### File Protection Plugin

```typescript
// .opencode/plugins/protect-env.ts
import type { Plugin } from "@opencode-ai/plugin";

export const ProtectEnvPlugin: Plugin = (context) => ({
  "tool.execute.before": async (input, output) => {
    if (input.tool === "read" && output.args?.path?.endsWith(".env")) {
      throw new Error("⚠️ Reading .env files is not allowed");
    }
  }
});

export default ProtectEnvPlugin;
```

### Logging Plugin - Track Tool Usage

```typescript
// .opencode/plugins/logging.ts
import type { Plugin } from "@opencode-ai/plugin";

export const LoggingPlugin: Plugin = (context) => {
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
    }
  };
};

export default LoggingPlugin;
```

### Template Plugin - Auto-add File Headers

```typescript
// .opencode/plugins/templates.ts
import type { Plugin } from "@opencode-ai/plugin";

export const TemplatePlugin: Plugin = (context) => ({
  "file.create": async (input) => {
    const { path, content } = input;
    
    if (path.endsWith(".ts") && !content.includes("/**")) {
      const filename = path.split("/").pop();
      const header = `/**\n * ${filename}\n * Created: ${new Date().toISOString()}\n */\n\n`;
      input.content = header + content;
    }
  }
});

export default TemplatePlugin;
```

---

## Community Resources

### Documentation Resources

| Resource | URL | Description |
|----------|-----|-------------|
| **DeepWiki - OpenCode** | https://deepwiki.com/sst/opencode/ | In-depth guides and architecture |
| **DeepWiki - SDK** | https://deepwiki.com/sst/opencode/10.1-javascript-sdk | JavaScript SDK deep dive |
| **DeepWiki - opencode.json** | https://deepwiki.com/julianromli/opencode-template/3.1-opencode.json-reference | Config reference |
| **Plugin Manual** | https://github.com/Laelia-Succubus/Opencode-Plugin-Manual | Community plugin manual |
| **Plugin Guide Gist** | https://gist.github.com/johnlindquist/0adf1032b4e84942f3e1050aba3c5e4a | Comprehensive plugin guide |
| **Awesome Ecosystems** | https://awesome.ecosyste.ms/lists/awesome-opencode%2Fawesome-opencode | Ecosystem overview |

### Example Repositories

| Repository | URL | Focus |
|------------|-----|-------|
| **Opencode-Workflows** | https://github.com/IgorWarzocha/Opencode-Workflows | Workflows, prompts, scaffolds |
| **awesome-opencode-skills** | https://github.com/TheArchitectit/awesome-opencode-skills | Skills and patterns |
| **opencode-configs** | https://github.com/safzanpirani/opencode-configs | Configuration examples |

### Well-Structured Plugin Examples

The awesome-opencode repository maintains a YAML registry of high-quality plugins:

| Plugin Category | Examples in Registry |
|----------------|---------------------|
| **Authentication** | Antigravity Auth, OAuth plugins |
| **Development Tools** | Devcontainers, Context Analysis |
| **UI Enhancements** | Beads Plugin, MD Table Formatter |
| **Memory & Context** | Agent Memory, Dynamic Context Pruning |
| **Integrations** | Google services, External APIs |

Browse at: https://github.com/awesome-opencode/awesome-opencode/tree/main/data/plugins

### Plugin Structure Schema

The awesome-opencode registry uses a standardized YAML format:

```yaml
name: My Plugin
repo: username/repo-name
tagline: Short description
description: Longer description of functionality
tags: [category, feature]
scope: project  # or global
min_version: "1.0.0"
```

Example: https://github.com/awesome-opencode/awesome-opencode/tree/main/data/examples/plugin.yaml

---

## Quick Reference Tables

### Component Locations Summary

| Component | Global Location | Project Location | NPM Package |
|-----------|-----------------|------------------|-------------|
| **Plugins** | `~/.config/opencode/plugins/` | `.opencode/plugins/` | ✓ |
| **Tools** | `~/.config/opencode/tools/` | `.opencode/tools/` | ✗ |
| **Agents** | `~/.config/opencode/agents/` | `.opencode/agents/` | ✗ |
| **Skills** | `~/.config/opencode/skills/` | `.opencode/skills/` | ✗ |
| **Config** | `~/.config/opencode/opencode.json` | `./opencode.json` | ✗ |

### Import Paths

| What to Import | From Package | Example |
|----------------|--------------|---------|
| **Plugin Type** | `@opencode-ai/plugin` | `import type { Plugin }` |
| **Tool Helper** | `@opencode-ai/plugin` | `import { tool }` |
| **SDK Client** | `@opencode-ai/sdk` | `import { createOpencode }` |
| **API Types** | `@opencode-ai/sdk` | `import type { Session }` |

### Key Documentation Links

| Topic | Primary Link | Secondary Link |
|-------|-------------|----------------|
| **Plugins** | https://opencode.ai/docs/plugins/ | https://open-code.ai/en/docs/plugins |
| **Custom Tools** | https://opencode.ai/docs/custom-tools/ | https://open-code.ai/en/docs/custom-tools |
| **Configuration** | https://opencode.ai/docs/config/ | https://deepwiki.com/julianromli/opencode-template/3.1-opencode.json-reference |
| **SDK** | https://opencode.ai/docs/sdk/ | https://deepwiki.com/sst/opencode/10.1-javascript-sdk |
| **Examples** | https://github.com/awesome-opencode/awesome-opencode | https://github.com/IgorWarzocha/Opencode-Workflows |

---

## Additional Resources

### Type Definition Deep Dives

All types are generated from OpenAPI specifications, ensuring accuracy and consistency across the SDK.

- **Type Generation Tool**: `@hey-api/openapi-ts`
- **Type Export Paths**: 
  - Common types: `@opencode-ai/sdk`
  - Client API: `@opencode-ai/sdk/client`
  - Server API: `@opencode-ai/sdk/server`

### SDK Language Support

| Language | Package | Repository |
|----------|---------|------------|
| **JavaScript/TypeScript** | `@opencode-ai/sdk` | https://github.com/opencode-ai/opencode |
| **Go** | `opencode-sdk-go` | Listed in awesome-opencode |
| **Python** | `opencode-sdk-python` | Listed in awesome-opencode |

### Contributing to Ecosystem

To submit your plugin to awesome-opencode:

1. Create plugin following best practices
2. Add YAML file to `data/plugins/` directory
3. Follow schema at `data/examples/plugin.yaml`
4. Submit PR to https://github.com/awesome-opencode/awesome-opencode

---

## Getting Help

- **Official Docs**: https://opencode.ai/docs/
- **GitHub Issues**: https://github.com/opencode-ai/opencode/issues
- **Community Plugins**: https://github.com/awesome-opencode/awesome-opencode
- **Example Configs**: https://github.com/safzanpirani/opencode-configs

---

*This reference guide is maintained as part of the opencode-plugin-template repository.*
*For updates and contributions, see: https://github.com/rothnic/opencode-plugin-template*
