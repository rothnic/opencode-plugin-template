# {{PLUGIN_NAME}}

{{PLUGIN_DESCRIPTION}}

## What this template gives you

- A publishable OpenCode plugin package with `index.ts` at the repository root.
- A local-plugin folder at `.opencode/plugins/{{PLUGIN_NAME}}/` for easy testing inside OpenCode projects.
- Optional starter directories for custom agents, skills, and tools.
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
│   ├── agent/               # optional template
│   ├── skill/               # optional template
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
4. Use `client.app.log()` through the provided `Logger` helper instead of `console.log`.
5. Extend the `Logger` if you later need extra log destinations rather than adding direct `console` calls in hooks or tools.
6. If you keep `database/`, prefer `bun:sqlite` prepared statements and WAL mode for local storage.

## Logging guardrails

The generated project includes a logging policy that matches the OpenCode plugin docs:

- `.opencode/plugins/{{PLUGIN_NAME}}/utils/index.ts` contains the Logger you are expected to use,
- `lefthook` warns in `pre-commit` when direct `console.*` usage is detected in plugin code,
- `lefthook` blocks in `pre-push` until those calls are removed.
