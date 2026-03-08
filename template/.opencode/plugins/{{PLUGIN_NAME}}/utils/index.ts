import type { PluginContext } from "../types";

export class Logger {
  constructor(
    private readonly context: PluginContext,
    private readonly service = "{{PLUGIN_NAME}}",
  ) {}

  private async write(level: "debug" | "info" | "warn" | "error", message: string, metadata?: Record<string, unknown>) {
    if (!this.context.client.app?.log) return;

    await this.context.client.app.log({
      body: {
        service: this.service,
        level,
        message,
        extra: metadata,
      },
    });
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    return this.write("debug", message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    return this.write("info", message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    return this.write("warn", message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>) {
    return this.write("error", message, metadata);
  }
}

export function isDangerousCommand(command: string): boolean {
  const patterns = [
    /rm\s+-rf\s+\//,
    /:\(\)\s*\{/,
    /\|\s*(?:sh|bash)\b/,
    /\bmkfs\./,
  ];

  return patterns.some((pattern) => pattern.test(command));
}
