import type { PluginContext } from "../types";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  service: string;
  level: LogLevel;
  message: string;
  extra?: Record<string, unknown>;
}

export type LoggerDestination = (entry: LogEntry) => Promise<void> | void;

export interface LoggerOptions {
  service?: string;
  defaultExtra?: Record<string, unknown>;
  destinations?: LoggerDestination[];
}

function safeSerialize(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable metadata]";
  }
}

function formatExtraForStderr(extra: Record<string, unknown> | undefined) {
  if (!extra || Object.keys(extra).length === 0) {
    return "";
  }

  return ` ${safeSerialize(extra)}`;
}

export class Logger {
  private readonly service: string;
  private readonly defaultExtra: Record<string, unknown>;
  private readonly destinations: LoggerDestination[];

  constructor(
    private readonly context: PluginContext,
    options: LoggerOptions = {},
  ) {
    this.service = options.service ?? "{{PLUGIN_NAME}}";
    this.defaultExtra = options.defaultExtra ?? {};
    this.destinations = options.destinations ?? [];
  }

  /**
   * Create a child logger that reuses the same destinations and service name
   * while attaching extra default metadata for a narrower context.
   *
   * Use this when a specific hook, tool, or subsystem should automatically
   * include identifying metadata on every message without repeating it.
   */
  child(defaultExtra: Record<string, unknown>) {
    return new Logger(this.context, {
      service: this.service,
      destinations: this.destinations,
      defaultExtra: {
        ...this.defaultExtra,
        ...defaultExtra,
      },
    });
  }

  private async write(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
    const entry: LogEntry = {
      service: this.service,
      level,
      message,
      extra: {
        ...this.defaultExtra,
        ...(metadata ?? {}),
      },
    };

    const appDestination = this.context.client.app?.log
      ? async (payload: LogEntry) => {
          await this.context.client.app.log({
            body: {
              service: payload.service,
              level: payload.level,
              message: payload.message,
              extra: payload.extra,
            },
          });
        }
      : async (payload: LogEntry) => {
          const extra = formatExtraForStderr(payload.extra);
          await Bun.write(Bun.stderr, `[${payload.service}] ${payload.level}: ${payload.message}${extra}\n`);
        };

    const destinationResults = await Promise.all(
      [appDestination, ...this.destinations].map(async (destination) => {
        try {
          await destination(entry);
          return null;
        } catch (error) {
          return error instanceof Error ? error.stack ?? error.message : String(error);
        }
      }),
    );

    const failures = destinationResults.filter((result): result is string => result !== null);
    if (failures.length > 0) {
      await Bun.write(
        Bun.stderr,
        `[${this.service}] warn: ${failures.length} logging destination(s) failed: ${failures.join("; ")}\n`,
      );
    }
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
