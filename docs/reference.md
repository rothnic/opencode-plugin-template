# Reference

## OpenCode plugin directories

| Purpose | Location |
| --- | --- |
| Project-local plugins | `.opencode/plugins/` |
| Global plugins | `~/.config/opencode/plugins/` |
| Project-local plugin state (recommended template pattern) | `.opencode/state/` |
| Global plugin state (recommended template pattern) | `~/.config/opencode/state/` |

## Generated template files

| Path | Purpose |
| --- | --- |
| `index.ts` | Package entry point for npm/plugin loading |
| `.opencode/plugins/<plugin-name>/index.ts` | Main plugin implementation |
| `.opencode/plugins/<plugin-name>/hooks/` | Hook handlers |
| `.opencode/plugins/<plugin-name>/utils/` | Logger and shared helpers |
| `.opencode/plugins/<plugin-name>/config/` | Optional config loader |
| `.opencode/plugins/<plugin-name>/state/` | Optional state helper |
| `.opencode/agent/template.md` | Optional custom agent starter |
| `.opencode/skill/template.md` | Optional custom skill starter |
| `.opencode/tools/example-tool.ts` | Optional custom tool starter |
| `tests/plugin.test.ts` | Starter smoke test |

## Documented hook patterns used in the generated plugin

The starter plugin only wires hooks that are clearly documented in current OpenCode docs:

- `event`
- `tool.execute.before`
- `tool.execute.after`

The generated hook file also includes commented examples for:

- `shell.env`
- `experimental.session.compacting`

## Logging

Use `client.app.log()` instead of `console.log` in plugin code. The generated Logger helper wraps the documented structured logging shape.
