# Tests

Start with a single smoke test in this directory and grow the suite only as your plugin grows.

- `plugin.test.ts` verifies that your package exports a valid OpenCode plugin function.
- Add more tests when you introduce custom tools, config helpers, or stateful behavior.

Run the starter test with:

```bash
bun test tests/plugin.test.ts
```
