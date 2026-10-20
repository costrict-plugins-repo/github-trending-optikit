import type { CommandModule } from "yargs";
import { cleanProject } from "./flutter.js";
import { cleanIosProject } from "./ios.js";

export const cleanCommands: CommandModule[] = [
  {
    command: "clean",
    aliases: ["c"],
    describe: "Clean Flutter project (add --ios or --all for iOS)",
    builder: {
      ios: { alias: "i", type: "boolean", default: false, description: "Also clean iOS project (pods)" },
      all: { alias: "a", type: "boolean", default: false, description: "Clean both Flutter and iOS" },
      "disable-fvm": { alias: "f", type: "boolean", default: false, description: "Run without FVM" },
      "clean-cache": { alias: "c", type: "boolean", default: false, description: "Clean CocoaPods cache (iOS only)" },
      "repo-update": { alias: "u", type: "boolean", default: false, description: "Update CocoaPods repo (iOS only)" },
    },
    handler: async (argv) => {
      await cleanProject(argv.disableFvm as boolean);
      if (argv.ios || argv.all) {
        await cleanIosProject(argv.cleanCache as boolean, argv.repoUpdate as boolean);
      }
    },
  },
  {
    command: "clean-flutter",
    aliases: ["cf"],
    describe: "Clean the Flutter project",
    builder: {
      "disable-fvm": { alias: "f", type: "boolean", default: false, description: "Run without FVM" },
    },
    handler: (argv) => { cleanProject(argv.disableFvm as boolean); },
  },
  {
    command: "clean-ios",
    aliases: ["ci"],
    describe: "Clean the iOS project",
    builder: {
      "clean-cache": { alias: "c", type: "boolean", default: false, description: "Clean CocoaPods cache" },
      "repo-update": { alias: "u", type: "boolean", default: false, description: "Update CocoaPods repo" },
    },
    handler: (argv) => { cleanIosProject(argv.cleanCache as boolean, argv.repoUpdate as boolean); },
  },
];
