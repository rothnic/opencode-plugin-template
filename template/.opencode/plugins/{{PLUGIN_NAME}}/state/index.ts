import { mkdir, rm } from "node:fs/promises";

export type StateLevel = "project" | "global";

function joinPath(...parts: string[]) {
  return parts
    .filter(Boolean)
    .join("/")
    .replace(/\/{2,}/g, "/");
}

function dirname(pathname: string) {
  const index = pathname.lastIndexOf("/");
  return index > 0 ? pathname.slice(0, index) : ".";
}

function getHomeDirectory() {
  return Bun.env.HOME || Bun.env.USERPROFILE || "";
}

/**
 * Stores plugin state outside the plugin code directory so it can be removed
 * independently of the plugin implementation:
 * - project: ./.opencode/state/<plugin-name>.json
 * - global: ~/.config/opencode/state/<plugin-name>.json
 */
export class StateManager<T extends Record<string, unknown>> {
  constructor(private readonly pluginName: string, private readonly directory: string) {}

  async load(level: StateLevel, defaults: T): Promise<T> {
    const filePath = this.getPath(level);
    const file = Bun.file(filePath);
    if (!(await file.exists())) return defaults;

    try {
      return {
        ...defaults,
        ...((await file.json()) as Record<string, unknown>),
      } as T;
    } catch {
      return defaults;
    }
  }

  async save(level: StateLevel, value: T) {
    const filePath = this.getPath(level);
    await mkdir(dirname(filePath), { recursive: true });
    await Bun.write(filePath, JSON.stringify(value, null, 2) + "\n");
  }

  async clear(level: StateLevel) {
    const filePath = this.getPath(level);
    await rm(filePath, { force: true });
  }

  getPath(level: StateLevel) {
    if (level === "global") {
      return joinPath(getHomeDirectory(), ".config", "opencode", "state", `${this.pluginName}.json`);
    }

    return joinPath(this.directory, ".opencode", "state", `${this.pluginName}.json`);
  }
}

export function createStateManager<T extends Record<string, unknown>>(
  pluginName: string,
  directory = process.cwd(),
) {
  return new StateManager<T>(pluginName, directory);
}
