# Quick Start Guide

Get started with the OpenCode Plugin Template in 5 minutes!

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0 (or Node.js >= 18.0.0)
- Git
- Basic TypeScript knowledge

## Step 1: Create Your Plugin Repository

### Option A: Use as Template (Recommended)

1. Click "Use this template" on GitHub
2. Name your repository (e.g., `my-opencode-plugin`)
3. Clone your new repository:

```bash
git clone https://github.com/your-username/my-opencode-plugin.git
cd my-opencode-plugin
```

### Option B: Fork or Clone

```bash
git clone https://github.com/rothnic/opencode-plugin-template.git my-plugin
cd my-plugin
rm -rf .git
git init
```

## Step 2: Install Dependencies

```bash
bun install

# Or with npm
npm install
```

## Step 3: Set Up Git Hooks

```bash
bun run prepare

# This installs lefthook for git hooks
```

## Step 4: Customize Your Plugin

### Update package.json

```json
{
  "name": "your-plugin-name",
  "version": "0.1.0",
  "description": "Your plugin description",
  "author": "Your Name"
}
```

### Edit the Main Plugin File

Open `.opencode/plugins/index.ts` and customize the hooks:

```typescript
export const MyPlugin = async (context: PluginContext) => {
  return {
    "tool.execute.before": async (input, output) => {
      // Your custom logic here
      console.log(`Running tool: ${input.tool}`);
    },
  };
};
```

## Step 5: Test Your Plugin Locally

### Option A: Symlink for Testing

In your OpenCode project:

```bash
mkdir -p .opencode/plugins
ln -s /path/to/your-plugin/.opencode/plugins/index.ts .opencode/plugins/my-plugin.ts
```

### Option B: Copy Files

```bash
cp -r /path/to/your-plugin/.opencode/plugins/* /your-project/.opencode/plugins/
```

### Test It

1. Open your OpenCode project
2. Start a session
3. Check the console for plugin messages

## Step 6: Add Custom Functionality

### Add a Custom Tool

Create `.opencode/tools/my-tool.ts`:

```typescript
export async function myTool(input: { query: string }) {
  // Your tool logic
  return { result: `Processed: ${input.query}` };
}

export const customTools = {
  myTool: {
    name: "my_tool",
    description: "What my tool does",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" }
      },
      required: ["query"]
    },
    handler: myTool,
  },
};
```

### Add a Custom Agent

Create `.opencode/agents/my-agent.ts`:

```typescript
export const myAgent = {
  name: "my-specialist",
  description: "Specialized agent for X",
  instructions: "You are an expert in X. Always...",
  model: "gpt-4",
  tools: ["view", "grep"],
};
```

### Add a Skill

Create `.opencode/skills/my-skill.ts`:

```typescript
export const mySkill = {
  name: "my-process",
  description: "A process for doing X",
  tags: ["process", "workflow"],
  content: `
# My Process

1. First step
2. Second step
3. Third step
  `,
};
```

## Step 7: Run Tests

```bash
bun test

# Or with npm
npm test
```

## Step 8: Publish Your Plugin

### Option A: Publish to npm

```bash
# Build
bun run build

# Publish
npm publish
```

Users install with:

```json
{
  "plugin": ["your-plugin-name"]
}
```

### Option B: Share as Git Repository

Users can:

```bash
git clone your-repo
ln -s /path/to/repo/.opencode/plugins/index.ts .opencode/plugins/your-plugin.ts
```

### Option C: Share Files Directly

Users copy your `.opencode/` directory to their project.

## Common Commands

```bash
# Development with watch mode
bun run dev

# Build the plugin
bun run build

# Run tests
bun test

# Lint (check naming conventions)
bun run lint

# Bump version
bun run version:bump patch   # 0.1.0 -> 0.1.1
bun run version:bump minor   # 0.1.1 -> 0.2.0
bun run version:bump major   # 0.2.0 -> 1.0.0
```

## Next Steps

1. Read the [README.md](README.md) for detailed documentation
2. Check [BEST_PRACTICES.md](BEST_PRACTICES.md) for guidelines
3. View [examples/README.md](examples/README.md) for code examples
4. Read [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute

## Getting Help

- Check the [OpenCode documentation](https://opencode.ai/docs/)
- Review example plugins in the `examples/` directory
- Open an issue on GitHub
- Check existing OpenCode plugins for inspiration

## Tips

1. **Start Small**: Begin with one hook and expand
2. **Test Early**: Test your plugin in a real project early
3. **Use Types**: TypeScript will help catch errors
4. **Read Logs**: Check console output for debugging
5. **Follow Conventions**: Use the naming patterns in `.lslintrc.json`

## Troubleshooting

### Plugin Not Loading

- Check file paths are correct
- Verify syntax errors with `bun run build`
- Check console for error messages

### Hooks Not Firing

- Verify hook names match OpenCode's API
- Check if hooks are exported correctly
- Add console.log statements for debugging

### TypeScript Errors

- Run `bun run build` to see errors
- Check type definitions in `types.ts`
- Ensure tsconfig.json is correct

Happy Plugin Building! 🚀
