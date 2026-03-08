# Plugin best practices

## Start with the smallest useful plugin

The generated template intentionally wires only a few documented hooks. Add more only after you know why they belong in your plugin.

## Keep optional pieces optional

Delete these early if you do not need them:

- `.opencode/agents/`
- `.opencode/commands/`
- `.opencode/skills/`
- `.opencode/tools/`
- `.opencode/plugins/<plugin-name>/config/`
- `.opencode/plugins/<plugin-name>/state/`
- `.opencode/plugins/<plugin-name>/database/`

## Use structured logging

Plugin code should use `client.app.log()` through the generated `Logger` helper.

Treat the generated `Logger` as the single place to evolve logging behavior:

- add service-level metadata there,
- add any additional destinations there,
- keep hook and tool code free of direct `console` calls.

Avoid `console.log` in plugin source.

The generated `lefthook.yml` warns at pre-commit time and blocks at pre-push time if direct `console.*` calls are found in plugin code.

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
