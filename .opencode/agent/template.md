---
name: my-custom-agent
description: 'Brief description of what this agent does (use quotes if contains special characters)'
mode: primary
model: anthropic/claude-sonnet-4-5
temperature: 0.7
steps: 10
color: '#6c5ce7'
permission:
  view: allow
  edit: ask
  create: ask
  bash: ask
  web_search: allow
  task:
    '*': ask
disable: true
---

# Agent Name

Brief introduction to what this agent does and when to use it.

## Core Capabilities

List the main things this agent can do:

1. **Capability One**
   - Detail about this capability
   - When to use it
   - Example use cases

2. **Capability Two**
   - Another important capability
   - Best practices for using it

3. **Capability Three**
   - Third major capability
   - Tips and tricks

## Instructions

Provide detailed instructions for how this agent should behave:

- How it should approach tasks
- What it should prioritize
- What it should avoid
- How it should communicate results

## Process/Workflow

If the agent follows a specific process:

1. First step in the process
2. Second step
3. Final step

## Output Format

Specify how the agent should structure its responses:

- What format to use
- What information to include
- How to organize results

## Examples

Provide examples of typical interactions:

**Example 1: Task Name**
- Input: What the user asks
- Expected Output: What the agent produces

**Example 2: Another Task**
- Input: Different type of request
- Expected Output: Corresponding response

## Related Skills

Reference any skills that work well with this agent:
- `@.opencode/skill/related-skill-1.md`
- `@.opencode/skill/related-skill-2.md`

## Tips

- Helpful tip #1
- Helpful tip #2
- Best practice #3
