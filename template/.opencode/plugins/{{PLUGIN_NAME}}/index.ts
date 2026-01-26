/**
 * OpenCode Plugin Template
 * 
 * This is the main entry point for your OpenCode plugin.
 * This template provides batteries-included patterns for:
 * - Configuration management (global/project levels)
 * - State persistence
 * - Security utilities
 * - Structured logging
 * 
 * Customize based on your specific needs.
 */

import type { PluginContext, PluginHooks } from "./types";
import { registerHooks } from "./hooks";
import { createConfigManager, type PluginConfig } from "./config";
import { createStateManager, StateLevel } from "./state";
import { Logger } from "./utils";

/**
 * Define your plugin's configuration interface
 * This extends the base PluginConfig with your custom options
 */
interface MyPluginConfig extends PluginConfig {
  // Add your custom config options here
  // Example:
  // customOption?: string;
  // features?: {
  //   enableX?: boolean;
  //   enableY?: boolean;
  // };
}

/**
 * Define your plugin's state interface
 * This is what gets persisted between sessions
 */
interface MyPluginState {
  // Add your state properties here
  // Example:
  // sessionCount?: number;
  // lastRun?: string;
  // cache?: Record<string, unknown>;
}

/**
 * Main plugin export
 * 
 * OpenCode calls this function to initialize your plugin.
 * Return an object containing the hooks you want to implement.
 * 
 * This example shows how to use:
 * - ConfigManager for loading configuration
 * - StateManager for persisting data
 * - Logger for structured logging
 */
export const MyPlugin = async (context: PluginContext): Promise<PluginHooks> => {
  // Initialize logger
  const logger = new Logger(context);
  logger.info("Plugin initializing");

  // Load configuration with defaults
  // Config is loaded from (in order of precedence):
  // 1. Runtime (env vars)
  // 2. Project (./opencode.json or ./.opencode/opencode.json)
  // 3. Global (~/.config/opencode/opencode.json)
  // 4. Defaults (below)
  const configManager = createConfigManager<MyPluginConfig>(context, "my-plugin");
  const { config, source } = await configManager.load({
    enabled: true,
    logLevel: "info",
    // Add your defaults here
  });

  logger.info(`Configuration loaded from: ${source}`, { config });

  // Check if plugin is enabled
  if (!config.enabled) {
    logger.info("Plugin is disabled in configuration");
    return {}; // Return empty hooks
  }

  // Initialize state manager
  // State can be stored at:
  // - StateLevel.PROJECT: ./.opencode/plugins/{{PLUGIN_NAME}}/my-plugin/state.json
  // - StateLevel.GLOBAL: ~/.config/opencode/plugins/my-plugin/state.json
  const stateManager = createStateManager<MyPluginState>(context, "my-plugin");
  
  // Load state with defaults
  const state = await stateManager.load(StateLevel.PROJECT, {
    // Add your default state here
    // Example:
    // sessionCount: 0,
  });

  // Update state (example: increment session counter)
  // await stateManager.update(StateLevel.PROJECT, {
  //   sessionCount: (state.sessionCount || 0) + 1,
  //   lastRun: new Date().toISOString(),
  // });

  logger.info("Plugin initialized successfully");

  // Register and return hooks
  // You can pass config, state, logger to hooks for use in hook handlers
  return registerHooks(context, logger, config, state);
};

// Export types for convenience
export type { PluginContext, PluginHooks } from "./types";
export type { MyPluginConfig, MyPluginState };

