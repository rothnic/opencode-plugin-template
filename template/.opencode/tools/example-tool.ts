import { tool } from "@opencode-ai/plugin";

// Register this from `.opencode/plugins/{{PLUGIN_NAME}}/index.ts` by returning:
//
// tool: {
//   "example-custom-tool": exampleTool,
// }
//
// OpenCode will then expose it alongside the built-in tools.
export const exampleTool = tool({
  description: "Example custom tool template",
  args: {
    query: tool.schema.string(),
  },
  async execute(args) {
    return {
      result: `Processed: ${args.query}`,
    };
  },
});
