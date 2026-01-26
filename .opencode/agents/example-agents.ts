/**
 * Example custom agent definition
 * 
 * This demonstrates how to add custom agents to your OpenCode plugin.
 * Agents are specialized AI assistants with specific capabilities and instructions.
 */

export interface AgentConfig {
  name: string;
  description: string;
  instructions: string;
  model?: string;
  tools?: string[];
  temperature?: number;
}

/**
 * Example code review agent
 */
export const codeReviewAgent: AgentConfig = {
  name: "code-reviewer",
  description: "Specialized agent for code reviews with a focus on best practices and security",
  instructions: `You are an expert code reviewer. When reviewing code:
1. Look for security vulnerabilities
2. Check for best practices violations
3. Suggest performance improvements
4. Ensure code is maintainable and readable
5. Verify error handling is adequate

Focus on constructive feedback and provide specific examples.`,
  model: "gpt-4",
  tools: ["grep", "view", "web_search"],
  temperature: 0.3,
};

/**
 * Example documentation agent
 */
export const documentationAgent: AgentConfig = {
  name: "doc-writer",
  description: "Specialized agent for writing and maintaining documentation",
  instructions: `You are a technical documentation expert. When writing docs:
1. Use clear, concise language
2. Include code examples where appropriate
3. Structure content with proper headings
4. Add cross-references to related topics
5. Keep content up-to-date with code changes

Write for developers with varying experience levels.`,
  model: "gpt-4",
  tools: ["view", "edit", "create"],
  temperature: 0.5,
};

/**
 * Agent registry
 * Add your custom agents here
 */
export const customAgents = {
  codeReviewer: codeReviewAgent,
  documentationWriter: documentationAgent,
};
