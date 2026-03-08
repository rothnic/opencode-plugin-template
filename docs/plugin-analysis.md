# Plugin analysis

This template was reviewed against working OpenCode plugins and the official plugin docs to keep the generated project grounded in patterns that are actually useful.

## Main takeaways

1. **Local plugin discovery uses `.opencode/plugins/`**.
2. **Published npm plugins expose a normal package entry point**.
3. **Not every plugin needs state, config loaders, agents, skills, or custom tools**.
4. **The safest starter template is one documented hook flow plus optional expansion points**.

## Example repos reviewed

- `nick-vi/type-inject`
- `opencode-helicone-session`
- `opencode-devcontainers`

## What this template keeps from that review

- a package-root `index.ts` for npm loading,
- a local plugin directory under `.opencode/plugins/<plugin-name>/`,
- optional helpers instead of mandatory abstractions,
- a minimal smoke test instead of a large speculative test suite.
