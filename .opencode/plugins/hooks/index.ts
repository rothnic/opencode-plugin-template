/**
 * Plugin hooks implementation
 * 
 * Individual hook implementations organized by category.
 */

import type { 
  SessionInput, 
  MessageInput, 
  ToolExecutionInput, 
  ToolExecutionOutput,
  FileOperationInput,
  PermissionInput 
} from '../types';
import { Logger, isDangerousCommand } from '../utils';

/**
 * Session lifecycle hooks
 */
export function createSessionHooks(logger: Logger) {
  return {
    'session.create': async (input: SessionInput) => {
      logger.info('Session created', { sessionId: input.sessionId });
    },

    'session.complete': async (input: SessionInput) => {
      logger.info('Session completed', { sessionId: input.sessionId });
    },
  };
}

/**
 * Tool execution hooks
 */
export function createToolHooks(logger: Logger) {
  return {
    'tool.execute.before': async (input: ToolExecutionInput, output: ToolExecutionOutput) => {
      // Security: Block dangerous bash commands
      if (input.tool === 'bash' && output.args?.command) {
        const command = output.args.command as string;
        
        if (isDangerousCommand(command)) {
          logger.error('Dangerous command blocked', { 
            tool: input.tool,
            command: command.substring(0, 100) // Log first 100 chars only
          });
          throw new Error('⚠️ Dangerous command blocked by plugin for security');
        }
      }

      logger.debug('Tool execution starting', { tool: input.tool });
    },

    'tool.execute.after': async (input: ToolExecutionInput) => {
      logger.debug('Tool execution completed', { tool: input.tool });
    },
  };
}

/**
 * Message hooks
 */
export function createMessageHooks(logger: Logger) {
  return {
    'message.create': async (input: MessageInput) => {
      logger.debug('Message created', { messageId: input.messageId });
    },

    'message.complete': async (input: MessageInput) => {
      logger.debug('Message completed', { messageId: input.messageId });
    },
  };
}

/**
 * File operation hooks
 */
export function createFileHooks(logger: Logger) {
  return {
    'file.create': async (input: FileOperationInput) => {
      logger.debug('File created', { path: input.path });
    },

    'file.edit': async (input: FileOperationInput) => {
      logger.debug('File edited', { path: input.path });
    },
  };
}

/**
 * Permission hooks
 */
export function createPermissionHooks(logger: Logger) {
  return {
    'permission.request': async (input: PermissionInput) => {
      logger.debug('Permission requested', { 
        tool: input.tool,
        action: input.action 
      });
    },
  };
}
