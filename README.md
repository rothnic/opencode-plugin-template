# OpenCode Plugin Template

A `bun create` template for building an OpenCode plugin repository that is ready to:

- ship as an npm package,
- be tested locally as a project plugin under `.opencode/plugins/<plugin-name>/`, and
- grow into agents, commands, skills, custom tools, config, state, and project instructions only when those pieces are actually needed.

## What is in this repository?

This repository is the template source, not the generated plugin itself.

- `template/` contains the files that will become the generated plugin repository.
- `setup.ts` runs after `bun create` and applies template variables.
- `docs/` documents how the template is structured and why.
- `tests/template-smoke.test.ts` verifies that the template can scaffold a usable plugin project and that the starter OpenCode assets stay valid.

## Use it with bun create

```bash
bun create rothnic/opencode-plugin-template my-plugin
cd my-plugin
bun install
bun run build
bun test
```

During setup, the template will:

- infer the plugin package name from the target directory,
- strip the common `opencode-plugin-` prefix when that prefix is present,
- ask for description, author, and license,
- always include the core best-practices scaffold,
- let you explicitly choose which add-ons to include,
- rename `.opencode/plugins/{{PLUGIN_NAME}}/` to the real plugin name,
- only keep the add-on directories you selected.

You can also drive setup non-interactively:

```bash
bun run setup.ts \
  --non-interactive \
  --plugin-name my-plugin \
  --description "My OpenCode plugin" \
  --author "Your Name" \
  --license MIT \
  --addon tool \
  --addon database
```

## Core best practices included by default

Every generated plugin starts with:

- a local plugin package under `.opencode/plugins/<plugin-name>/`,
- a root `index.ts` package entry,
- Bun `build`, `lint`, `test`, and `version:bump` scripts,
- the shared `Logger` wrapper around `client.app.log()`,
- logging guardrails in `lefthook`,
- a small starter hook surface (`event`, `tool.execute.before`, `tool.execute.after`),
- one smoke test under `tests/plugin.test.ts`.

These are the pieces this template treats as the **core scaffold** rather than optional extras.

## Optional add-ons

The setup CLI now treats optional scaffolding as add-ons:

| Add-on | What it adds |
| --- | --- |
| `agent` | `.opencode/agents/` starter |
| `command` | `.opencode/commands/` starter |
| `skill` | `.opencode/skills/<name>/SKILL.md` starter |
| `tool` | `.opencode/tools/` starter and tool registration example |
| `config` | plugin config helper under `.opencode/plugins/<plugin-name>/config/` |
| `state` | JSON state helper under `.opencode/plugins/<plugin-name>/state/` |
| `database` | Bun SQLite helper under `.opencode/plugins/<plugin-name>/database/` |

By default, the generated project keeps the **core scaffold only**. Add-ons are chosen explicitly during setup or via repeated `--addon` flags.

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
│   ├── agents/           # optional bundled agent starter
│   ├── commands/         # optional bundled command starter
│   ├── skills/           # optional bundled skill starter
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
- no add-ons unless you ask for them during setup,
- a generated Logger helper that wraps `client.app.log()` and acts as the single extension point for future log destinations.

It does **not** assume every plugin needs persistent state, custom tools, or multiple agents on day one.

## Validation performed in this repo

Before shipping changes to this template, the template repo validates that it can:

1. scaffold a new project,
2. replace template variables correctly,
3. install generated-project dependencies with Bun,
4. type-check the template repo and generated project with `bun run build`,
5. lint the template repo and generated project with `bun run lint`,
6. expose a plugin from the generated `index.ts`, and
7. be linked into a consumer project's `.opencode/plugins/` directory.

The generated project intentionally lets `bun install` succeed before `git init`; the
`prepare` hook only installs `lefthook` when the project is already inside a Git repo.

## What is actually tested today

The current smoke coverage is intentionally explicit:

| Scenario | Validated |
| --- | --- |
| Template repository | `bun install`, `bun run build`, `bun run lint`, `bun test` |
| Generated project (core only) | `bun install`, `bun run build`, `bun run lint`, `bun test`, local plugin linking/import |
| Generated project with selected add-ons | `bun install`, `bun run build`, `bun run lint`, starter asset shape checks |
| Generated project with persistence add-ons | `bun install`, `bun run build`, `bun run lint`, `bun test`, SQLite read/write |
| Generated project logging guardrails | warning in `warn` mode, blocking in `block` mode |

If you add a new starter capability, extend the smoke test before documenting it as a validated path.

## Logging policy in the generated plugin

The generated plugin is set up to follow the OpenCode logging guidance:

- plugin code should log through the generated `Logger`,
- the `Logger` writes to `client.app.log()` using the documented structured payload,
- if you need extra destinations later, add them in the `Logger` configuration instead of introducing direct `console` logging.

Generated `lefthook.yml` enforces this in two stages:

- `pre-commit`: warns when direct `console.*` logging appears in plugin code,
- `pre-push`: blocks the push until those calls are removed.

## Bundled OpenCode assets in the generated project

The generated project shows the documented auto-discovery paths for OpenCode components:

- agents live in `.opencode/agents/*.md`,
- commands live in `.opencode/commands/*.md`,
- skills live in `.opencode/skills/<name>/SKILL.md`,
- instructions live in `AGENTS.md` and can be split into additional files through `opencode.json`'s `instructions` field if you add one later.

These bundled assets auto-load when you work inside the generated plugin repository itself. If you want them available from a different consumer repository, you still need to symlink or copy those `.opencode` directories into that consumer project because npm package installation does not inject repo-scoped OpenCode assets automatically.

The smoke test validates the starter agent, command, and skill shapes so invalid examples do not slip into the generated project.

See [docs/quickstart.md](docs/quickstart.md), [docs/reference.md](docs/reference.md), and [docs/plugin-analysis.md](docs/plugin-analysis.md) for the supporting details.
