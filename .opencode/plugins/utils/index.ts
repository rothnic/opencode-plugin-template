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
 * Security: Check if a bash command contains dangerous patterns
 * 
 * This is a basic example - extend based on your security requirements.
 * Common patterns to watch for:
 * - Recursive deletions (rm -rf)
 * - Fork bombs (:(){ :|:& };:)
 * - Piped shell execution
 * - System-critical path modifications
 */
export function isDangerousCommand(command: string): boolean {
  const dangerousPatterns = [
    /rm\s+-rf\s+\//,  // Recursive delete from root
    /:\(\)\{/,         // Fork bomb pattern
    /\|\s*sh/,         // Piped to shell
    /\|\s*bash/,       // Piped to bash
    />\s*\/dev\/sda/,  // Writing to disk devices
    /mkfs\./,          // Filesystem formatting
  ];

  return dangerousPatterns.some(pattern => pattern.test(command));
}

/**
 * Security: Sanitize sensitive data from logs
 * 
 * Redacts sensitive keys to prevent credential leakage in logs.
 * Handles nested objects recursively.
 */
export function sanitizeForLog(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeForLog);
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = [
      "password",
      "token",
      "apiKey",
      "api_key",
      "secret",
      "authorization",
      "auth",
      "credentials",
      "private_key",
      "privateKey",
    ];

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk.toLowerCase()))) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeForLog(value);
      }
    }

    return sanitized;
  }

  return data;
}

/**
 * Example: Basic command validation pattern
 * Customize this based on your specific security requirements
 */
export function isCommandAllowed(command: string): boolean {
  return !isDangerousCommand(command);
}
