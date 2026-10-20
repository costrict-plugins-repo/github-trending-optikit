#!/usr/bin/env node

// MCP mode: redirect all console output to stderr before any imports
const isMcpMode = process.argv.includes("mcp");
if (isMcpMode) {
  const origLog = console.log;
  console.log = (...args: unknown[]) => console.error(...args);
  // Restore for JSON-RPC (SDK uses process.stdout directly)
  void origLog;
}

import chalk from "chalk";
import boxen from "boxen";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import type { CommandModule } from "yargs";
import { createRequire } from "module";
import { bannerBoxOptions, createBanner } from "./styles.js";
import { loadConfig } from "./utils/services/config.js";
import { setDryRunMode } from "./utils/helpers/dryRun.js";

// Command modules
import { buildCommands } from "./commands/build/commands.js";
import { cleanCommands } from "./commands/clean/commands.js";
import { versionCommands } from "./commands/version/commands.js";
import { projectCommands } from "./commands/project/commands.js";
import { configCommands } from "./commands/config/commands.js";
import { mcpCommands } from "./commands/mcp/commands.js";

const require = createRequire(import.meta.url);
const packageInfo: { version: string } = require("../package.json");

// Greeting banner (skip in MCP mode — stdout is reserved for JSON-RPC)
if (!isMcpMode) {
  console.log(boxen(createBanner(packageInfo.version), bannerBoxOptions));
}

// Load config once
const config = loadConfig();

// Collect all commands
const allCommands: CommandModule[] = [
  ...buildCommands,
  ...cleanCommands,
  ...versionCommands,
  ...projectCommands,
  ...configCommands,
  ...mcpCommands,
];

// Build CLI
const cli = yargs(hideBin(process.argv))
  .scriptName("optikit")
  .option("dry-run", {
    type: "boolean",
    default: false,
    description: "Preview operations without executing them",
    global: true,
  })
  .middleware((argv) => {
    if (argv.dryRun) {
      setDryRunMode(true);
    }
    if (config.useFvmByDefault === false && !process.argv.includes("--disable-fvm")) {
      argv.disableFvm = true;
    }
  });

// Register all commands
for (const command of allCommands) {
  cli.command(command);
}

cli
  .completion("completion", "Generate shell completion script")
  .usage(chalk.white.bold("\nUsage:") + chalk.gray(" optikit <command> [options]"))
  .epilogue(
    chalk.cyan.bold("\nQuick Reference") + chalk.gray("  (use ok or optikit — both work)\n") +
    "\n" +
    chalk.cyan("  Build     ") + chalk.white.bold("apk  aab  ios  ipa  tf") + chalk.gray(" (testflight)\n") +
    chalk.cyan("  Clean     ") + chalk.white.bold("c") + chalk.gray(" (flutter)  ") + chalk.white.bold("ci") + chalk.gray(" (iOS)  ") + chalk.white.bold("c -a") + chalk.gray(" (all)\n") +
    chalk.cyan("  Bump      ") + chalk.white.bold("bump <type>  bi  ba  bb\n") +
    chalk.cyan("  Version   ") + chalk.white.bold("v") + chalk.gray(" (show)  ") + chalk.white.bold("vset") + chalk.gray(" (set manually)\n") +
    chalk.cyan("  Generate  ") + chalk.white.bold("gen module <name>  gen repo <name>  route <name>\n") +
    chalk.cyan("  Run       ") + chalk.white.bold("run  rs") + chalk.gray(" (interactive)  ") + chalk.white.bold("devs") + chalk.gray(" (list devices)\n") +
    chalk.cyan("  Open      ") + chalk.white.bold("xcode  studio\n") +
    chalk.cyan("  Config    ") + chalk.white.bold("init  vscode  undo  up\n") +
    chalk.cyan("  Info      ") + chalk.white.bold("info  dr  aliases\n") +
    chalk.cyan("  MCP       ") + chalk.white.bold("mcp  setup-claude\n") +
    "\n" +
    chalk.cyan("  Combos    ") + chalk.green("ok apk --clean -o") + chalk.gray("  |  ") + chalk.green("ok ipa -b patch -o") + chalk.gray("  |  ") + chalk.green("ok tf -o") +
    "\n\n" +
    chalk.gray("  Run ") + chalk.white("optikit <command> --help") + chalk.gray(" for details  |  ") +
    chalk.white("optikit aliases") + chalk.gray(" for full reference")
  )
  .version(packageInfo.version)
  .help(true)
  .argv;
