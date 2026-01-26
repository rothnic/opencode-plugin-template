/**
 * Plugin type definitions
 * 
 * Re-export types from @opencode-ai/plugin and define custom types specific to this plugin.
 */

// Import official OpenCode types
export type {
  PluginContext,
  PluginHooks,
} from "@opencode-ai/plugin";

/**
 * Custom configuration for this plugin
 * Add your plugin-specific configuration types here
 */
export interface PluginConfig {
  // Example: enable/disable features
  enabled?: boolean;
  // Add your configuration options here
}
