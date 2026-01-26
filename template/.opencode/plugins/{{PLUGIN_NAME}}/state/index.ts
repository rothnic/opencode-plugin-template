/**
 * Plugin State Management
 * 
 * Provides persistent state storage for plugins at both global and project levels.
 * State is stored in JSON files that can be safely removed when uninstalling the plugin.
 * 
 * Storage locations:
 * - Global: ~/.config/opencode/plugins/{plugin-name}/state.json
 * - Project: ./.opencode/plugins/{{PLUGIN_NAME}}/{plugin-name}/state.json
 * 
 * Best practices:
 * - Use project-level state for project-specific data
 * - Use global-level state for user preferences and cross-project data
 * - Always provide defaults for missing state
 * - Clean up state files when plugin is uninstalled
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import type { PluginContext } from "../types";

/**
 * State storage level
 */
export enum StateLevel {
  GLOBAL = "global", // ~/.config/opencode/plugins/{plugin-name}/
  PROJECT = "project", // ./.opencode/plugins/{{PLUGIN_NAME}}/{plugin-name}/
}

/**
 * State manager for persistent plugin data
 */
export class StateManager<T extends Record<string, unknown> = Record<string, unknown>> {
  private pluginName: string;
  private context: PluginContext;
  private globalCache?: T;
  private projectCache?: T;

  constructor(context: PluginContext, pluginName: string) {
    this.context = context;
    this.pluginName = pluginName;
  }

  /**
   * Get state file path for the specified level
   */
  private getStatePath(level: StateLevel): string {
    if (level === StateLevel.GLOBAL) {
      const globalDir = join(homedir(), ".config", "opencode", "plugins", this.pluginName);
      return join(globalDir, "state.json");
    } else {
      const projectRoot = this.context.cwd || process.cwd();
      const projectDir = join(projectRoot, ".opencode", "plugins", this.pluginName);
      return join(projectDir, "state.json");
    }
  }

  /**
   * Load state from the specified level
   */
  async load(level: StateLevel, defaults?: Partial<T>): Promise<T> {
    // Check cache first
    if (level === StateLevel.GLOBAL && this.globalCache) {
      return this.globalCache;
    }
    if (level === StateLevel.PROJECT && this.projectCache) {
      return this.projectCache;
    }

    const statePath = this.getStatePath(level);

    if (!existsSync(statePath)) {
      const defaultState = (defaults || {}) as T;
      if (level === StateLevel.GLOBAL) {
        this.globalCache = defaultState;
      } else {
        this.projectCache = defaultState;
      }
      return defaultState;
    }

    try {
      const content = readFileSync(statePath, "utf-8");
      const state = JSON.parse(content) as T;

      // Merge with defaults
      const mergedState = { ...(defaults || {}), ...state } as T;

      // Cache the state
      if (level === StateLevel.GLOBAL) {
        this.globalCache = mergedState;
      } else {
        this.projectCache = mergedState;
      }

      return mergedState;
    } catch (error) {
      // If file is corrupted, return defaults
      const defaultState = (defaults || {}) as T;
      if (level === StateLevel.GLOBAL) {
        this.globalCache = defaultState;
      } else {
        this.projectCache = defaultState;
      }
      return defaultState;
    }
  }

  /**
   * Save state to the specified level
   */
  async save(level: StateLevel, state: T): Promise<void> {
    const statePath = this.getStatePath(level);
    const stateDir = dirname(statePath);

    // Ensure directory exists
    if (!existsSync(stateDir)) {
      mkdirSync(stateDir, { recursive: true });
    }

    try {
      const content = JSON.stringify(state, null, 2);
      writeFileSync(statePath, content, "utf-8");

      // Update cache
      if (level === StateLevel.GLOBAL) {
        this.globalCache = state;
      } else {
        this.projectCache = state;
      }
    } catch (error) {
      throw new Error(`Failed to save state: ${error}`);
    }
  }

