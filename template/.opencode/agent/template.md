---
# Agent Configuration - Comprehensive Template
# This demonstrates ALL available agent configuration options and best practices

name: "{{AGENT_NAME}}"
description: "{{Brief one-line description}}"

# Mode: "primary" | "code" | "general"
mode: primary

# Model selection
model: anthropic/claude-sonnet-4-5

# Temperature (0.0 - 1.0)
temperature: 0.7

# Permissions
permission:
  view: allow
  edit: ask
  create: ask
  bash: deny

# System prompt
prompt: |
  {{Define the agent's role and behavior}}

# Optional: Tools
# tools:
#   - read_file
#   - write_file
#   - grep

# Optional: Extend existing agent
# extends: "@opencode-ai/agents/code-review"

# Optional: Reference files
# files:
#   - path: ./docs/standards.md
#     description: "Coding standards"
#   - path: ./.opencode/skill/workflow.md
#     description: "Related workflow"

---

# {{AGENT_NAME}}

## Purpose

{{What this agent does and when to use it}}

## Responsibilities

1. {{Primary responsibility}}
2. {{Secondary responsibility}}

## Examples

### Example 1: {{Scenario}}

**Input:** `{{example input}}`
**Output:** `{{example output}}`

## Related Resources

- [{{SKILL}}](./.opencode/skill/{{FILE}}.md)
- [{{DOC}}](./docs/{{FILE}}.md)

## Best Practices

1. Be specific about the agent's role
2. Use files/skills for additional context
3. Provide concrete examples
4. Test before deploying
