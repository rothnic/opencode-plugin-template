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
| `.opencode/agents/template.md` | Optional bundled agent starter |
| `.opencode/commands/template.md` | Optional bundled command starter |
| `.opencode/skills/template/SKILL.md` | Optional bundled skill starter |
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

## Bundled OpenCode asset patterns

The generated project includes starter examples for the documented auto-discovery paths:

- agents: `.opencode/agents/*.md`
- commands: `.opencode/commands/*.md`
- skills: `.opencode/skills/<name>/SKILL.md`
- instructions: `AGENTS.md`

## Starter frontmatter shapes used by the template

The template keeps the active starter files deliberately small and only uses documented fields by default.

### Agent markdown

- location: `.opencode/agents/*.md`
- active fields used by the starter: `description`, `mode`
- documented fields you can uncomment later: `model`, `temperature`, `steps`, `disable`, `hidden`, `color`, `top_p`, `tools`, `permission`
- valid `mode` values: `primary`, `subagent`, `all`

### Command markdown

- location: `.opencode/commands/*.md`
- active fields used by the starter: `description`
- documented fields you can uncomment later: `agent`, `model`, `subtask`
- the markdown body becomes the command template

### Skill markdown

- location: `.opencode/skills/<name>/SKILL.md`
- active fields used by the starter: `name`, `description`
- documented optional fields: `license`, `compatibility`, `metadata`
- `name` must match the containing directory name

### Instructions

- primary project instructions live in `AGENTS.md`
- additional instruction files can be referenced through `opencode.json` using the `instructions` array
