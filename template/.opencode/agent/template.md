---
name: your-agent-name
description: Briefly describe what this agent is responsible for.
mode: code
model: anthropic/claude-sonnet-4-5
temperature: 0.2
prompt: |
  Describe the role, boundaries, and output expectations for this agent.
---

# your-agent-name

## Purpose

Explain when this agent should be used and when it should not be used.

## Inputs the agent can rely on

- `@./docs/using-the-template.md`
- `@./.opencode/skill/template.md`
- `@./docs/team-standards.md` _(add this file if you need it)_

## Checklist for filling out this template

- Define the agent's single responsibility.
- State what good output looks like.
- List the files or skills the agent should reference.
- Add any tool constraints or escalation rules in the prompt.
