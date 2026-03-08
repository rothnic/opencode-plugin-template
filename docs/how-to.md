# How-to

## How do I keep the template small?

Delete optional directories during setup or right after generation.

## How do I add persistent state later?

Keep the generated `state/` helper and store plugin data under:

- `.opencode/state/<plugin-name>.json`
- `~/.config/opencode/state/<plugin-name>.json`

## How do I add custom tools later?

Keep `.opencode/tools/example-tool.ts`, rename it, and update the exported `tool(...)` definition.

Register it from `.opencode/plugins/<plugin-name>/index.ts` by adding it to the returned `tool` object.

## How do I add a custom agent later?

Duplicate `.opencode/agents/template.md`, rename it, and fill in the markdown body with the agent prompt.

The file name becomes the agent name, so rename it early.

## How do I add a custom command later?

Duplicate `.opencode/commands/template.md`, rename it, and replace the markdown body with the prompt you want `/your-command` to run.

The file name becomes the command name.

## How do I add a custom skill later?

Copy `.opencode/skills/template/` to a new kebab-case directory name and update `SKILL.md` so the `name` field matches the directory name.

## How do I bundle instructions with the plugin project?

Use the generated `AGENTS.md` for project-wide instructions.

If you later want to split instructions across multiple markdown files, add an `opencode.json` and use its `instructions` array to reference those files.

## How do I test a generated plugin inside OpenCode?

Symlink the generated `.opencode/plugins/<plugin-name>/` directory into a consumer project's `.opencode/plugins/` directory.

If you want bundled agents, commands, or skills available there too, symlink `.opencode/agents/`, `.opencode/commands/`, and `.opencode/skills/` into the consumer project's `.opencode/` directory.
