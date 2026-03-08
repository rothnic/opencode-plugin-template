# OpenCode Plugin Template

A `bun create` template for building an OpenCode plugin repository that is ready to:

- ship as an npm package,
- be tested locally as a project plugin under `.opencode/plugins/<plugin-name>/`, and
- grow into agents, skills, custom tools, config, and state only when those pieces are actually needed.

## What is in this repository?

This repository is the template source, not the generated plugin itself.

- `template/` contains the files that will become the generated plugin repository.
- `setup.ts` runs after `bun create` and applies template variables.
- `docs/` documents how the template is structured and why.
- `tests/template-smoke.test.ts` verifies that the template can scaffold a usable plugin project.

## Use it with bun create

```bash
bun create rothnic/opencode-plugin-template my-plugin
cd my-plugin
bun install
bun test
```

During setup, the template will:

- infer the plugin package name from the target directory,
- strip the common `opencode-plugin-` prefix when that prefix is present,
- ask for description, author, and license,
- rename `.opencode/plugins/{{PLUGIN_NAME}}/` to the real plugin name,
- optionally remove the agent, skill, tool, config, state, or SQLite starter files you do not want.

## What the generated plugin looks like

```text
.
├── .opencode/
│   ├── plugins/
│   │   └── <plugin-name>/
│   │       ├── index.ts
│   │       ├── hooks/
│   │       ├── utils/
│   │       ├── config/   # optional helper
│   │       ├── state/    # optional helper
│   │       └── database/ # optional helper (bun:sqlite)
│   ├── agent/            # optional template
│   ├── skill/            # optional template
│   └── tools/            # optional template
├── docs/
├── tests/
│   └── plugin.test.ts
├── index.ts
└── package.json
```

## Design goals

The generated project intentionally starts small:

- one plugin package entry point,
- one smoke test,
- one agent template,
- one skill template,
- one custom tool template,
- optional config, state, and local SQLite helpers.

It does **not** assume every plugin needs persistent state, custom tools, or multiple agents on day one.

## Validation performed in this repo

Before shipping changes to this template, the template repo validates that it can:

1. scaffold a new project,
2. replace template variables correctly,
3. expose a plugin from the generated `index.ts`, and
4. be linked into a consumer project's `.opencode/plugins/` directory.

See [docs/quickstart.md](docs/quickstart.md), [docs/reference.md](docs/reference.md), and [docs/plugin-analysis.md](docs/plugin-analysis.md) for the supporting details.
