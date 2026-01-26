/**
 * OpenCode Plugin Template
 * 
 * This is the main entry point for your OpenCode plugin.
 * The plugin is organized into subdirectories for better maintainability:
 * 
 * - types/    - TypeScript type definitions
 * - utils/    - Shared utility functions
 * - hooks/    - Hook implementations
 * 
 * This structure allows you to:
 * - Keep code organized and maintainable
 * - Easily add new functionality
 * - Share utilities across hooks
 * - Test components in isolation
 */

import type { PluginContext, PluginHooks } from './types';
import { Logger } from './utils';
import {
  createSessionHooks,
  createToolHooks,
  createMessageHooks,
  createFileHooks,
  createPermissionHooks,
} from './hooks';

/**
 * Main plugin export
 * 
 * This async function receives the plugin context and returns an object
 * containing all the hooks your plugin implements.
 * 
 * @param context - The plugin context provided by OpenCode
 * @returns An object with hook implementations
 */
export const MyPlugin = async (context: PluginContext): Promise<PluginHooks> => {
  // Initialize logger (uses client.app.log when available)
  const logger = new Logger(context, 'opencode-plugin-template');
  
  logger.info('Plugin initialized', {
    project: context.project.name,
    directory: context.directory,
    branch: context.worktree.branch,
  });

  // Create all hook implementations
  const sessionHooks = createSessionHooks(logger);
  const toolHooks = createToolHooks(logger);
  const messageHooks = createMessageHooks(logger);
  const fileHooks = createFileHooks(logger);
  const permissionHooks = createPermissionHooks(logger);

  // Return combined hooks object
  return {
    ...sessionHooks,
    ...toolHooks,
    ...messageHooks,
    ...fileHooks,
    ...permissionHooks,
  };
};

// Export types for use in other files
export type { PluginContext, PluginHooks } from './types';
