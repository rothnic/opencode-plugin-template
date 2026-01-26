# Plugin Tests

This directory contains comprehensive tests to verify that your OpenCode plugin components are properly structured and can be registered with OpenCode.

## Test Structure

### `plugin.test.ts`
Tests the main plugin structure and hook registration:
- Verifies plugin exports correct function signature
- Checks all required hooks are present and properly typed
- Tests hook behavior (e.g., dangerous command blocking)
- Validates plugin context handling

### `tools.test.ts`
Tests custom tool registration and functionality:
- Verifies tool structure and required fields
- Checks tool naming conventions
- Validates JSON Schema for tool inputs
- Tests tool handler execution
- Simulates OpenCode tool registration process

### `agents.test.ts`
Tests custom agent configurations:
- Verifies agent structure and required fields
- Checks agent naming conventions
- Validates agent instructions quality
- Tests agent tool references
- Simulates OpenCode agent registration process

### `skills.test.ts`
Tests skill definitions and content:
- Verifies skill structure and required fields
- Checks skill content quality and formatting
- Validates skill tags for searchability
- Tests skill serialization
- Simulates OpenCode skill registration process

### `integration.test.ts`
End-to-end integration tests:
- Tests loading all components together
- Simulates complete OpenCode registration process
- Verifies component compatibility
- Tests error handling across components
- Validates TypeScript type safety

## Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/plugin.test.ts

# Run tests in watch mode
bun test --watch

# Run tests with coverage (if configured)
bun test --coverage
```

## Test Coverage

These tests verify:

### ✅ Plugin Registration
- Plugin function signature
- Hook exports and types
- Hook async behavior
- Context handling

### ✅ Custom Tools
- Tool structure and metadata
- JSON Schema validation
- Handler execution
- Tool naming conventions
- Registration simulation

### ✅ Custom Agents
- Agent configuration structure
- Instructions quality
- Tool references
- Model and temperature settings
- Registration simulation

### ✅ Skills
- Skill content structure
- Markdown formatting
- Tag-based filtering
- Serialization
- Registration simulation

### ✅ Integration
- Component loading
- Cross-component compatibility
- Complete registration flow
- Error handling
- Type safety

## Writing New Tests

When adding new plugin components, add corresponding tests:

1. **For new tools**: Add tests to `tools.test.ts`
   ```typescript
   test("my new tool should have correct structure", async () => {
     const { myNewTool } = await import("../.opencode/tools/my-tool");
     expect(myNewTool.name).toBeDefined();
     // ... more assertions
   });
   ```

2. **For new agents**: Add tests to `agents.test.ts`
   ```typescript
   test("my new agent should have valid configuration", async () => {
     const { myNewAgent } = await import("../.opencode/agents/my-agent");
     expect(myNewAgent.name).toBeDefined();
     // ... more assertions
   });
   ```

3. **For new hooks**: Add tests to `plugin.test.ts`
   ```typescript
   test("plugin should export my new hook", async () => {
     const hooks = await plugin(mockContext);
     expect(typeof hooks["my.new.hook"]).toBe("function");
   });
   ```

## Test Best Practices

1. **Keep tests independent**: Each test should be able to run in isolation
2. **Use descriptive names**: Test names should clearly describe what they verify
3. **Test behavior, not implementation**: Focus on what the code does, not how it does it
4. **Include edge cases**: Test error conditions and boundary cases
5. **Keep tests fast**: Avoid unnecessary delays or external dependencies

## Verifying OpenCode Registration

The tests simulate OpenCode's registration process to ensure your components will work when loaded by OpenCode:

```typescript
// Example: Tool registration verification
const toolRegistry = new Map();
for (const [key, tool] of Object.entries(customTools)) {
  toolRegistry.set(tool.name, tool);
}
expect(toolRegistry.has("my_tool")).toBe(true);
```

This approach ensures:
- Components have the correct structure
- Naming conventions are followed
- All required fields are present
- Components can be serialized/deserialized
- Cross-references between components are valid

## Debugging Failed Tests

If tests fail:

1. **Read the error message carefully**: It will tell you what assertion failed
2. **Check the test file**: Look at what the test is verifying
3. **Verify your component**: Ensure it has all required fields
4. **Check naming conventions**: Tool names use `snake_case`, agents/skills use `kebab-case`
5. **Validate schemas**: Ensure JSON schemas are valid
6. **Review types**: Make sure TypeScript types match expected interfaces

## CI/CD Integration

These tests are automatically run:
- On every commit (via git hooks with lefthook)
- On pull requests (via GitHub Actions)
- Before publishing (via npm scripts)

To skip tests temporarily (not recommended):
```bash
git commit --no-verify
```

## Additional Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [OpenCode Plugin Documentation](https://opencode.ai/docs/plugins/)
- [Plugin Development Guide](../BEST_PRACTICES.md)
