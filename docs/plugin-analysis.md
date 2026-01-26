# OpenCode Plugin Structure Analysis

Analysis of existing OpenCode plugins to identify best practices and common patterns.

## Directory Structure Patterns

### Pattern 1: `.opencode/plugin/` (singular)
Used by: type-inject

```
.opencode/
  plugin/           # Plugin code (singular!)
    index.ts        # Main plugin file
    utils.ts        # Helper utilities
```

**package.json:**
```json
{
  "main": "./.opencode/plugin/index.ts",
  "files": [".opencode/"]
}
```

### Pattern 2: Root-level with `plugin/` directory
Used by: opencode-devcontainers

```
plugin/
  index.js          # Main plugin file
  helpers.js        # Utilities
  command/          # Subdirectories for organization
```

**package.json:**
```json
{
  "main": "plugin/index.js"
}
```

### Pattern 3: Root-level single file
Used by: opencode-helicone-session

```
index.ts            # Single plugin file in root
dist/               # Compiled output
  index.js
  index.d.ts
```

**package.json:**
```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"]
}
```

## Key Findings

### 1. Directory Naming: `plugin` NOT `plugins`
**CRITICAL**: OpenCode expects `.opencode/plugin/` (singular), not `.opencode/plugin/` (plural).

### 2. Project Organization Patterns

#### Simple Plugins (< 200 lines)
- Single file in root or plugin/ directory
- Example: opencode-helicone-session (116 lines)

#### Medium Plugins (200-500 lines)
- plugin/ directory with helpers
- Subdirectories for logical grouping
- Example: opencode-devcontainers

#### Complex Plugins (> 500 lines)
- .opencode/plugin/ structure
- Separate files for utilities, types, hooks
- Example: type-inject (monorepo with shared core)

### 3. Common Plugin Features

Based on analysis of 10+ plugins:

#### Essential Features (all plugins have these)
- Plugin export as named function or default export
- Type imports from `@opencode-ai/plugin`
- Return object with hook implementations

#### Common Advanced Features
1. **Configuration Management** (60% of plugins)
   - Load from opencode.json or package.json
   - Runtime configuration via context
   - Default config with overrides

2. **Event Handling** (40% of plugins)
   - session.created, session.updated events
   - Maintain session state

3. **Tool Registration** (30% of plugins)
   - Custom MCP tools
   - Integration with external services
   - Type checking, validation, search

4. **Hook Implementations** (50% of plugins)
   - file.read.before/after - inject content
   - file.write.before/after - validation
   - tool.execute.before/after - intercept tools
   - auth loader - custom authentication

5. **State Persistence** (20% of plugins)
   - Session-specific state
   - Global plugin state
   - Cleanup on session end

### 4. Package.json Best Practices

#### Required Fields
```json
{
  "name": "@scope/opencode-plugin-name",
  "version": "1.0.0",
  "type": "module",
  "main": "./path/to/plugin",
  "peerDependencies": {
    "@opencode-ai/plugin": ">=1.0.0"
  }
}
```

#### Common Optional Fields
```json
{
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", ".opencode"],
  "scripts": {
    "build": "bun build index.ts --outdir dist",
    "typecheck": "tsc --noEmit"
  }
}
```

### 5. File Organization Within Plugin Directory

```
.opencode/
  plugin/              # Main plugin (singular!)
    index.ts           # Plugin entry point
    types.ts           # Type definitions
    utils.ts           # Helper utilities
    hooks.ts           # Hook implementations
  agent/               # Custom agents (markdown)
    agent-name.md
  skill/               # Custom skills (markdown)
    skill-name.md
  tool/                # Custom tools (if separate from plugin)
    tool-name.ts
```

### 6. Testing Patterns

#### Unit Tests
- Co-located `.test.ts` files (Bun convention)
- Mock OpenCode context
- Test individual functions

#### Integration Tests
- tests/ directory in project root
- Test full plugin lifecycle
- Verify hook behavior

### 7. Documentation Patterns

Common docs in plugin repos:
- README.md - Installation, configuration, usage
- AGENTS.md - Agent documentation (if providing agents)
- CONTRIBUTING.md - Development guidelines
- docs/ - Additional documentation

### 8. Build & Distribution Patterns

#### Option 1: No Build Step (TypeScript)
```json
{
  "main": "./plugin/index.ts",
  "type": "module"
}
```
OpenCode loads TypeScript directly with Bun.

#### Option 2: Compiled (JavaScript)
```json
{
  "main": "./dist/index.js",
  "scripts": {
    "build": "bun build",
    "prepublishOnly": "bun run build"
  },
  "files": ["dist"]
}
```
Compile to JavaScript for compatibility.

## Recommendations for Template

Based on analysis of existing plugins:

### 1. Use `.opencode/plugin/` (singular)
Match OpenCode's expected structure.

### 2. Provide Scalable Organization
```
.opencode/
  plugin/
    index.ts         # Main entry point
    types/           # Type definitions
      index.ts
    utils/           # Utilities
      logger.ts
      security.ts
    config/          # Configuration
      index.ts
    state/           # State management
      index.ts
    hooks/           # Hook implementations
      index.ts
    *.test.ts        # Co-located tests
```

### 3. Include All Common Patterns
- Configuration loading (global/project/runtime)
- State persistence (global/project)
- Event handling (session lifecycle)
- Tool registration examples
- Hook implementations for all types
- Security utilities (validation, sanitization)
- Logging (using client.app.log, not console.log)

### 4. Package.json Structure
```json
{
  "name": "{{PLUGIN_NAME}}",
  "main": "./.opencode/plugin/index.ts",
  "type": "module",
  "files": [".opencode"],
  "peerDependencies": {
    "@opencode-ai/plugin": ">=1.0.0"
  }
}
```

### 5. Support Multiple Distribution Methods
- npm package
- Local symlink
- Git submodule
- Direct GitHub reference

## Plugin Feature Matrix

| Feature | Helicone | DevContainers | TypeInject | Template Should Have |
|---------|----------|---------------|------------|---------------------|
| Config Management | ❌ | ✅ | ✅ | ✅ |
| State Persistence | ✅ (in-memory) | ✅ (filesystem) | ❌ | ✅ (both) |
| Event Handling | ✅ | ✅ | ❌ | ✅ |
| Custom Tools | ❌ | ✅ | ✅ | ✅ (example) |
| Auth Loader | ✅ | ❌ | ❌ | ✅ (example) |
| File Hooks | ❌ | ❌ | ✅ | ✅ (examples) |
| Tool Hooks | ❌ | ✅ | ❌ | ✅ (examples) |
| Tests | ❌ | ✅ | ❌ | ✅ |
| TypeScript | ✅ | ❌ (JS) | ✅ | ✅ |
| Build Step | ✅ (to dist/) | ❌ | ❌ | ❌ (optional) |

## Conclusion

The template should:
1. ✅ Use `.opencode/plugin/` (singular) directory structure
2. ✅ Provide batteries-included utilities (config, state, security, logging)
3. ✅ Include examples of ALL common hook types
4. ✅ Support scalable organization with subdirectories
5. ✅ Include comprehensive tests
6. ✅ Provide clear documentation
7. ✅ Use TypeScript without build step (Bun native)
8. ✅ Follow OpenCode naming conventions

**Action Required**: Rename `.opencode/plugin/` to `.opencode/plugin/` (singular) throughout the template.
