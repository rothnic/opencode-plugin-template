/**
 * Plugin Configuration Management
 * 
 * Handles loading and merging plugin configuration from multiple sources:
 * - Global config (~/.config/opencode/opencode.json)
 * - Project config (./opencode.json or ./.opencode/opencode.json)
 * - Plugin-specific config files
 * 
 * Follows OpenCode's configuration hierarchy:
 * 1. Remote (Organization) - lowest precedence
 * 2. Global (User) - ~/.config/opencode/
 * 3. Custom Path - via OPENCODE_CONFIG env var
 * 4. Project - ./opencode.json
 * 5. Inline (Runtime) - highest precedence
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { PluginContext } from "../types";

/**
 * Plugin-specific configuration interface
 * Extend this with your own configuration options
 */
export interface PluginConfig {
  enabled?: boolean;
  logLevel?: "debug" | "info" | "warn" | "error";
  // Add your plugin-specific configuration here
  // Example:
  // customOption?: string;
  // featureFlags?: {
  //   enableFeatureX?: boolean;
  //   enableFeatureY?: boolean;
  // };
}

/**
 * Configuration sources in order of precedence (lowest to highest)
 */
export enum ConfigSource {
  DEFAULT = "default",
  GLOBAL = "global",
  PROJECT = "project",
  RUNTIME = "runtime",
}

/**
 * Configuration with source tracking
 */
export interface ConfigWithSource<T> {
  config: T;
  source: ConfigSource;
  path?: string;
}

/**
 * Configuration Manager for loading and merging plugin configurations
 */
export class ConfigManager<T extends PluginConfig = PluginConfig> {
  private pluginName: string;
  private context: PluginContext;
  private cache?: ConfigWithSource<T>;

  constructor(context: PluginContext, pluginName: string) {
    this.context = context;
    this.pluginName = pluginName;
  }

  /**
   * Load configuration from all sources and merge
   * Returns merged configuration with highest precedence
   */
  async load(defaults?: Partial<T>): Promise<ConfigWithSource<T>> {
    if (this.cache) {
      return this.cache;
    }

    const configs: ConfigWithSource<Partial<T>>[] = [];

    // 1. Default configuration (lowest precedence)
    if (defaults) {
      configs.push({
        config: defaults,
        source: ConfigSource.DEFAULT,
      });
    }

    // 2. Global configuration
    const globalConfig = await this.loadGlobalConfig();
    if (globalConfig) {
      configs.push(globalConfig);
    }

    // 3. Project configuration
    const projectConfig = await this.loadProjectConfig();
    if (projectConfig) {
      configs.push(projectConfig);
    }

    // 4. Runtime configuration (from context or environment)
    const runtimeConfig = await this.loadRuntimeConfig();
    if (runtimeConfig) {
      configs.push(runtimeConfig);
    }

    // Merge all configurations
    const merged = this.mergeConfigs(configs);

    this.cache = merged;
    return merged;
  }

  /**
   * Load global configuration from ~/.config/opencode/
   */
  private async loadGlobalConfig(): Promise<ConfigWithSource<Partial<T>> | null> {
    const globalConfigDir = join(homedir(), ".config", "opencode");
    const globalConfigPath = join(globalConfigDir, "opencode.json");

    if (!existsSync(globalConfigPath)) {
      return null;
    }

    try {
      const content = readFileSync(globalConfigPath, "utf-8");
      const config = JSON.parse(content);

      // Extract plugin-specific config
      const pluginConfig = config.plugins?.[this.pluginName] || config[this.pluginName];

      if (!pluginConfig) {
        return null;
      }

      return {
        config: pluginConfig as Partial<T>,
        source: ConfigSource.GLOBAL,
        path: globalConfigPath,
      };
    } catch (error) {
      // Silently fail - global config is optional
      return null;
    }
  }

