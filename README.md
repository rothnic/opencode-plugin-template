# OpenCode Plugin Template 🚀

A **batteries-included** template for creating professional OpenCode plugins. Goes beyond basics to provide production-ready patterns for configuration management, state persistence, security, and scalability.

## Features ✨

### Core Infrastructure
- 🎯 **Complete Plugin Structure** - Organized subdirectories for types, utils, hooks, config, and state
- 🔧 **Configuration Management** - Load config from global/project levels with proper precedence
- 💾 **State Persistence** - Save plugin state at global or project level with automatic cleanup
- 🔒 **Security Utilities** - Command validation, sensitive data sanitization, input validation
- 📝 **Structured Logging** - Logger utility using `client.app.log()` (no console.log)
- 🎨 **TypeScript Support** - Full type safety with official `@opencode-ai/plugin` types

### Extensions & Customization
- 🔧 **Custom Tools** - JSON schema validation with Zod, type-safe interfaces
- 🤖 **Custom Agents** - Markdown-based agents with YAML frontmatter configuration
- 📚 **Skills Library** - Markdown skills for reusable workflows
- 🪝 **Plugin Hooks** - Intercept and modify OpenCode behavior at 12+ hook points

### Development Experience
- 🚀 **Bun Create Support** - One command to scaffold new projects with interactive setup
- ✅ **Comprehensive Test Suite** - 100+ tests covering all patterns and utilities
- 📦 **Version Management** - Automated version bumping across all config files
- 🔗 **Git Hooks** - Lefthook with pre-commit linting, console.log detection, commit validation
- 🏗️ **Scalable Patterns** - Feature flags, caching, plugin-to-plugin communication examples

## Documentation 📚

**Getting Started:**
- [QUICKSTART.md](QUICKSTART.md) - 5-minute getting started guide
- **[HOW_TO.md](HOW_TO.md)** - **Complete how-to guide answering "How do I...?" questions**

**Deep Dives:**
- [PLUGIN_BEST_PRACTICES.md](PLUGIN_BEST_PRACTICES.md) - Best practices and patterns
- [REFERENCE.md](REFERENCE.md) - Complete API reference with all OpenCode resources

**Examples:**
- [examples/](examples/) - Real-world plugin examples
- [tests/](tests/) - Test examples showing all patterns in action

### What Can I Do With This Template?

The **[HOW_TO.md](HOW_TO.md)** guide shows you how to:

**Configuration & Setup:**
- ✅ Load plugin configuration from global/project levels
- ✅ Define plugin config in opencode.json (with precedence rules)
- ✅ Provide runtime configuration overrides
- ✅ Implement feature flags

**State Management:**
- ✅ Persist plugin state across sessions
- ✅ Choose between project-level vs global-level state
- ✅ Implement caching with TTL
- ✅ Clean up state on plugin uninstall

**Security & Validation:**
- ✅ Validate bash commands before execution
- ✅ Sanitize sensitive data from logs
- ✅ Validate user input with Zod schemas
- ✅ Block dangerous operations

**Hooks & Interception:**
- ✅ Intercept tool execution (before/after)
- ✅ Monitor file operations (create/edit)
- ✅ Add behavior on session start/end
- ✅ Implement custom permission logic

**Custom Extensions:**
- ✅ Create custom tools with type-safe handlers
- ✅ Build custom agents with markdown + frontmatter
- ✅ Define reusable skills
- ✅ Make tools available to agents

**Advanced Patterns:**
- ✅ Implement plugin-to-plugin communication
- ✅ Build caching layers
- ✅ Handle async operations safely
- ✅ Scale plugin structure without major refactoring

**Testing & Distribution:**
- ✅ Write unit and integration tests
- ✅ Test hook implementations
- ✅ Publish to npm
- ✅ Distribute without npm (symlinks, submodules)

See **[HOW_TO.md](HOW_TO.md)** for complete code examples of each scenario.

## Quick Start 🏃

### Method 1: Using Bun Create (Recommended)

Create a new plugin project with one command:

```bash
bun create rothnic/opencode-plugin-template my-opencode-plugin
cd my-opencode-plugin
```

The setup wizard will guide you through:
1. Plugin name configuration
2. Description and metadata
3. Dependency installation
4. Git hooks setup

### Method 2: Use GitHub Template

Click "Use this template" on GitHub or clone the repository:

