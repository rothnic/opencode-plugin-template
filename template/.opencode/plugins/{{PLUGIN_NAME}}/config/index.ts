export interface PluginConfig {
  enabled?: boolean;
  logLevel?: "debug" | "info" | "warn" | "error";
}

export type ConfigSource = "default" | "global" | "project" | "runtime";

export interface ConfigLoadResult<T> {
  config: T;
  source: ConfigSource;
  path?: string;
}

function joinPath(...parts: string[]) {
  return parts
    .filter(Boolean)
    .join("/")
    .replace(/\/{2,}/g, "/");
}

function getHomeDirectory() {
  return Bun.env.HOME || Bun.env.USERPROFILE || "";
}

async function readJson(filePath: string): Promise<Record<string, unknown> | null> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) return null;

  try {
    return (await file.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export class ConfigManager<T extends PluginConfig = PluginConfig> {
  constructor(
    private readonly pluginName: string,
    private readonly directory: string,
  ) {}

  async load(defaults: Partial<T> = {}, runtime: Partial<T> = {}): Promise<ConfigLoadResult<T>> {
    const globalPath = joinPath(getHomeDirectory(), ".config", "opencode", "opencode.json");
    const projectPath = joinPath(this.directory, "opencode.json");

    const globalConfig = this.pickPluginConfig(await readJson(globalPath));
    const projectConfig = this.pickPluginConfig(await readJson(projectPath));

    const merged = {
      ...defaults,
      ...globalConfig,
      ...projectConfig,
      ...runtime,
    } as T;

    const source: ConfigSource = Object.keys(runtime).length
      ? "runtime"
      : projectConfig
        ? "project"
        : globalConfig
          ? "global"
          : "default";

    return {
      config: merged,
      source,
      path: source === "project" ? projectPath : source === "global" ? globalPath : undefined,
    };
  }

  private pickPluginConfig(config: Record<string, unknown> | null): Partial<T> | null {
    if (!config) return null;

    // Prefer a dedicated nested "plugins" object first, then fall back to a direct
    // top-level plugin key so the helper can work with either configuration style.
    const plugins = config.plugins;
    if (plugins && typeof plugins === "object" && !Array.isArray(plugins)) {
      const pluginConfig = (plugins as Record<string, unknown>)[this.pluginName];
      if (pluginConfig && typeof pluginConfig === "object" && !Array.isArray(pluginConfig)) {
        return pluginConfig as Partial<T>;
      }
    }

    const directConfig = config[this.pluginName];
    if (directConfig && typeof directConfig === "object" && !Array.isArray(directConfig)) {
      return directConfig as Partial<T>;
    }

    return null;
  }
}

export function createConfigManager<T extends PluginConfig = PluginConfig>(
  pluginName: string,
  directory = process.cwd(),
) {
  return new ConfigManager<T>(pluginName, directory);
}
