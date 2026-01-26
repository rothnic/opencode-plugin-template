/**
 * Plugin hooks implementation
 * 
 * Example hook implementations showing how to use config, state, and logger.
 * Customize based on your needs.
 */

import type { PluginContext, PluginHooks } from "../types";
import type { PluginConfig } from "../config";
import { Logger, isCommandAllowed, sanitizeForLog } from "../utils";

/**
 * Create and register all plugin hooks
 * 
 * @param context - Plugin context from OpenCode
 * @param logger - Logger instance for structured logging
 * @param config - Plugin configuration (optional)
 * @param state - Plugin state (optional)
 */
export function registerHooks(
  context: PluginContext,
  logger: Logger,
  config?: PluginConfig,
  state?: Record<string, unknown>
): PluginHooks {
  return {
    "session.create": async (input) => {
      logger.info("Session created");
      // Add your session initialization logic here
      // Example: Load resources, initialize connections, etc.
    },

    "session.complete": async (input) => {
      logger.info("Session completed");
      // Add your session cleanup logic here
      // Example: Save state, close connections, generate reports
    },

    "tool.execute.before": async (input, output) => {
      // Example: Validate bash commands before execution
      if (input.tool === "bash" && output.args?.command) {
        const command = output.args.command as string;

        if (!isCommandAllowed(command)) {
          logger.warn("Command blocked", { command: command.substring(0, 100) });
          throw new Error("Command not allowed by plugin");
        }
      }

      // Example: Log tool execution with sanitized args
      const sanitizedArgs = sanitizeForLog(output.args);
      logger.debug("Tool executing", { 
        tool: input.tool,
        args: sanitizedArgs 
      });
    },

    "tool.execute.after": async (input) => {
      logger.debug("Tool executed", { tool: input.tool });
      
      // Example: Track tool usage in state
      // await stateManager.update(StateLevel.PROJECT, {
      //   toolUsage: {
      //     ...state.toolUsage,
      //     [input.tool]: (state.toolUsage?.[input.tool] || 0) + 1,
      //   },
      // });
    },

    "message.create": async (input) => {
      // Add your message creation logic here
      logger.debug("Message created");
      
      // Example: Analyze message content, enforce policies, etc.
    },

    "message.complete": async (input) => {
      // Add your message completion logic here
      logger.debug("Message completed");
      
      // Example: Log completion, track metrics, etc.
    },

    "file.create": async (input) => {
      // Add your file creation logic here
      logger.debug("File created", { path: input.path });
      
      // Example: Validate file paths, enforce conventions, audit trail
    },

    "file.edit": async (input) => {
      // Add your file edit logic here
      logger.debug("File edited", { path: input.path });
      
      // Example: Track edits, validate changes, enforce policies
    },

    "permission.request": async (input) => {
      // Add your permission logic here
      logger.debug("Permission requested", { tool: input.tool });
      
      // Example: Custom permission logic based on config
      // if (config?.strictMode && input.tool === "bash") {
      //   throw new Error("Bash tool not allowed in strict mode");
      // }
    },

    // Optionally add more hooks:
    // "git.before": async (input) => { },
    // "git.after": async (input) => { },
    // "error": async (input) => { },
  };
}
