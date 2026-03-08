import type { Plugin, PluginContext, PluginHooks } from "./types";
import { registerHooks } from "./hooks";
import { Logger } from "./utils";

// Optional helpers are available if your plugin grows in complexity:
// import { createConfigManager } from "./config";
// import { createStateManager, StateLevel } from "./state";
// import { PluginDatabase } from "./database";

export const MyPlugin: Plugin = async (context: PluginContext): Promise<PluginHooks> => {
  const logger = new Logger(context);
  await logger.info("Plugin initialized");

  // Example Bun-native SQLite starter:
  // const database = await PluginDatabase.open("{{PLUGIN_NAME}}", {
  //   directory: context.directory,
  //   level: "project",
  // });
  // database.set("last-session", { startedAt: new Date().toISOString() });

  return registerHooks(logger);
};

export default MyPlugin;
export type { Plugin, PluginContext, PluginHooks } from "./types";
