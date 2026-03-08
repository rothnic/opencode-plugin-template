import type { Plugin, PluginContext, PluginHooks } from "./types";
import { registerHooks } from "./hooks";
import { Logger } from "./utils";

// Optional helpers are available if your plugin grows in complexity:
// import { createConfigManager } from "./config";
// import { createStateManager, StateLevel } from "./state";

export const MyPlugin: Plugin = async (context: PluginContext): Promise<PluginHooks> => {
  const logger = new Logger(context);
  await logger.info("Plugin initialized");

  return registerHooks(logger);
};

export default MyPlugin;
export type { Plugin, PluginContext, PluginHooks } from "./types";
