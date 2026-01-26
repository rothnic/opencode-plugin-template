/**
 * Plugin hooks implementation
 * 
 * Example hook implementations. Customize based on your needs.
 */

import type { PluginContext, PluginHooks } from "../types";
import { Logger, isCommandAllowed } from "../utils";

/**
 * Create and register all plugin hooks
 */
export function registerHooks(context: PluginContext): PluginHooks {
  const logger = new Logger(context);

  return {
    "session.create": async (input) => {
      logger.info("Session created");
      // Add your session initialization logic here
    },

    "session.complete": async (input) => {
      logger.info("Session completed");
      // Add your session cleanup logic here
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

      logger.debug("Tool executing", { tool: input.tool });
    },

    "tool.execute.after": async (input) => {
      logger.debug("Tool executed", { tool: input.tool });
    },

    "message.create": async (input) => {
      // Add your message creation logic here
      logger.debug("Message created");
    },

    "message.complete": async (input) => {
      // Add your message completion logic here
      logger.debug("Message completed");
    },

    "file.create": async (input) => {
      // Add your file creation logic here
      logger.debug("File created", { path: input.path });
    },

    "file.edit": async (input) => {
      // Add your file edit logic here
      logger.debug("File edited", { path: input.path });
    },

    "permission.request": async (input) => {
      // Add your permission logic here
      logger.debug("Permission requested", { tool: input.tool });
    },
  };
}
