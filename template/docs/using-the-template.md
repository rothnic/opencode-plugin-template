# Using the generated plugin

## Core scaffold

Every generated plugin starts with:

- the local plugin implementation under `.opencode/plugins/{{PLUGIN_NAME}}/`
- starter hooks for `event`, `tool.execute.before`, and `tool.execute.after`
- the shared `Logger` helper and logging guardrails
- Bun `build`, `lint`, and `test` commands

## Starter hooks

The generated plugin starts with:

- `event` for documented OpenCode events such as `session.created` and `session.idle`
- `tool.execute.before` for command validation
- `tool.execute.after` for lightweight post-tool logging

## Optional add-ons

The generated project may include these **only if you selected them during setup**:

- `config/` for loading plugin-specific settings from `opencode.json`
- `state/` for saving plugin data under `.opencode/state/` or `~/.config/opencode/state/`
- `database/` for local Bun SQLite storage under `.opencode/state/` or `~/.config/opencode/state/`
- `.opencode/agents/`, `.opencode/commands/`, `.opencode/skills/`, and `.opencode/tools/` starter templates

If you do not need a helper, delete it early instead of carrying unused abstractions.

If you skipped an add-on during setup, that directory is intentionally absent.

## Validation commands

After scaffolding, use the same Bun-native commands the template CI exercises:

- `bun install`
- `bun run build`
- `bun run lint`
- `bun test`

## Bundled OpenCode assets

The generated project can ship opinionated OpenCode components alongside the plugin code itself:

- agents from `.opencode/agents/*.md`
- commands from `.opencode/commands/*.md`
- skills from `.opencode/skills/<name>/SKILL.md`
- project instructions from `AGENTS.md`

That lets you keep plugin behavior and companion OpenCode workflows in one repository instead of maintaining a second config tree by hand.

Those assets load automatically inside the generated repository itself. If you are testing the plugin from a separate consumer repository, you still need to symlink or copy the relevant `.opencode` directories into that consumer project because package installation alone does not project those files outward.

## Logging

The generated plugin already includes a `Logger` helper under `.opencode/plugins/{{PLUGIN_NAME}}/utils/`.

- Use it for all plugin logging so messages flow through `client.app.log()`.
- Add future destinations there if you later want to fan logs out to a file or another service.
- Avoid direct `console.*` usage in plugin code; `lefthook` warns during `pre-commit` and blocks during `pre-push`.

## Add-ons later

The generated plugin is designed so the core scaffold can stand on its own. If you later need an add-on, add the matching directory and uncomment the relevant integration point in `.opencode/plugins/{{PLUGIN_NAME}}/index.ts` when applicable.
