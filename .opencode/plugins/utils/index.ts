/**
 * Plugin utilities
 * 
 * Example utility patterns for your plugin.
 * Customize these based on your specific needs.
 */

import type { PluginContext } from "../types";

/**
 * Logger utility for the plugin
 * Uses OpenCode's client.app.log() instead of console.log
 */
export class Logger {
  constructor(private context: PluginContext) {}

  private log(level: "debug" | "info" | "warn" | "error", message: string, metadata?: Record<string, unknown>) {
    if (this.context.client.app?.log) {
      this.context.client.app.log({ level, message, ...metadata });
    }
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    this.log("debug", message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log("warn", message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>) {
    this.log("error", message, metadata);
  }
}

/**
 * Example: Basic command validation pattern
 * Customize this based on your specific security requirements
 */
export function isCommandAllowed(command: string): boolean {
  // Example pattern: check for specific blocked commands
  const blockedCommands = ["rm -rf /"];
  
  return !blockedCommands.some(blocked => command.includes(blocked));
}
