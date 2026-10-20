import type { CommandModule } from "yargs";
import {
  bumpVersion,
  bumpIosBuildOnly,
  bumpAndroidBuildOnly,
  bumpBothBuilds,
  showCurrentVersion,
} from "./bump.js";
import { updateFlutterVersion } from "./update.js";

const yesOption = {
  yes: { alias: "y", type: "boolean" as const, default: false, description: "Skip confirmation prompt" },
};

export const versionCommands: CommandModule[] = [
  {
    command: "bump <type>",
    describe: "Bump version (major, minor, or patch)",
    builder: (yargs) => {
      return yargs
        .positional("type", {
          describe: "Version bump type (major, minor, patch)",
          type: "string" as const,
          choices: ["major", "minor", "patch"] as const,
        })
        .option("yes", yesOption.yes);
    },
    handler: async (argv) => {
      await bumpVersion(argv.type as "major" | "minor" | "patch", argv.yes as boolean);
    },
  },
  {
    command: "bump-ios",
    aliases: ["bi"],
    describe: "Increment iOS build number only (for TestFlight)",
    builder: yesOption,
    handler: async (argv) => { await bumpIosBuildOnly(argv.yes as boolean); },
  },
  {
    command: "bump-android",
    aliases: ["ba"],
    describe: "Increment Android build number only",
    builder: yesOption,
    handler: async (argv) => { await bumpAndroidBuildOnly(argv.yes as boolean); },
  },
  {
    command: "bump-build",
    aliases: ["bb"],
    describe: "Increment both Android and iOS build numbers",
    builder: yesOption,
    handler: async (argv) => { await bumpBothBuilds(argv.yes as boolean); },
  },
  {
    command: "version",
    aliases: ["v"],
    describe: "Show current version information",
    handler: async () => { await showCurrentVersion(); },
  },
  {
    command: "flutter-update-version",
    aliases: ["vset"],
    describe: "Update version and build numbers for both Android and iOS",
    builder: {
      "app-version": { type: "string", description: "The version number to set", default: "" },
      "android-build": { type: "string", description: "The Android build number", default: "" },
      "ios-build": { type: "string", description: "The iOS build number", default: "" },
    },
    handler: async (argv) => {
      await updateFlutterVersion(
        argv["app-version"] as string,
        argv["android-build"] as string,
        argv["ios-build"] as string
      );
    },
  },
];
