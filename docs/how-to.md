# How-to

## How do I keep the template small?

Delete optional directories during setup or right after generation.

## How do I add persistent state later?

Keep the generated `state/` helper and store plugin data under:

- `.opencode/state/<plugin-name>.json`
- `~/.config/opencode/state/<plugin-name>.json`

## How do I add custom tools later?

Keep `.opencode/tools/example-tool.ts`, rename it, and update the exported schema and handler.

## How do I add a custom agent later?

Duplicate `.opencode/agent/template.md`, rename it, and fill in the prompt and referenced files.

## How do I test a generated plugin inside OpenCode?

Symlink the generated `.opencode/plugins/<plugin-name>/` directory into a consumer project's `.opencode/plugins/` directory.
