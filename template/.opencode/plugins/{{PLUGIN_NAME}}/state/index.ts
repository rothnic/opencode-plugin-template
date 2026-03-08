import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { homedir } from "os";
import { dirname, join } from "path";

export type StateLevel = "project" | "global";

/**
 * Stores plugin state outside the plugin code directory so it can be removed
 * independently of the plugin implementation:
 * - project: ./.opencode/state/<plugin-name>.json
 * - global: ~/.config/opencode/state/<plugin-name>.json
 */
export class StateManager<T extends Record<string, unknown>> {
  constructor(private readonly pluginName: string, private readonly directory: string) {}

  load(level: StateLevel, defaults: T): T {
    const filePath = this.getPath(level);
    if (!existsSync(filePath)) return defaults;

    try {
      return {
        ...defaults,
        ...JSON.parse(readFileSync(filePath, "utf-8")),
      } as T;
    } catch {
      return defaults;
    }
  }

  save(level: StateLevel, value: T) {
    const filePath = this.getPath(level);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
  }

  clear(level: StateLevel) {
    const filePath = this.getPath(level);
    if (existsSync(filePath)) rmSync(filePath);
  }

  getPath(level: StateLevel) {
    if (level === "global") {
      return join(homedir(), ".config", "opencode", "state", `${this.pluginName}.json`);
    }

    return join(this.directory, ".opencode", "state", `${this.pluginName}.json`);
  }
}

export function createStateManager<T extends Record<string, unknown>>(
  pluginName: string,
  directory = process.cwd(),
) {
  return new StateManager<T>(pluginName, directory);
}
