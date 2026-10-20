import { LoggerHelpers } from "../services/logger.js";

export { handleCommandError };

/**
 * Handles command errors with consistent formatting and exits the process.
 * Replaces the repeated try-catch pattern across all command modules.
 *
 * @param error - The caught error (unknown type)
 * @param context - Description of what was happening (e.g., "Error bumping version")
 */
function handleCommandError(error: unknown, context: string): never {
  const message = error instanceof Error ? error.message : String(error);
  LoggerHelpers.error(`${context}: ${message}`);
  process.exit(1);
}
