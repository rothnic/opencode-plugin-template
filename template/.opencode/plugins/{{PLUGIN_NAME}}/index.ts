import type { Plugin, PluginContext, PluginHooks } from "./types";
import { registerHooks } from "./hooks";
import { Logger } from "./utils";

// Optional helpers are available if your plugin grows in complexity:
// import { createConfigManager } from "./config";
// import { createStateManager, StateLevel } from "./state";
// import { PluginDatabase } from "./database";
// import { exampleTool } from "../../tools/example-tool";

export const MyPlugin: Plugin = async (context: PluginContext): Promise<PluginHooks> => {
  const logger = new Logger(context, {
    // Add extra destinations here if you need to fan logs out to another sink.
    // destinations: [
    //   async (entry) => {
    //     await fetch("https://example.com/plugin-logs", {
    //       method: "POST",
    //       body: JSON.stringify(entry),
    //     });
    //   },
    // ],
  });
  await logger.info("Plugin initialized");

  // Example Bun-native SQLite starter:
  // const database = await PluginDatabase.open("{{PLUGIN_NAME}}", {
  //   directory: context.directory,
  //   level: "project",
  // });
  // database.set("last-session", { startedAt: new Date().toISOString() });

  return {
    ...registerHooks(logger),
    // Register bundled custom tools by uncommenting the block below.
    // tool: {
    //   "example-custom-tool": exampleTool,
    // },
  };
};

export default MyPlugin;
export type { Plugin, PluginContext, PluginHooks } from "./types";
