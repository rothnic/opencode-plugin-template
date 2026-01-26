/**
 * Example custom tool
 * 
 * This demonstrates how to add custom tools to your OpenCode plugin.
 * Tools can be registered to extend OpenCode's capabilities.
 */

export interface CustomToolInput {
  query: string;
  options?: {
    verbose?: boolean;
  };
}

export interface CustomToolOutput {
  result: string;
  metadata?: any;
}

/**
 * Example custom tool implementation
 */
export async function exampleCustomTool(
  input: CustomToolInput
): Promise<CustomToolOutput> {
  const { query, options } = input;

  // Add your custom tool logic here
  console.log(`🔧 Executing custom tool with query: ${query}`);

  return {
    result: `Processed: ${query}`,
    metadata: {
      timestamp: new Date().toISOString(),
      verbose: options?.verbose || false,
    },
  };
}

/**
 * Tool registration helper
 * Use this to register your custom tools with OpenCode
 */
export const customTools = {
  exampleCustomTool: {
    name: "example_custom_tool",
    description: "An example custom tool for demonstration",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The query to process",
        },
        options: {
          type: "object",
          properties: {
            verbose: {
              type: "boolean",
              description: "Enable verbose output",
            },
          },
        },
      },
      required: ["query"],
    },
    handler: exampleCustomTool,
  },
};
