/**
 * Type definitions for OpenCode plugin context and hooks
 */

export interface PluginContext {
  /** OpenCode client for API interactions */
  client: any;
  
  /** Project information */
  project: {
    name: string;
    path: string;
  };
  
  /** Shell executor */
  $: (command: string) => Promise<any>;
  
  /** Current directory path */
  directory: string;
  
  /** Git worktree information */
  worktree: {
    branch: string;
    commit: string;
  };
}

export interface HookInput {
  tool?: string;
  args?: any;
  [key: string]: any;
}

export interface HookOutput {
  args?: any;
  [key: string]: any;
}
