import type { CommandModule } from "yargs";
import {
  buildFlutterApk,
  buildFlutterBundle,
  buildFlutterIos,
  buildFlutterIpa,
} from "./releases.js";
import { cleanProject } from "../clean/flutter.js";
import { cleanIosProject } from "../clean/ios.js";
import { bumpVersion, bumpIosBuildOnly } from "../version/bump.js";
import { openApkOutput, openBundleOutput, openIpaOutput } from "../project/open.js";
import { LoggerHelpers } from "../../utils/services/logger.js";
import { runTestflight } from "./testflight.js";

const buildOptions = {
  "disable-fvm": {
    alias: "f",
    type: "boolean" as const,
    default: false,
    description: "Run without FVM",
  },
  clean: {
    type: "boolean" as const,
    default: false,
    description: "Clean before building",
  },
  open: {
    alias: "o",
    type: "boolean" as const,
    default: false,
    description: "Open output directory after build",
  },
  bump: {
    alias: "b",
    type: "string" as const,
    choices: ["major", "minor", "patch"] as const,
    description: "Bump version before building",
  },
};

const ipaOptions = {
  ...buildOptions,
  "bump-ios": {
    alias: "i",
    type: "boolean" as const,
    default: false,
    description: "Bump iOS build number before building",
  },
};

type BumpType = "major" | "minor" | "patch";

interface BuildFlags {
  disableFvm: boolean;
  clean: boolean;
  open: boolean;
  bump?: BumpType;
  bumpIos?: boolean;
}

async function runPreBuild(flags: BuildFlags, isIosBuild: boolean): Promise<void> {
  // 1. Bump version
  if (flags.bump) {
    LoggerHelpers.step(`Bumping ${flags.bump} version...`);
    await bumpVersion(flags.bump, true);
  }
  if (flags.bumpIos) {
    LoggerHelpers.step("Bumping iOS build number...");
    await bumpIosBuildOnly(true);
  }

  // 2. Clean
  if (flags.clean) {
    LoggerHelpers.step("Cleaning project...");
    await cleanProject(flags.disableFvm);
    if (isIosBuild) {
      await cleanIosProject(false, false);
    }
  }
}

async function runPostBuild(flags: BuildFlags, openFn: () => Promise<void>): Promise<void> {
  // 4. Open output
  if (flags.open) {
    await openFn();
  }
}

function parseFlags(argv: Record<string, unknown>): BuildFlags {
  return {
    disableFvm: argv.disableFvm as boolean,
    clean: argv.clean as boolean,
    open: argv.open as boolean,
    bump: argv.bump as BumpType | undefined,
    bumpIos: argv.bumpIos as boolean | undefined,
  };
}

export const buildCommands: CommandModule[] = [
  {
    command: "flutter-build-apk",
    aliases: ["apk"],
    describe: "Build the Flutter APK with release configuration, obfuscation, and split debug info",
    builder: buildOptions,
    handler: async (argv) => {
      const flags = parseFlags(argv);
      await runPreBuild(flags, false);
      await buildFlutterApk(flags.disableFvm);
      await runPostBuild(flags, openApkOutput);
    },
  },
  {
    command: "flutter-build-bundle",
    aliases: ["aab"],
    describe: "Build the Flutter Bundle with release configuration, obfuscation, and split debug info",
    builder: buildOptions,
    handler: async (argv) => {
      const flags = parseFlags(argv);
      await runPreBuild(flags, false);
      await buildFlutterBundle(flags.disableFvm);
      await runPostBuild(flags, openBundleOutput);
    },
  },
  {
    command: "flutter-build-ios",
    aliases: ["ios"],
    describe: "Build the Flutter iOS app with release configuration and increment the build version",
    builder: buildOptions,
    handler: async (argv) => {
      const flags = parseFlags(argv);
      await runPreBuild(flags, true);
      await buildFlutterIos(flags.disableFvm);
    },
  },
  {
    command: "flutter-build-ipa",
    aliases: ["ipa"],
    describe: "Create a release IPA with an updated build version number",
    builder: ipaOptions,
    handler: async (argv) => {
      const flags = parseFlags(argv);
      await runPreBuild(flags, true);
      await buildFlutterIpa(flags.disableFvm);
      await runPostBuild(flags, openIpaOutput);
    },
  },
  {
    command: "testflight",
    aliases: ["tf"],
    describe: "Bump iOS build number and build IPA (TestFlight workflow)",
    builder: {
      "disable-fvm": {
        alias: "f",
        type: "boolean" as const,
        default: false,
        description: "Run without FVM",
      },
      open: {
        alias: "o",
        type: "boolean" as const,
        default: false,
        description: "Open IPA output directory after build",
      },
    },
    handler: async (argv) => {
      await runTestflight(argv.disableFvm as boolean, argv.open as boolean);
    },
  },
];
