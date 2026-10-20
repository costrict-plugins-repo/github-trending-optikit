import * as fs from "fs";
import * as path from "path";
import { homedir } from "os";
import { execSync } from "child_process";
import { LoggerHelpers } from "../../utils/services/logger.js";
import { MCP_CONFIG } from "../../constants.js";

function getSettingsPath(): string {
  return path.join(homedir(), MCP_CONFIG.CLAUDE_SETTINGS_FILE);
}

function resolveOptikitBinary(): string {
  try {
    const cmd = process.platform === "win32" ? "where optikit" : "which optikit";
    return execSync(cmd, { encoding: "utf8" }).trim().split("\n")[0];
  } catch {
    return "optikit";
  }
}

function readSettings(filePath: string): Record<string, unknown> {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch {
    LoggerHelpers.warning("Could not parse existing settings, creating fresh config.");
  }
  return {};
}

function writeSettings(filePath: string, settings: Record<string, unknown>): void {
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2) + "\n", "utf8");
}

export function setupClaude(uninstall: boolean): void {
  const settingsPath = getSettingsPath();

  if (uninstall) {
    const settings = readSettings(settingsPath);
    const mcpServers = (settings.mcpServers ?? {}) as Record<string, unknown>;
    if (mcpServers.optikit) {
      delete mcpServers.optikit;
      settings.mcpServers = mcpServers;
      writeSettings(settingsPath, settings);
      LoggerHelpers.success("OptiKit MCP server removed from Claude Code.");
    } else {
      LoggerHelpers.info("OptiKit MCP server was not registered.");
    }
    return;
  }

  const binaryPath = resolveOptikitBinary();
  const settings = readSettings(settingsPath);
  const mcpServers = (settings.mcpServers ?? {}) as Record<string, unknown>;

  mcpServers.optikit = {
    command: binaryPath,
    args: ["mcp"],
  };

  settings.mcpServers = mcpServers;
  writeSettings(settingsPath, settings);

  LoggerHelpers.success("OptiKit MCP server registered with Claude Code.");
  LoggerHelpers.dim(`Config: ${settingsPath}`);
  LoggerHelpers.dim(`Binary: ${binaryPath}`);
  LoggerHelpers.info("Restart Claude Code to activate OptiKit tools.");
}
