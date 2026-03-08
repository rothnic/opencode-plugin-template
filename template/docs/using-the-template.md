# Using the generated plugin

## Starter hooks

The generated plugin starts with:

- `event` for documented OpenCode events such as `session.created` and `session.idle`
- `tool.execute.before` for command validation
- `tool.execute.after` for lightweight post-tool logging

## Optional helpers

The generated project may include:

- `config/` for loading plugin-specific settings from `opencode.json`
- `state/` for saving plugin data under `.opencode/state/` or `~/.config/opencode/state/`
- `.opencode/agent/`, `.opencode/skill/`, and `.opencode/tools/` starter templates

If you do not need a helper, delete it early instead of carrying unused abstractions.
