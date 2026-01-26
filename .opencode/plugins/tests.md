# Plugin Tests

This directory contains unit and integration tests for the OpenCode plugin.

## Test Structure

```
__tests__/
├── utils.test.ts         # Unit tests for utility functions
├── integration.test.ts   # Integration tests for full plugin
└── README.md            # This file
```

## Running Tests

```bash
# Run all tests
bun test

# Run plugin tests specifically
bun test .opencode/plugin/__tests__

# Run with watch mode
bun test --watch

# Run with coverage
bun test --coverage
```

## Writing Tests

### Unit Tests

Test individual functions and utilities:

```typescript
import { describe, test, expect } from "bun:test";
import { myUtility } from "../utils";

describe("myUtility", () => {
  test("should do something", () => {
    const result = myUtility("input");
    expect(result).toBe("expected");
  });
});
```

### Integration Tests

Test the full plugin with mocked context:

```typescript
import { describe, test, expect, beforeAll } from "bun:test";
import type { PluginContext } from "../types";

describe("Plugin Integration", () => {
  let plugin: any;
  let mockContext: PluginContext;

  beforeAll(async () => {
    const pluginModule = await import("../index");
    plugin = pluginModule.MyPlugin;
    
    mockContext = {
      // ... mock context
    };
  });

  test("should work correctly", async () => {
    const hooks = await plugin(mockContext);
    // Test hooks behavior
  });
});
```

## Best Practices

1. **Test Coverage**: Aim for >80% coverage on critical paths
2. **Mock External Dependencies**: Use Bun's `mock()` function
3. **Test Edge Cases**: Include error conditions and boundary cases
4. **Keep Tests Fast**: Unit tests should run in milliseconds
5. **Descriptive Names**: Test names should clearly state what they test
6. **Arrange-Act-Assert**: Structure tests clearly

## Common Patterns

### Mocking Logger

```typescript
const logMock = mock(() => {});
const context = {
  client: { app: { log: logMock } },
  // ... other context
};
```

### Testing Async Hooks

```typescript
test("hook should complete successfully", async () => {
  await expect(hooks["hook.name"](input)).resolves.not.toThrow();
});
```

### Testing Error Cases

```typescript
test("should throw on invalid input", async () => {
  await expect(hooks["hook.name"](invalidInput)).rejects.toThrow("Expected error");
});
```

## Additional Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Plugin Development Guide](../../../BEST_PRACTICES.md)
- [Testing Best Practices](../../../tests/README.md)
