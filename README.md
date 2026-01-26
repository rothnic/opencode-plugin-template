# OpenCode Plugin Template 🚀

A comprehensive template for creating OpenCode plugins with best practices, extensibility, and professional tooling built-in.

## Features ✨

- 🎯 **Complete Plugin Structure** - Ready-to-use plugin architecture with examples
- 🔧 **Custom Tools** - Add your own tools to extend OpenCode's capabilities
- 🤖 **Custom Agents** - Define specialized AI agents for specific tasks
- 📚 **Skills Library** - Reusable patterns and procedures for common tasks
- 🪝 **Plugin Hooks** - Intercept and modify OpenCode's behavior at key points
- 🔒 **Best Practices** - Lefthook for git hooks, lslint for naming conventions
- 📦 **Version Management** - Built-in version bumping and release management
- 🎨 **TypeScript Support** - Full type safety with Bun runtime

## Quick Start 🏃

### 1. Use This Template

Click "Use this template" on GitHub or clone the repository:

```bash
git clone https://github.com/rothnic/opencode-plugin-template.git my-plugin
cd my-plugin
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Git Hooks

```bash
bun run prepare
```

### 4. Customize Your Plugin

Edit the files in `.opencode/` to add your custom functionality:

- `.opencode/plugins/index.ts` - Main plugin entry point
- `.opencode/tools/` - Add custom tools
- `.opencode/agents/` - Define custom agents
- `.opencode/skills/` - Add reusable skills
- `.opencode/plugins/hooks.ts` - Implement plugin hooks

### 5. Test Your Plugin

For local development, create a symlink in your project:

```bash
# In your OpenCode project
mkdir -p .opencode/plugins
ln -s /path/to/my-plugin/.opencode/plugins/index.ts .opencode/plugins/my-plugin.ts
```

Or publish as an npm package and add to your `opencode.json`:

```json
{
  "plugin": ["my-plugin-name"]
}
```

## Project Structure 📁

```
.
├── .opencode/
│   ├── plugins/
│   │   ├── index.ts          # Main plugin export
│   │   ├── hooks.ts          # Example hook implementations
│   │   └── types.ts          # TypeScript types
│   ├── tools/
│   │   └── example-tool.ts   # Custom tool examples
│   ├── agents/
│   │   └── example-agents.ts # Custom agent definitions
│   └── skills/
│       └── example-skills.ts # Reusable skill patterns
├── scripts/
│   └── version-bump.ts       # Version management script
├── index.ts                  # Package entry point
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript config
├── lefthook.yml              # Git hooks configuration
├── .lslintrc.json            # Naming/structure linting
├── opencode.json             # OpenCode configuration
└── README.md                 # This file
```

## Development 🛠️

### Available Scripts

```bash
# Development with watch mode
bun run dev

# Build the plugin
bun run build

# Run tests
bun test

# Lint naming and structure
bun run lint

# Bump version (patch/minor/major)
bun run version:bump patch
bun run version:bump minor
bun run version:bump major
```

### Adding Custom Tools

1. Create a new file in `.opencode/tools/`:

```typescript
// .opencode/tools/my-tool.ts
export async function myCustomTool(input: any) {
  // Your tool logic here
  return { result: "success" };
}

export const customTools = {
  myCustomTool: {
    name: "my_custom_tool",
    description: "What my tool does",
    inputSchema: { /* JSON schema */ },
    handler: myCustomTool,
  },
};
```

2. Register it in your plugin's `index.ts`

### Adding Custom Agents

1. Create agent definitions in `.opencode/agents/`:

```typescript
// .opencode/agents/my-agents.ts
export const myAgent = {
  name: "my-agent",
  description: "What my agent does",
  instructions: "Detailed instructions for the agent...",
  model: "gpt-4",
  tools: ["grep", "view"],
};
```

2. Export and use in your OpenCode configuration

### Implementing Hooks

Hooks allow you to intercept and modify OpenCode's behavior. Edit `.opencode/plugins/hooks.ts` or `.opencode/plugins/index.ts`:

```typescript
export const MyPlugin = async (context) => {
  return {
    "tool.execute.before": async (input, output) => {
      // Run before any tool executes
      console.log(`Tool: ${input.tool}`);
    },
    
    "file.create": async (input) => {
      // Run before file creation
      console.log(`Creating: ${input.path}`);
    },
  };
};
```

**Available Hooks:**
- `session.create` / `session.complete`
- `tool.execute.before` / `tool.execute.after`
- `message.create` / `message.complete`
- `file.create` / `file.edit`
- `permission.request`
- `error`, `git.before` / `git.after`

## Best Practices 📖

### Lefthook (Git Hooks)

This template includes Lefthook configuration for:

- **Pre-commit**: Linting and formatting
- **Pre-push**: Testing and build verification
- **Commit-msg**: Conventional commit format validation

Configuration in `lefthook.yml`

### lslint (Naming & Structure)

Enforces consistent naming conventions:

- **Files**: `kebab-case` for `.ts`, `PascalCase` for `.tsx`
- **Directories**: `kebab-case`
- **Required Structure**: `.opencode/` directories

Configuration in `.lslintrc.json`

### Version Management

Easily bump versions across all files:

```bash
# Patch version (0.1.0 -> 0.1.1)
bun run version:bump patch

# Minor version (0.1.1 -> 0.2.0)
bun run version:bump minor

# Major version (0.2.0 -> 1.0.0)
bun run version:bump major
```

The script updates both `package.json` and `opencode.json`.

## Publishing 📦

### Option 1: NPM Package

1. Update `package.json` with your package details
2. Build your plugin: `bun run build`
3. Publish to npm: `npm publish`

Users can then install with:

```json
{
  "plugin": ["your-plugin-name"]
}
```

### Option 2: Local Plugin

Users can copy your `.opencode/plugins/` directory to their project's `.opencode/plugins/` folder.

### Option 3: Git Repository

Users can clone your repository and symlink the plugin:

```bash
git clone your-repo
ln -s /path/to/your-plugin/.opencode/plugins/index.ts .opencode/plugins/your-plugin.ts
```

## Examples 💡

Check the example files included in this template:

- **Custom Tool**: `.opencode/tools/example-tool.ts`
- **Custom Agents**: `.opencode/agents/example-agents.ts`
- **Skills**: `.opencode/skills/example-skills.ts`
- **Hooks**: `.opencode/plugins/hooks.ts`

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

MIT License - see [LICENSE](LICENSE) file for details.

## Resources 📚

- [OpenCode Documentation](https://opencode.ai/docs/)
- [OpenCode Plugins Guide](https://opencode.ai/docs/plugins/)
- [Lefthook Documentation](https://github.com/evilmartians/lefthook)
- [Bun Documentation](https://bun.sh/docs)

## Support 💬

For issues and questions, please open an issue on GitHub.
