/**
 * Plugin utilities
 * 
 * Shared utility functions used throughout the plugin.
 */

import type { PluginContext } from '../types';

/**
 * Logger utility that uses client.app.log when available,
 * falls back to process.stderr for development
 */
export class Logger {
  constructor(private context: PluginContext, private pluginName: string) {}

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>) {
    if (this.context.client.app?.log) {
      // Use OpenCode's structured logging
      this.context.client.app.log({
        level,
        message: `[${this.pluginName}] ${message}`,
        data,
      });
    } else {
      // Fallback for development - write to stderr to avoid polluting stdout
      const timestamp = new Date().toISOString();
      const logMessage = `${timestamp} [${level.toUpperCase()}] [${this.pluginName}] ${message}`;
      process.stderr.write(logMessage + '\n');
      if (data) {
        process.stderr.write(JSON.stringify(data, null, 2) + '\n');
      }
    }
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>) {
    this.log('error', message, data);
  }
}

/**
 * Check if a command contains dangerous patterns
 */
export function isDangerousCommand(command: string): boolean {
  const DANGEROUS_PATTERNS = [
    /rm\s+-rf\s+\//,       // rm -rf /
    /rm\s+-rf\s+~\//,      // rm -rf ~/
    /:\(\)\{.*\}/,         // Fork bomb
    /mkfs/,                // Format filesystem
    /dd\s+if=/,            // Disk operations
    />\/dev\/sd[a-z]/,     // Write to disk
    /chmod\s+-R\s+777/,    // Recursive 777
    /curl.*\|\s*bash/,     // Pipe to bash
    /wget.*\|\s*sh/,       // Pipe to shell
  ];

  return DANGEROUS_PATTERNS.some(pattern => pattern.test(command));
}

/**
 * Sanitize data before logging to remove sensitive information
 */
export function sanitizeForLog(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'api_key', 'accessToken', 'privateKey'];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLog(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Parse a file path to extract useful information
 */
export function parseFilePath(path: string): { dir: string; name: string; ext: string } {
  const lastSlash = path.lastIndexOf('/');
  const lastDot = path.lastIndexOf('.');
  
  return {
    dir: lastSlash >= 0 ? path.substring(0, lastSlash) : '',
    name: lastSlash >= 0 ? path.substring(lastSlash + 1, lastDot >= 0 ? lastDot : undefined) : path,
    ext: lastDot >= 0 ? path.substring(lastDot + 1) : '',
  };
}