  /**
   * Update specific keys in state without replacing entire state
   */
  async update(level: StateLevel, updates: Partial<T>): Promise<T> {
    const currentState = await this.load(level);
    const newState = { ...currentState, ...updates };
    await this.save(level, newState);
    return newState;
  }

  /**
   * Get a specific value from state
   */
  async get<K extends keyof T>(level: StateLevel, key: K): Promise<T[K] | undefined>;
  async get(level: StateLevel, keyPath: string): Promise<unknown>;
  async get(level: StateLevel, keyPath: string | keyof T): Promise<unknown> {
    const state = await this.load(level);
    const keys = String(keyPath).split(".");

    let value: unknown = state;
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
   * Set a specific value in state
   */
  async set<K extends keyof T>(level: StateLevel, key: K, value: T[K]): Promise<void>;
  async set(level: StateLevel, keyPath: string, value: unknown): Promise<void>;
  async set(level: StateLevel, keyPath: string | keyof T, value: unknown): Promise<void> {
    const state = await this.load(level);
    const keys = String(keyPath).split(".");
    const lastKey = keys.pop()!;

    let target: Record<string, unknown> = state as Record<string, unknown>;
    for (const key of keys) {
      if (!(key in target) || typeof target[key] !== "object") {
        target[key] = {};
      }
      target = target[key] as Record<string, unknown>;
    }

    target[lastKey] = value;
    await this.save(level, state);
  }

  /**
   * Delete a specific key from state
   */
  async delete<K extends keyof T>(level: StateLevel, key: K): Promise<void>;
  async delete(level: StateLevel, keyPath: string): Promise<void>;
  async delete(level: StateLevel, keyPath: string | keyof T): Promise<void> {
    const state = await this.load(level);
    const keys = String(keyPath).split(".");
    const lastKey = keys.pop()!;

    let target: Record<string, unknown> = state as Record<string, unknown>;
    for (const key of keys) {
      if (!(key in target) || typeof target[key] !== "object") {
        return; // Path doesn't exist
      }
      target = target[key] as Record<string, unknown>;
    }

    delete target[lastKey];
    await this.save(level, state);
  }

  /**
   * Clear all state (useful for cleanup/uninstall)
   */
  async clear(level: StateLevel): Promise<void> {
    const statePath = this.getStatePath(level);

    if (existsSync(statePath)) {
      try {
        unlinkSync(statePath);
      } catch (error) {
        throw new Error(`Failed to clear state: ${error}`);
      }
    }

    // Clear cache
    if (level === StateLevel.GLOBAL) {
      this.globalCache = undefined;
    } else {
      this.projectCache = undefined;
    }
  }

  /**
   * Check if state exists at the specified level
   */
  async exists(level: StateLevel): Promise<boolean> {
    const statePath = this.getStatePath(level);
    return existsSync(statePath);
  }

  /**
   * Get the file path where state is stored
   */
  getPath(level: StateLevel): string {
    return this.getStatePath(level);
  }

  /**
   * Clear cache (force reload on next access)
   */
  clearCache(level?: StateLevel): void {
    if (!level || level === StateLevel.GLOBAL) {
      this.globalCache = undefined;
    }
    if (!level || level === StateLevel.PROJECT) {
      this.projectCache = undefined;
    }
  }
}

/**
 * Create a state manager for your plugin
 * 
 * @example
 * ```typescript
 * const stateManager = createStateManager(context, 'my-plugin');
 * 
 * // Load and save project-level state
 * const state = await stateManager.load(StateLevel.PROJECT, { counter: 0 });
 * state.counter++;
 * await stateManager.save(StateLevel.PROJECT, state);
 * 
 * // Or use convenience methods
 * await stateManager.set(StateLevel.PROJECT, 'counter', 42);
 * const counter = await stateManager.get(StateLevel.PROJECT, 'counter');
 * ```
 */
export function createStateManager<T extends Record<string, unknown> = Record<string, unknown>>(
  context: PluginContext,
  pluginName: string
): StateManager<T> {
  return new StateManager<T>(context, pluginName);
}
