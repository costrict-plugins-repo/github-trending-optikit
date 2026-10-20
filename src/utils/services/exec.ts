import { spawn } from "child_process";
import path from "path";
import { LoggerHelpers } from "./logger.js";
import { RETRY_CONFIG } from "../../constants.js";
import { isDryRunMode, DryRunManager } from "../helpers/dryRun.js";

export const iosDirectory = path.join(process.cwd(), "ios");

/**
 * Shared base executor with proper timeout support via setTimeout + kill.
 * Both execCommand and execInIos delegate to this.
 */
function execBase(
  fullCommand: string,
  options: { silent?: boolean; timeoutMs?: number } = {}
): Promise<string> {
  const { silent = false, timeoutMs } = options;

  // Dry-run: log the command instead of executing
  if (isDryRunMode()) {
    const dryRun = new DryRunManager();
    dryRun.logCommand("Execute command", fullCommand);
    return Promise.resolve("");
  }

  return new Promise((resolve, reject) => {
    const childProcess = spawn(fullCommand, { shell: true });
    const startTime = Date.now();

    let output = "";
    let lastLogLine = "";
    let killed = false;

    // Enforce timeout via setTimeout + kill (spawn doesn't support timeout)
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (timeoutMs && timeoutMs > 0) {
      timer = setTimeout(() => {
        killed = true;
        childProcess.kill("SIGTERM");
        reject(
          new Error(`Command timed out after ${timeoutMs / 1000}s: ${fullCommand}`)
        );
      }, timeoutMs);
    }

    childProcess.stdout.on("data", (data) => {
      if (silent) {
        output += data.toString();
        return;
      }

      const dataString = data.toString().trim();
      output += dataString;

      if (dataString) {
        if (
          (dataString.endsWith("ms") || dataString.endsWith("s")) &&
          lastLogLine
        ) {
          lastLogLine += ` ${dataString}`;
        } else {
          if (lastLogLine) {
            LoggerHelpers.success(lastLogLine);
          }
          lastLogLine = dataString;
        }
      }
    });

    childProcess.stderr.on("data", (data) => {
      if (silent) {
        output += data.toString();
      } else {
        LoggerHelpers.error(data.toString());
      }
    });

    childProcess.on("close", (code) => {
      if (timer) clearTimeout(timer);
      if (killed) return;

      if (!silent && lastLogLine) {
        LoggerHelpers.success(lastLogLine);
      }

      // Show elapsed time for non-silent commands over 1 second
      if (!silent) {
        const elapsed = Date.now() - startTime;
        if (elapsed > 1000) {
          LoggerHelpers.info(`Completed in ${formatElapsed(elapsed)}`);
        }
      }

      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve(output);
      }
    });

    childProcess.on("error", (err) => {
      if (timer) clearTimeout(timer);
      reject(new Error(`Failed to start subprocess: ${err.message}`));
    });
  });
}

export async function execCommand(command: string): Promise<string> {
  return execBase(command);
}

export async function execCommandSilent(command: string): Promise<string> {
  return execBase(command, { silent: true });
}

export async function execInIos(
  command: string,
  timeoutMs: number = RETRY_CONFIG.IOS_TIMEOUT_MS
): Promise<string> {
  const fullCommand = `cd "${iosDirectory}" && ${command}`;
  return execBase(fullCommand, { timeoutMs });
}

export async function execInIosWithRetry(
  command: string,
  retries: number = RETRY_CONFIG.DEFAULT_ATTEMPTS,
  delay: number = RETRY_CONFIG.DEFAULT_DELAY_MS
): Promise<string> {
  let attempts = 0;
  let lastError: unknown;

  while (attempts < retries) {
    try {
      return await execInIos(command);
    } catch (error) {
      attempts++;
      lastError = error;

      const message = error instanceof Error ? error.message : JSON.stringify(error);
      LoggerHelpers.error(`Attempt ${attempts} failed. Error: ${message}`);

      if (attempts >= retries) {
        const finalMessage = lastError instanceof Error ? lastError.message : "Unknown error";
        LoggerHelpers.error(`Command failed after ${retries} attempts: ${finalMessage}`);
        throw new Error(`Command failed after ${retries} attempts: ${finalMessage}`);
      }

      LoggerHelpers.error(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