  /**
   * Load project configuration from ./opencode.json or ./.opencode/
   */
  private async loadProjectConfig(): Promise<ConfigWithSource<Partial<T>> | null> {
    const projectRoot = this.context.cwd || process.cwd();

    // Try multiple locations
    const possiblePaths = [
      join(projectRoot, "opencode.json"),
      join(projectRoot, "opencode.jsonc"),
      join(projectRoot, ".opencode", "opencode.json"),
      join(projectRoot, ".opencode", `${this.pluginName}.json`),
    ];

    for (const configPath of possiblePaths) {
      if (!existsSync(configPath)) {
        continue;
      }

      try {
        const content = readFileSync(configPath, "utf-8");
        const config = JSON.parse(content);

        // Extract plugin-specific config
        const pluginConfig = config.plugins?.[this.pluginName] || config[this.pluginName];

        if (!pluginConfig) {
          continue;
        }

        return {
          config: pluginConfig as Partial<T>,
          source: ConfigSource.PROJECT,
          path: configPath,
        };
      } catch (error) {
        // Continue to next path
        continue;
      }
    }

    return null;
  }

  /**
   * Load runtime configuration (from environment or context)
   */
  private async loadRuntimeConfig(): Promise<ConfigWithSource<Partial<T>> | null> {
    // Check environment variable for runtime config
    const envConfig = process.env[`${this.pluginName.toUpperCase()}_CONFIG`];
    if (envConfig) {
      try {
        const config = JSON.parse(envConfig);
        return {
          config: config as Partial<T>,
          source: ConfigSource.RUNTIME,
        };
      } catch (error) {
        // Invalid JSON in environment variable
        return null;
      }
    }

    return null;
  }

  /**
   * Merge configurations with later sources taking precedence
   */
  private mergeConfigs(configs: ConfigWithSource<Partial<T>>[]): ConfigWithSource<T> {
    if (configs.length === 0) {
      return {
        config: {} as T,
        source: ConfigSource.DEFAULT,
      };
    }

    // Deep merge all configs
    const merged = configs.reduce((acc, curr) => {
      return {
        ...acc,
        ...this.deepMerge(acc, curr.config),
      };
    }, {} as Partial<T>);

    // Return with source of highest precedence config
    const highestPrecedence = configs[configs.length - 1];

    return {
      config: merged as T,
      source: highestPrecedence.source,
      path: highestPrecedence.path,
    };
  }

  /**
   * Deep merge two objects
   */
  private deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const output = { ...target };

    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (this.isObject(sourceValue) && this.isObject(targetValue)) {
        // @ts-ignore - Complex type merging
        output[key] = this.deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        // @ts-ignore - Assign source value
        output[key] = sourceValue;
      }
    }

    return output;
  }

  /**
   * Check if value is a plain object
   */
  private isObject(obj: unknown): obj is Record<string, unknown> {
    return obj !== null && typeof obj === "object" && !Array.isArray(obj);
  }

  /**
   * Clear cached configuration
   */
  clearCache(): void {
    this.cache = undefined;
  }

  /**
   * Get config value by key path (e.g., "feature.subfeature.option")
   */
  async get<K extends keyof T>(key: K): Promise<T[K] | undefined>;
  async get(keyPath: string): Promise<unknown>;
  async get(keyPath: string | keyof T): Promise<unknown> {
    const config = await this.load();
    const keys = String(keyPath).split(".");

    let value: unknown = config.config;
    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Check if configuration is loaded from project level
   */
  async isProjectConfig(): Promise<boolean> {
    const config = await this.load();
    return config.source === ConfigSource.PROJECT;
  }

  /**
   * Check if configuration is loaded from global level
   */
  async isGlobalConfig(): Promise<boolean> {
    const config = await this.load();
    return config.source === ConfigSource.GLOBAL;
  }
}

/**
 * Create a configuration manager for your plugin
 * 
 * @example
 * ```typescript
 * const configManager = createConfigManager(context, 'my-plugin');
 * const config = await configManager.load({ enabled: true, logLevel: 'info' });
 * console.log('Plugin config:', config);
 * ```
 */
export function createConfigManager<T extends PluginConfig = PluginConfig>(
  context: PluginContext,
  pluginName: string
): ConfigManager<T> {
  return new ConfigManager<T>(context, pluginName);
}
