/**
 * Main plugin export
 * This is the entry point for the OpenCode plugin
 */

import type { PluginContext } from "./types";

export const MyPlugin = async (context: PluginContext) => {
  const { project, client, $, directory, worktree } = context;

  console.log("🚀 OpenCode Plugin Template loaded!");

  return {
    // Session lifecycle hooks
    "session.create": async (input: any) => {
      console.log("📝 Session created");
    },

    "session.complete": async (input: any) => {
      console.log("✅ Session completed");
    },

    // Tool execution hooks
    "tool.execute.before": async (input: any, output: any) => {
      // Add custom logic before tool execution
      // Example: Block dangerous commands
      if (input.tool === "bash" && output.args?.command?.includes("rm -rf /")) {
        throw new Error("⚠️ Dangerous command blocked by plugin");
      }
    },

    "tool.execute.after": async (input: any) => {
      // Add custom logic after tool execution
    },

    // Message hooks
    "message.create": async (input: any) => {
      // Custom logic when messages are created
    },

    "message.complete": async (input: any) => {
      // Custom logic when messages are completed
    },

    // File operation hooks
    "file.create": async (input: any) => {
      // Custom logic for file creation
    },

    "file.edit": async (input: any) => {
      // Custom logic for file edits
    },

    // Permission hooks
    "permission.request": async (input: any) => {
      // Custom permission logic
    },
  };
};
