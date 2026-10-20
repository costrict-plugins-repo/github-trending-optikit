import type { CommandModule } from "yargs";
import { initializeProject } from "./init.js";
import { initOpticoreApp } from "./initApp.js";
import { rollbackFiles, rollbackRestore } from "./rollback.js";
import { checkUpgrade } from "./upgrade.js";
import { showAliases } from "./aliases.js";

export const configCommands: CommandModule[] = [
  {
    command: "init",
    describe: "Initialize OptiKit configuration in the current project",
    handler: async () => { await initializeProject(); },
  },
  {
    command: "init-app",
    describe: "Scaffold Opticore app structure (main.dart, config, router)",
    builder: {
      "app-name": { type: "string", default: "MyApp", description: "The app name for CoreSetup configuration" },
    },
    handler: async (argv) => { await initOpticoreApp(argv.appName as string); },
  },
  {
    command: "rollback",
    aliases: ["undo"],
    describe: "List and restore files from OptiKit backups",
    builder: {
      restore: { type: "number", description: "Restore backup by index number" },
      before: { type: "string", description: "Show backups before date (YYYY-MM-DD)" },
    },
    handler: async (argv) => {
      const restoreIndex = argv.restore as number | undefined;
      if (restoreIndex !== undefined) {
        await rollbackRestore(restoreIndex);
      } else {
        await rollbackFiles(argv.before as string | undefined);
      }
    },
  },
  {
    command: "upgrade",
    aliases: ["up"],
    describe: "Check for OptiKit CLI updates",
    handler: async () => { await checkUpgrade(); },
  },
  {
    command: "aliases",
    describe: "Show all command aliases, short flags, and examples",
    handler: () => { showAliases(); },
  },
];
