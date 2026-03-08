import type { PluginHooks } from "../types";
import { isDangerousCommand, Logger } from "../utils";

export function registerHooks(logger: Logger): PluginHooks {
  const eventHook: NonNullable<PluginHooks["event"]> = async ({ event }) => {
    if (event.type === "session.created") {
      await logger.info("Session created", { eventType: event.type });
    }

    if (event.type === "session.idle") {
      await logger.debug("Session became idle", { eventType: event.type });
    }
  };

  const beforeToolExecute: NonNullable<PluginHooks["tool.execute.before"]> = async (input, output) => {
    if (input.tool !== "bash") return;

    const command = output.args?.command;
    if (typeof command !== "string") {
      await logger.debug("Skipped bash validation because no command string was provided", {
        tool: input.tool,
      });
      return;
    }

    if (isDangerousCommand(command)) {
      await logger.warn("Blocked potentially dangerous bash command", {
        tool: input.tool,
      });
      throw new Error("Blocked potentially dangerous bash command");
    }
  };

  const afterToolExecute: NonNullable<PluginHooks["tool.execute.after"]> = async (input) => {
    await logger.debug("Tool finished", { tool: input.tool });
  };

  return {
    event: eventHook,
    "tool.execute.before": beforeToolExecute,
    "tool.execute.after": afterToolExecute,

    // Optional patterns you can enable later:
    // "shell.env": async (input, output) => {
    //   output.env.MY_PLUGIN_ENABLED = "true";
    // },
    // "experimental.session.compacting": async (_input, output) => {
    //   output.context.push("Add plugin-specific continuity notes here.");
    // },
  };
}
