export interface ExampleToolInput {
  query: string;
}

export interface ExampleToolResult {
  result: string;
}

export async function exampleCustomTool(input: ExampleToolInput): Promise<ExampleToolResult> {
  return {
    result: `Processed: ${input.query}`,
  };
}

export const customTools = {
  exampleCustomTool: {
    name: "example_custom_tool",
    description: "Example custom tool template",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The query to process",
        },
      },
      required: ["query"],
    },
    handler: exampleCustomTool,
  },
};
