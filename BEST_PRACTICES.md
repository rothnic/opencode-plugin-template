# Best Practices Guide

This guide outlines best practices for developing OpenCode plugins using this template.

## Plugin Development

### 1. Keep Plugins Focused

- Each plugin should have a clear, single purpose
- Don't try to do too much in one plugin
- Split complex functionality into multiple plugins

### 2. Handle Errors Gracefully

```typescript
"tool.execute.before": async (input, output) => {
  try {
    // Your logic here
  } catch (error) {
    console.error("Plugin error:", error);
    // Don't throw unless you want to block the operation
  }
}
```

### 3. Minimize Performance Impact

- Avoid heavy computations in hooks
- Use async operations efficiently
- Cache expensive operations when possible

```typescript
const cache = new Map();

"tool.execute.before": async (input, output) => {
  if (cache.has(input.tool)) {
    return cache.get(input.tool);
  }
  
  const result = await expensiveOperation(input);
  cache.set(input.tool, result);
  return result;
}
```

### 4. Log Appropriately

- Use console.log for informational messages
- Use console.error for errors
- Keep logs concise and useful
- Don't spam the console

```typescript
// Good
console.log("✓ Plugin initialized");

// Avoid
console.log("Starting plugin...");
console.log("Loading configuration...");
console.log("Initializing handlers...");
// ... etc
```

### 5. Respect User Privacy

- Never log sensitive information
- Ask for permission before accessing private files
- Don't transmit data without user consent

### 6. Document Your Plugin

- Write clear README with examples
- Include JSDoc comments in code
- Document all hooks and their behavior
- Provide usage examples

## Hook Best Practices

### tool.execute.before

Use this to:
- Validate tool inputs
- Block dangerous operations
- Add logging/auditing
- Modify tool parameters

```typescript
"tool.execute.before": async (input, output) => {
  // Validate
  if (input.tool === "bash" && !output.args?.command) {
    throw new Error("Command is required");
  }
  
  // Block dangerous operations
  if (output.args?.command?.includes("rm -rf /")) {
    throw new Error("Dangerous command blocked");
  }
  
  // Log
  console.log(`Executing: ${input.tool}`);
}
```

### tool.execute.after

Use this to:
- Post-process results
- Log outcomes
- Update analytics
- Trigger follow-up actions

```typescript
"tool.execute.after": async (input) => {
  console.log(`Completed: ${input.tool}`);
  
  // Track tool usage
  await updateAnalytics(input.tool);
}
```

### file.create / file.edit

Use these to:
- Enforce file naming conventions
- Add automatic formatting
- Validate file contents
- Add file templates

```typescript
"file.create": async (input) => {
  const { path, content } = input;
  
  // Enforce naming convention
  if (!path.match(/^[a-z-]+\.ts$/)) {
    throw new Error("Files must use kebab-case.ts");
  }
  
  // Add file header template
  if (!content.includes("/**")) {
    input.content = `/**\n * ${path}\n */\n\n${content}`;
  }
}
```

### permission.request

Use this to:
- Auto-approve safe operations
- Block risky operations
- Log permission requests
- Implement custom approval logic

```typescript
"permission.request": async (input) => {
  const { type, resource } = input;
  
  // Auto-approve read operations in safe directories
  if (type === "read" && resource.startsWith("/home/user/safe/")) {
    return true;
  }
  
  // Block access to sensitive files
  if (resource.includes(".env")) {
    return false;
  }
  
  // Let user decide for everything else
  return undefined;
}
```

## TypeScript Best Practices

### Use Proper Types

```typescript
// Good
interface ToolInput {
  tool: string;
  args: Record<string, any>;
}

"tool.execute.before": async (input: ToolInput, output: any) => {
  // ...
}

// Avoid
"tool.execute.before": async (input: any, output: any) => {
  // ...
}
```

### Export Type Definitions

```typescript
// types.ts
export interface MyPluginConfig {
  enabled: boolean;
  options: {
    verbose?: boolean;
  };
}

// index.ts
import type { MyPluginConfig } from "./types";
```

## Testing Your Plugin

### Local Testing

1. Create a test project with OpenCode
2. Symlink your plugin:
   ```bash
   ln -s /path/to/plugin/.opencode/plugins/index.ts .opencode/plugins/test.ts
   ```
3. Test various scenarios
4. Check logs for errors

### Test Checklist

- [ ] Plugin loads without errors
- [ ] Hooks execute at correct times
- [ ] Custom tools work as expected
- [ ] Error handling works
- [ ] Performance is acceptable
- [ ] No security vulnerabilities

## Version Management

### Semantic Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Use the version bump script:

```bash
bun run version:bump patch  # Bug fixes
bun run version:bump minor  # New features
bun run version:bump major  # Breaking changes
```

### Changelog

Maintain a CHANGELOG.md:

```markdown
# Changelog

## [1.2.0] - 2026-01-26

### Added
- New custom tool for X

### Changed
- Improved error handling in Y

### Fixed
- Bug in Z when...
```

## Publishing

### Pre-publish Checklist

- [ ] All tests pass
- [ ] Documentation is up to date
- [ ] Version is bumped
- [ ] CHANGELOG is updated
- [ ] No sensitive data in code
- [ ] Dependencies are up to date
- [ ] License is correct

### Publishing to npm

```bash
# Build
bun run build

# Test in a real project
npm link
cd ../test-project
npm link my-plugin

# Publish
npm publish
```

## Security Considerations

### Input Validation

Always validate inputs in hooks:

```typescript
"tool.execute.before": async (input, output) => {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid input");
  }
  
  if (!input.tool || typeof input.tool !== "string") {
    throw new Error("Invalid tool name");
  }
}
```

### Sanitize User Input

```typescript
function sanitizeCommand(cmd: string): string {
  // Remove potentially dangerous characters
  return cmd.replace(/[;&|`$()]/g, "");
}
```

### Block Dangerous Operations

```typescript
const DANGEROUS_PATTERNS = [
  /rm\s+-rf\s+\//,
  /mkfs/,
  /dd\s+if=/,
  />\s*\/dev\/sd[a-z]/,
  /curl.*\|\s*sh/,
  /wget.*\|\s*sh/,
];

function isDangerous(cmd: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(cmd));
}
```

## Common Pitfalls to Avoid

1. **Blocking the event loop**: Use async/await properly
2. **Memory leaks**: Clean up resources in session.complete
3. **Race conditions**: Be careful with shared state
4. **Throwing errors unnecessarily**: Only throw to block operations
5. **Ignoring errors**: Always handle errors appropriately
6. **Excessive logging**: Keep logs meaningful and minimal
7. **Not testing edge cases**: Test error conditions thoroughly

## Getting Help

- Check [OpenCode documentation](https://opencode.ai/docs/)
- Search existing plugins for examples
- Ask in OpenCode community forums
- Open an issue in this template repository
