# Plugin best practices

## Start with the smallest useful plugin

The generated template intentionally wires only a few documented hooks. Add more only after you know why they belong in your plugin.

## Keep optional pieces optional

Delete these early if you do not need them:

- `.opencode/agent/`
- `.opencode/skill/`
- `.opencode/tools/`
- `.opencode/plugins/<plugin-name>/config/`
- `.opencode/plugins/<plugin-name>/state/`
- `.opencode/plugins/<plugin-name>/database/`

## Use structured logging

Plugin code should use `client.app.log()` through the generated `Logger` helper.

Avoid `console.log` in plugin source.

## Prefer documented hook patterns

The starter plugin uses:

- `event`
- `tool.execute.before`
- `tool.execute.after`

If you add a new hook, verify it against the current OpenCode docs before documenting it in your plugin.

## Keep tests lightweight at first

A single smoke test is enough at the start. Expand the test suite when you add behavior worth protecting.

## Prefer Bun-native storage utilities

When you need local persistence, reach for Bun-native building blocks first:

- `Bun.file()` / `Bun.write()` for file-based helpers
- `bun:sqlite` for local structured storage

Use the Node compatibility layer mainly for directory traversal and creation, since Bun still documents that as the recommended approach.
