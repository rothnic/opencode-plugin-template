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
- `database/` for local Bun SQLite storage under `.opencode/state/` or `~/.config/opencode/state/`
- `.opencode/agent/`, `.opencode/skill/`, and `.opencode/tools/` starter templates

If you do not need a helper, delete it early instead of carrying unused abstractions.

## Logging

The generated plugin already includes a `Logger` helper under `.opencode/plugins/{{PLUGIN_NAME}}/utils/`.

- Use it for all plugin logging so messages flow through `client.app.log()`.
- Add future destinations there if you later want to fan logs out to a file or another service.
- Avoid direct `console.*` usage in plugin code; `lefthook` warns during `pre-commit` and blocks during `pre-push`.
