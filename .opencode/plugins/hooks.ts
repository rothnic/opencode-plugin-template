/**
 * Example Plugin Hooks
 * 
 * This file demonstrates various hooks available in OpenCode plugins.
 * Uncomment and modify the hooks you want to use in your plugin.
 */

import type { PluginContext } from "./types";

export const createHooks = (context: PluginContext) => {
  const { project, client, $, directory, worktree } = context;

  return {
    /**
     * Session Lifecycle Hooks
     */
    
    // Called when a new session starts
    "session.create": async (input: any) => {
      console.log(`📝 New session started in ${project.name}`);
      // Add custom initialization logic
    },

    // Called when a session completes
    "session.complete": async (input: any) => {
      console.log(`✅ Session completed`);
      // Add custom cleanup logic
    },

    /**
     * Tool Execution Hooks
     */
    
    // Called before any tool executes
    "tool.execute.before": async (input: any, output: any) => {
      // Example: Log tool usage
      console.log(`🔧 Tool: ${input.tool}`);
      
      // Example: Block dangerous operations
      if (input.tool === "bash" && output.args?.command) {
        const cmd = output.args.command;
        
        // Block dangerous commands
        const dangerousPatterns = [
          /rm\s+-rf\s+\//,
          /mkfs/,
          /dd\s+if=/,
          /:\(\)\{.*\}:/,  // Fork bomb
        ];
        
        for (const pattern of dangerousPatterns) {
          if (pattern.test(cmd)) {
            throw new Error(`⚠️ Blocked dangerous command: ${cmd}`);
          }
        }
      }

      // Example: Rate limiting
      // Example: Logging/auditing
      // Example: Modify tool inputs
    },

    // Called after a tool executes
    "tool.execute.after": async (input: any) => {
      // Example: Log results
      // Example: Post-process outputs
      // Example: Update analytics
    },

    /**
     * Message Hooks
     */
    
    // Called when a message is created
    "message.create": async (input: any) => {
      // Example: Filter or modify messages
      // Example: Add context to messages
      // Example: Log message creation
    },

    // Called when a message is completed
    "message.complete": async (input: any) => {
      // Example: Post-process completed messages
      // Example: Trigger workflows
    },

    /**
     * File Operation Hooks
     */
    
    // Called before creating a file
    "file.create": async (input: any) => {
      const { path, content } = input;
      
      // Example: Validate file creation
      // Example: Add file templates
      // Example: Enforce naming conventions
      
      console.log(`📄 Creating file: ${path}`);
    },

    // Called before editing a file
    "file.edit": async (input: any) => {
      const { path, changes } = input;
      
      // Example: Validate edits
      // Example: Add automatic formatting
      // Example: Track file changes
      
      console.log(`✏️  Editing file: ${path}`);
    },

    /**
     * Permission Hooks
     */
    
    // Called when permission is requested
    "permission.request": async (input: any) => {
      const { type, resource } = input;
      
      // Example: Auto-approve safe operations
      // Example: Block certain permissions
      // Example: Log permission requests
      
      console.log(`🔐 Permission requested: ${type} for ${resource}`);
      
      // Return true to approve, false to deny, or undefined to ask user
      // return true;
    },

    /**
     * Error Handling Hooks
     */
    
    // Called when an error occurs
    "error": async (input: any) => {
      const { error, context } = input;
      
      // Example: Custom error handling
      // Example: Error reporting
      // Example: Recovery strategies
      
      console.error(`❌ Error:`, error);
    },

    /**
     * Git Hooks
     */
    
    // Called before git operations
    "git.before": async (input: any) => {
      const { operation, args } = input;
      
      // Example: Validate commits
      // Example: Run pre-commit checks
      // Example: Enforce git conventions
      
      console.log(`🔀 Git operation: ${operation}`);
    },

    // Called after git operations
    "git.after": async (input: any) => {
      const { operation, result } = input;
      
      // Example: Post-commit actions
      // Example: Update documentation
      // Example: Trigger CI/CD
    },
  };
};
