# {{PLUGIN_NAME}}

{{PLUGIN_DESCRIPTION}}

## What this template gives you

- A publishable OpenCode plugin package with `index.ts` at the repository root.
- A local-plugin folder at `.opencode/plugins/{{PLUGIN_NAME}}/` for easy testing inside OpenCode projects.
- Optional starter directories for custom agents, commands, skills, and tools.
- A single Bun smoke test so you can confirm the plugin loads before expanding the project.
- Optional `config/`, `state/`, and Bun-native `database/` helpers you can keep or delete during setup.

## Repository structure

```text
.
├── .opencode/
│   ├── plugins/
│   │   └── {{PLUGIN_NAME}}/
│   │       ├── index.ts
│   │       ├── hooks/
│   │       ├── utils/
│   │       ├── config/      # optional helper
│   │       ├── state/       # optional helper
│   │       └── database/    # optional helper (bun:sqlite)
│   ├── agents/              # optional bundled agent starter
│   ├── commands/            # optional bundled command starter
│   ├── skills/
│   │   └── template/
│   │       └── SKILL.md     # optional bundled skill starter
│   └── tools/               # optional template
├── tests/
│   └── plugin.test.ts
├── index.ts
└── package.json
```

## Local development with OpenCode

To try the plugin as a project-local plugin in another repository:

```bash
mkdir -p /path/to/consumer/.opencode/plugins
ln -s /path/to/{{PLUGIN_NAME}}/.opencode/plugins/{{PLUGIN_NAME}} \
  /path/to/consumer/.opencode/plugins/{{PLUGIN_NAME}}
```

OpenCode will automatically load the plugin from the consumer project's `.opencode/plugins/` directory.

If you also want the bundled agents, commands, or skills available in that consumer project, symlink those directories too:

```bash
mkdir -p /path/to/consumer/.opencode
ln -s /path/to/{{PLUGIN_NAME}}/.opencode/agents /path/to/consumer/.opencode/agents
ln -s /path/to/{{PLUGIN_NAME}}/.opencode/commands /path/to/consumer/.opencode/commands
ln -s /path/to/{{PLUGIN_NAME}}/.opencode/skills /path/to/consumer/.opencode/skills
```

Bundled agents, commands, skills, and instructions load automatically when you work inside this generated repository. They are not injected into some other repository just because this package exists in `node_modules`, so keep the symlink/copy step in mind when testing against a separate consumer project.

## Publish to npm

Because the package entry point is `index.ts`, you can also publish this repository and load it from `opencode.json`:

```json
{
  "plugin": ["{{PLUGIN_NAME}}"]
}
```

## Next steps

1. Update `.opencode/plugins/{{PLUGIN_NAME}}/index.ts` with your plugin logic.
2. Remove any optional directories you do not need.
3. Run `bun test` after each meaningful change.
4. Run `bun run build` to type-check the generated project before publishing or linking it.
5. Run `bun run lint` so the generated naming and logging guardrails stay green.
6. Use `client.app.log()` through the provided `Logger` helper instead of `console.log`.
7. Extend the `Logger` if you later need extra log destinations rather than adding direct `console` calls in hooks or tools.
8. If you keep `database/`, prefer `bun:sqlite` prepared statements and WAL mode for local storage.
9. Rename the bundled agent, command, and skill starters early so their names match your actual workflow.

## Logging guardrails

The generated project includes a logging policy that matches the OpenCode plugin docs:

- `.opencode/plugins/{{PLUGIN_NAME}}/utils/index.ts` contains the Logger you are expected to use,
- `lefthook` warns in `pre-commit` when direct `console.*` usage is detected in plugin code,
- `lefthook` blocks in `pre-push` until those calls are removed.

Running `bun install` before `git init` is fine: the generated `prepare` hook skips
`lefthook install` until the project is actually inside a Git repository.

## Bundled OpenCode components

The generated project includes starter examples for the documented OpenCode discovery paths:

- `.opencode/agents/*.md`
- `.opencode/commands/*.md`
- `.opencode/skills/<name>/SKILL.md`
- `AGENTS.md`

These are loaded automatically when you work inside the generated repository, so you can pair plugin code with opinionated agents, commands, skills, and instructions from the same project.
