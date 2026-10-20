import type { CommandModule } from "yargs";
import { generateModule, generateRepoModule, addRoute } from "./generate.js";
import { openIos, openAndroid, openIpaOutput, openBundleOutput, openApkOutput } from "./open.js";
import { createVscodeSettings } from "./setup.js";
import { listDevices, runApp, runAppInteractive } from "./devices.js";
import { runDoctor } from "./doctor.js";
import { showStatus } from "./status.js";

export const projectCommands: CommandModule[] = [
  {
    command: "generate",
    aliases: ["gen"],
    describe: "Generate module or repository scaffolding",
    builder: (yargs) => {
      return yargs
        .command({
          command: "module <moduleName>",
          describe: "Generate a module with full BLoC structure",
          builder: (y) => {
            return y
              .positional("moduleName", { describe: "The name of the module to generate", type: "string" as const })
              .option("with-route", { alias: "r", type: "boolean", default: false, description: "Also register a route in app_router.dart" });
          },
          handler: (argv) => {
            const moduleName = argv.moduleName as string;
            generateModule(moduleName);
            if (argv.withRoute) { addRoute(moduleName); }
          },
        })
        .command({
          command: "repo <moduleName>",
          describe: "Generate a repository file for an existing module",
          builder: (y) => {
            return y.positional("moduleName", { describe: "The module name", type: "string" as const });
          },
          handler: async (argv) => { await generateRepoModule(argv.moduleName as string); },
        })
        .demandCommand(1, "Specify a subcommand: module or repo");
    },
    handler: () => { /* handled by subcommands */ },
  },
  {
    command: "add-route <moduleName>",
    aliases: ["route"],
    describe: "Add a route entry for a module to app_router.dart",
    builder: (yargs) => {
      return yargs.positional("moduleName", { describe: "The module name to add a route for", type: "string" as const });
    },
    handler: (argv) => { addRoute(argv.moduleName as string); },
  },
  {
    command: "open-ios",
    aliases: ["xcode"],
    describe: "Open the iOS project in Xcode",
    handler: async () => { await openIos(); },
  },
  {
    command: "open-android",
    aliases: ["studio"],
    describe: "Open the Android project in Android Studio",
    handler: async () => { await openAndroid(); },
  },
  {
    command: "open-ipa",
    describe: "Open the IPA build output directory",
    handler: async () => { await openIpaOutput(); },
  },
  {
    command: "open-apk",
    describe: "Open the APK build output directory",
    handler: async () => { await openApkOutput(); },
  },
  {
    command: "open-bundle",
    describe: "Open the Android Bundle build output directory",
    handler: async () => { await openBundleOutput(); },
  },
  {
    command: "setup-vscode",
    aliases: ["vscode"],
    describe: "Create a .vscode folder with recommended Flutter settings",
    handler: async () => { await createVscodeSettings(); },
  },
  {
    command: "devices",
    aliases: ["devs"],
    describe: "List all connected devices",
    builder: {
      "disable-fvm": { alias: "f", type: "boolean", default: false, description: "Run without FVM" },
    },
    handler: async (argv) => { await listDevices(!argv.disableFvm); },
  },
  {
    command: "run",
    describe: "Run Flutter app on connected device",
    builder: {
      device: { alias: "d", type: "string", description: "Specific device ID to run on" },
      release: { alias: "r", type: "boolean", default: false, description: "Run in release mode" },
      flavor: { type: "string", description: "Build flavor to use" },
      "disable-fvm": { alias: "f", type: "boolean", default: false, description: "Run without FVM" },
    },
    handler: async (argv) => {
      await runApp({
        device: argv.device as string | undefined,
        release: argv.release as boolean,
        flavor: argv.flavor as string | undefined,
        useFvm: !argv.disableFvm,
      });
    },
  },
  {
    command: "run-select",
    aliases: ["rs"],
    describe: "Interactive device selection and run",
    builder: {
      release: { alias: "r", type: "boolean", default: false, description: "Run in release mode" },
      flavor: { type: "string", description: "Build flavor to use" },
      "disable-fvm": { alias: "f", type: "boolean", default: false, description: "Run without FVM" },
    },
    handler: async (argv) => {
      await runAppInteractive({
        release: argv.release as boolean,
        flavor: argv.flavor as string | undefined,
        useFvm: !argv.disableFvm,
      });
    },
  },
  {
    command: "status",
    aliases: ["info"],
    describe: "Show project version, config, and platform info",
    handler: async () => { await showStatus(); },
  },
  {
    command: "doctor",
    aliases: ["dr"],
    describe: "Check development environment and project health",
    handler: async () => { await runDoctor(); },
  },
];
