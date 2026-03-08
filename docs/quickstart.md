# Quickstart

## Create a plugin from this template

```bash
bun create rothnic/opencode-plugin-template my-plugin
cd my-plugin
bun install
bun test
```

## What to edit first

1. `package.json`
2. `.opencode/plugins/<plugin-name>/index.ts`
3. `.opencode/plugins/<plugin-name>/hooks/index.ts`
4. `README.md`

## Try the generated plugin locally

From a separate consumer project:

```bash
mkdir -p /path/to/consumer/.opencode/plugins
ln -s /path/to/my-plugin/.opencode/plugins/my-plugin \
  /path/to/consumer/.opencode/plugins/my-plugin
```

OpenCode will load the plugin from the consumer project's `.opencode/plugins/` directory.

## Publish the generated plugin

The generated repository exposes `index.ts` as its package entry point, so it can also be published to npm and enabled via `opencode.json`:

```json
{
  "plugin": ["my-plugin"]
}
```
