/**
 * OpenCode Plugin Template
 * 
 * This is the main entry point for your OpenCode plugin.
 * Customize this template based on your specific needs.
 */

import type { PluginContext, PluginHooks } from "./types";
import { registerHooks } from "./hooks";

/**
 * Main plugin export
 * 
 * OpenCode calls this function to initialize your plugin.
 * Return an object containing the hooks you want to implement.
 */
export const MyPlugin = async (context: PluginContext): Promise<PluginHooks> => {
  // Register all hooks
  return registerHooks(context);
};

// Export types for convenience
export type { PluginContext, PluginHooks } from "./types";
