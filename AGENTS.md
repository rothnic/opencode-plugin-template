# OpenCode Agents

This file documents the custom agents available in this plugin.

## Available Agents

### {{AGENT_NAME}}

**Location:** `.opencode/agent/{{agent-file}}.md`

**Purpose:** {{Brief description of what this agent does}}

**When to Use:**
- {{Use case 1}}
- {{Use case 2}}

**Configuration:**
- Mode: `{{mode}}`
- Model: `{{model}}`
- Temperature: `{{temperature}}`

**Example Usage:**
```bash
# The agent is automatically available when the plugin is installed
# OpenCode will discover it in the .opencode/agent/ directory
```

## Creating Custom Agents

See the [Agent Template](./.opencode/agent/template.md) for a comprehensive guide on creating new agents.

### Quick Start

1. Copy the agent template:
   ```bash
   cp .opencode/agent/template.md .opencode/agent/my-agent.md
   ```

2. Fill in the configuration and documentation

3. Test the agent with various inputs

4. Reference from skills or other agents as needed

## Best Practices

- Keep agents focused on a single responsibility
- Provide clear examples of expected behavior
- Use external files for context (docs, standards)
- Reference related skills and other agents
- Test thoroughly before deploying
- Document version changes

## Related Documentation

- [How-To Guide](./docs/how-to.md) - Detailed guide on working with agents
- [Plugin Best Practices](./docs/plugin-best-practices.md) - General plugin development guidelines
- [Reference](./docs/reference.md) - Complete OpenCode reference

## Support

For questions or issues with agents, please refer to:
- [OpenCode Documentation](https://opencode.ai/docs)
- [Plugin Development Guide](./docs/plugin-best-practices.md)
- [GitHub Issues]({{YOUR_REPO_URL}}/issues)