```bash
git clone https://github.com/rothnic/opencode-plugin-template.git my-plugin
cd my-plugin
bun install
bun run setup.ts  # Run setup wizard
```

### Method 3: Manual Setup

```bash
git clone https://github.com/rothnic/opencode-plugin-template.git my-plugin
cd my-plugin
bun install
bun run prepare  # Set up git hooks
```

Then manually update:
- `package.json` - name, description, author
- `opencode.json` - plugin array
- `README.md` - project details

## What's Included

### Plugin Structure (Organized & Scalable)

```
.opencode/
├── agent/                    # Markdown-based agents
│   ├── code-reviewer.md     # Example code review agent
│   ├── doc-writer.md        # Documentation specialist
│   └── template.md          # Template for new agents
├── skill/                    # Markdown-based skills
│   ├── systematic-debugging.md
│   ├── safe-refactoring.md
│   └── template.md
├── plugins/                  # Main plugin code
│   ├── index.ts             # Plugin entry point
│   ├── types/
│   │   └── index.ts         # Type definitions
│   ├── utils/
│   │   └── index.ts         # Logger, utilities
│   ├── hooks/
│   │   └── index.ts         # Hook implementations
│   └── __tests__/           # Plugin tests
│       ├── utils.test.ts
│       ├── integration.test.ts
│       └── README.md
├── tools/                    # Custom tools
│   └── example-tool.ts
└── scripts/                  # Discoverable scripts
    ├── debug-helper.ts
    └── refactor-helper.ts
```

### Best Practices Built-In

**✅ Structured Logging** - No console.log allowed
```typescript
const logger = new Logger(context, 'my-plugin');
logger.info('Plugin started', { project: context.project.name });
```

**✅ Pre-commit Hooks** - Automatic checks
- Detects console.log statements
- Runs linting
- Validates commit messages
- Runs tests before push

**✅ Security** - Built-in validation
- Dangerous command detection
- Sensitive data sanitization
- Permission validation

**✅ Testing** - Full test coverage
- Plugin unit tests
- Integration tests
- Utility tests
- Test documentation

## Development Workflow

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

# Run specific test file
bun test tests/plugin.test.ts

# Run tests in watch mode
bun test --watch

# Lint naming and structure
bun run lint

# Bump version (patch/minor/major)
bun run version:bump patch
bun run version:bump minor
bun run version:bump major
```

### Testing Your Plugin

The template includes a comprehensive test suite in the `tests/` directory that verifies:

- **Plugin Structure**: Ensures hooks are properly exported and typed
- **Custom Tools**: Validates tool registration, schemas, and handlers
- **Custom Agents**: Checks agent configurations and tool references
- **Skills**: Verifies skill content and searchability
- **Integration**: Tests component compatibility and registration

See [tests/README.md](tests/README.md) for detailed testing documentation.

**Key Tests:**
- `tests/plugin.test.ts` - Plugin structure and hooks (20+ tests)
- `tests/tools.test.ts` - Tool registration verification (25+ tests)
- `tests/agents.test.ts` - Agent configuration validation (20+ tests)
- `tests/skills.test.ts` - Skill structure and content (20+ tests)
- `tests/integration.test.ts` - End-to-end integration (20+ tests)

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

### Documentation

- **[📖 REFERENCE.md](REFERENCE.md)** - Comprehensive reference guide with all OpenCode resources
- [OpenCode Documentation](https://opencode.ai/docs/)
- [OpenCode Plugins Guide](https://opencode.ai/docs/plugins/)
- [OpenCode Custom Tools](https://opencode.ai/docs/custom-tools/)
- [OpenCode SDK](https://opencode.ai/docs/sdk/)
- [OpenCode Configuration](https://opencode.ai/docs/config/)

### Community Resources

- [Awesome OpenCode](https://github.com/awesome-opencode/awesome-opencode) - Curated list of plugins
- [OpenCode Workflows](https://github.com/IgorWarzocha/Opencode-Workflows) - Example workflows
- [OpenCode Plugin Manual](https://github.com/Laelia-Succubus/Opencode-Plugin-Manual) - Community guide

### Development Tools

- [Lefthook Documentation](https://github.com/evilmartians/lefthook)
- [Bun Documentation](https://bun.sh/docs)
- [Zod Schema Validation](https://zod.dev/)

## Support 💬

For issues and questions, please open an issue on GitHub.
