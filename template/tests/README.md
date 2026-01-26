# Plugin Tests

Basic test structure for your OpenCode plugin.

## Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/plugin.test.ts

# Run tests in watch mode
bun test --watch
```

## Test Files

- `plugin.test.ts` - Tests for main plugin functionality
- `tools.test.ts` - Tests for custom tools (if included)
- `agents.test.ts` - Tests for custom agents (if included)
- `skills.test.ts` - Tests for custom skills (if included)
- `integration.test.ts` - End-to-end integration tests

## Writing Tests

Add your test files in this directory. Example:

```typescript
import { describe, test, expect } from "bun:test";
import { MyPlugin } from "../index";

describe("MyPlugin", () => {
  test("should export a function", () => {
    expect(typeof MyPlugin).toBe("function");
  });
});
```

For more details on testing, see the [Plugin Best Practices](../docs/plugin-best-practices.md) documentation.
