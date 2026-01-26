/**
 * Plugin type definitions
 * 
 * Centralized type definitions for the plugin.
 */

export interface PluginContext {
  project: {
    name: string;
    path: string;
  };
  client: {
    app?: {
      log: (options: LogOptions) => void;
    };
  };
  $: (cmd: string) => Promise<any>;
  directory: string;
  worktree: {
    branch: string;
    commit: string;
  };
}

export interface LogOptions {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, unknown>;
}

export interface ToolExecutionInput {
  tool: string;
  args?: Record<string, any>;
}

export interface ToolExecutionOutput {
  args?: Record<string, any>;
}

export interface SessionInput {
  sessionId?: string;
  [key: string]: unknown;
}

export interface MessageInput {
  messageId?: string;
  content?: string;
  [key: string]: unknown;
}

export interface FileOperationInput {
  path?: string;
  content?: string;
  [key: string]: unknown;
}

export interface PermissionInput {
  tool?: string;
  action?: string;
  [key: string]: unknown;
}

export type PluginHooks = {
  'session.create'?: (input: SessionInput) => Promise<void>;
  'session.complete'?: (input: SessionInput) => Promise<void>;
  'tool.execute.before'?: (input: ToolExecutionInput, output: ToolExecutionOutput) => Promise<void>;
  'tool.execute.after'?: (input: ToolExecutionInput) => Promise<void>;
  'message.create'?: (input: MessageInput) => Promise<void>;
  'message.complete'?: (input: MessageInput) => Promise<void>;
  'file.create'?: (input: FileOperationInput) => Promise<void>;
  'file.edit'?: (input: FileOperationInput) => Promise<void>;
  'permission.request'?: (input: PermissionInput) => Promise<void>;
};
