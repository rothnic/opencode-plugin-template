---
# The file name becomes the agent name. Rename this file when you turn it into
# a real agent.
description: Describe what this agent is responsible for.
# Valid modes are: primary, subagent, all. Most bundled helper agents should be
# subagents so they can be invoked without replacing your main agent.
mode: subagent
# Optional valid fields you can enable later:
# model: anthropic/claude-sonnet-4-5
# temperature: 0.2
# tools:
#   write: false
#   edit: false
# permission:
#   bash:
#     "*": ask
# hidden: false
---
You are a focused specialist for this plugin.

## Purpose

Describe:

- when this agent should be used,
- what it should avoid doing,
- what a successful outcome looks like.

## Files and skills to load when needed

- `@./docs/using-the-template.md`
- `@./AGENTS.md`
- `@./.opencode/skills/template/SKILL.md`

## Constraints

- State whether the agent should stay read-only or can make edits.
- Call out any required tool restrictions or permission expectations.
- Add escalation instructions for ambiguous or risky situations.
