import { z } from "zod";
import { buildFlutterApk, buildFlutterBundle, buildFlutterIos, buildFlutterIpa } from "../build/releases.js";
import { runTestflight } from "../build/testflight.js";
import { cleanProject } from "../clean/flutter.js";
import { cleanIosProject } from "../clean/ios.js";
import { bumpVersion, bumpIosBuildOnly, bumpAndroidBuildOnly, bumpBothBuilds, showCurrentVersion } from "../version/bump.js";
import { updateFlutterVersion } from "../version/update.js";
import { generateModule, generateRepoModule, addRoute } from "../project/generate.js";
import { openIos, openAndroid, openIpaOutput, openApkOutput, openBundleOutput } from "../project/open.js";
import { listDevices, runApp } from "../project/devices.js";
import { showStatus } from "../project/status.js";
import { runDoctor } from "../project/doctor.js";
import { initializeProject } from "../config/init.js";
import { initOpticoreApp } from "../config/initApp.js";
import { rollbackFiles, rollbackRestore } from "../config/rollback.js";
import { createVscodeSettings } from "../project/setup.js";
import { checkUpgrade } from "../config/upgrade.js";

export interface ToolDef {
  name: string;
  description: string;
  schema: z.ZodObject<z.ZodRawShape>;
  handler: (args: Record<string, unknown>) => Promise<string>;
}

async function captureOutput(fn: () => Promise<void> | void): Promise<string> {
  const lines: string[] = [];
  const origLog = console.log;
  const origError = console.error;
  console.log = (...args: unknown[]) => lines.push(args.map(String).join(" "));
  console.error = (...args: unknown[]) => lines.push(args.map(String).join(" "));
  try {
    await fn();
  } finally {
    console.log = origLog;
    console.error = origError;
  }
  return lines.join("\n") || "Done.";
}

export const tools: ToolDef[] = [
  // ── Build ──
  {
    name: "build_apk",
    description: "Build a Flutter APK for Android. Use when the user needs an APK for testing, distribution, or Play Store upload. Supports cleaning before build, bumping version, and opening output.",
    schema: z.object({
      disableFvm: z.boolean().optional().describe("Use global Flutter SDK instead of FVM"),
      clean: z.boolean().optional().describe("Clean project before building"),
      bump: z.enum(["major", "minor", "patch"]).optional().describe("Bump version before building"),
      open: z.boolean().optional().describe("Open output directory after build"),
    }),
    handler: async (args) => {
      if (args.bump) await bumpVersion(args.bump as "major" | "minor" | "patch", true);
      if (args.clean) await cleanProject(args.disableFvm as boolean ?? false);
      await buildFlutterApk(args.disableFvm as boolean ?? false);
      if (args.open) await openApkOutput();
      return "APK build completed.";
    },
  },
  {
    name: "build_aab",
    description: "Build a Flutter App Bundle (AAB) for Google Play Store. Use when the user needs an Android release bundle for store submission.",
    schema: z.object({
      disableFvm: z.boolean().optional().describe("Use global Flutter SDK instead of FVM"),
      clean: z.boolean().optional().describe("Clean project before building"),
      bump: z.enum(["major", "minor", "patch"]).optional().describe("Bump version before building"),
      open: z.boolean().optional().describe("Open output directory after build"),
    }),
    handler: async (args) => {
      if (args.bump) await bumpVersion(args.bump as "major" | "minor" | "patch", true);
      if (args.clean) await cleanProject(args.disableFvm as boolean ?? false);
      await buildFlutterBundle(args.disableFvm as boolean ?? false);
      if (args.open) await openBundleOutput();
      return "AAB bundle build completed.";
    },
  },
  {
    name: "build_ios",
    description: "Build the Flutter iOS app in release mode. Use when the user wants to compile for iOS without creating an IPA archive.",
    schema: z.object({
      disableFvm: z.boolean().optional().describe("Use global Flutter SDK instead of FVM"),
      clean: z.boolean().optional().describe("Clean project before building"),
      bump: z.enum(["major", "minor", "patch"]).optional().describe("Bump version before building"),
    }),
    handler: async (args) => {
      if (args.bump) await bumpVersion(args.bump as "major" | "minor" | "patch", true);
      if (args.clean) {
        await cleanProject(args.disableFvm as boolean ?? false);
        await cleanIosProject(false, false);
      }
      await buildFlutterIos(args.disableFvm as boolean ?? false);
      return "iOS build completed.";
    },
  },
  {
    name: "build_ipa",
    description: "Create a release IPA for TestFlight or App Store distribution. Use when the user wants to distribute an iOS build or upload to TestFlight.",
    schema: z.object({
      disableFvm: z.boolean().optional().describe("Use global Flutter SDK instead of FVM"),
      clean: z.boolean().optional().describe("Clean project before building"),
      bump: z.enum(["major", "minor", "patch"]).optional().describe("Bump version before building"),
      bumpIos: z.boolean().optional().describe("Bump iOS build number before building"),
      open: z.boolean().optional().describe("Open output directory after build"),
    }),
    handler: async (args) => {
      if (args.bump) await bumpVersion(args.bump as "major" | "minor" | "patch", true);
      if (args.bumpIos) await bumpIosBuildOnly(true);
      if (args.clean) {
        await cleanProject(args.disableFvm as boolean ?? false);
        await cleanIosProject(false, false);
      }
      await buildFlutterIpa(args.disableFvm as boolean ?? false);
      if (args.open) await openIpaOutput();
      return "IPA build completed.";
    },
  },
  {
    name: "testflight",
    description: "Full TestFlight workflow: bump iOS build number then build IPA. Use when preparing a new iOS build for TestFlight beta testing.",
    schema: z.object({
      disableFvm: z.boolean().optional().describe("Use global Flutter SDK instead of FVM"),
      open: z.boolean().optional().describe("Open IPA output directory after build"),
    }),
    handler: async (args) => {
      await runTestflight(args.disableFvm as boolean ?? false, args.open as boolean ?? false);
      return "TestFlight build completed.";
    },
  },

  // ── Clean ──
  {
    name: "clean",
    description: "Clean the Flutter project. Use when builds fail due to stale caches, after switching branches, or before a fresh release build. Can also clean iOS CocoaPods.",
    schema: z.object({
      disableFvm: z.boolean().optional().describe("Use global Flutter SDK instead of FVM"),
      ios: z.boolean().optional().describe("Also clean iOS project"),
      all: z.boolean().optional().describe("Clean both Flutter and iOS"),
      cleanCache: z.boolean().optional().describe("Clear CocoaPods cache (iOS)"),
      repoUpdate: z.boolean().optional().describe("Update CocoaPods spec repo (iOS)"),
    }),
    handler: async (args) => {
      await cleanProject(args.disableFvm as boolean ?? false);
      if (args.ios || args.all) {
        await cleanIosProject(args.cleanCache as boolean ?? false, args.repoUpdate as boolean ?? false);
      }
      return args.all || args.ios ? "Flutter and iOS cleaned." : "Flutter project cleaned.";
    },
  },
  {
    name: "clean_ios",
    description: "Clean only the iOS project: remove Pods, deintegrate CocoaPods. Use when iOS builds fail but Flutter is fine, or when CocoaPods has cache issues.",
    schema: z.object({
      cleanCache: z.boolean().optional().describe("Clear CocoaPods cache"),
      repoUpdate: z.boolean().optional().describe("Update CocoaPods spec repo"),
    }),
    handler: async (args) => {
      await cleanIosProject(args.cleanCache as boolean ?? false, args.repoUpdate as boolean ?? false);
      return "iOS project cleaned.";
    },
  },

  // ── Version ──
  {
    name: "bump_version",
    description: "Bump the semantic version (major, minor, or patch). Updates pubspec.yaml and iOS project files. Resets iOS build to 1. Use when preparing a new release.",
    schema: z.object({
      type: z.enum(["major", "minor", "patch"]).describe("Version bump type"),
    }),
    handler: async (args) => {
      await bumpVersion(args.type as "major" | "minor" | "patch", true);
      return `Version bumped (${args.type}).`;
    },
  },
  {
    name: "bump_ios_build",
    description: "Increment only the iOS build number without changing the version. Use before uploading a new TestFlight build.",
    schema: z.object({}),
    handler: async () => {
      await bumpIosBuildOnly(true);
      return "iOS build number incremented.";
    },
  },
  {
    name: "bump_android_build",
    description: "Increment only the Android build number without changing the version. Use before uploading to Google Play.",
    schema: z.object({}),
    handler: async () => {
      await bumpAndroidBuildOnly(true);
      return "Android build number incremented.";
    },
  },
  {
    name: "bump_both_builds",
    description: "Increment both Android and iOS build numbers simultaneously without changing the version.",
    schema: z.object({}),
    handler: async () => {
      await bumpBothBuilds(true);
      return "Both build numbers incremented.";
    },
  },
  {
    name: "show_version",
    description: "Display current version information including semver, Android build number, and iOS build number. Use to check project state before bumping or releasing.",
    schema: z.object({}),
    handler: async () => captureOutput(() => showCurrentVersion()),
  },
  {
    name: "set_version",
    description: "Manually set version and/or build numbers. Use when you need specific values rather than incrementing.",
    schema: z.object({
      appVersion: z.string().optional().describe("Version number to set (e.g. 2.0.0)"),
      androidBuild: z.string().optional().describe("Android build number to set"),
      iosBuild: z.string().optional().describe("iOS build number to set"),
    }),
    handler: async (args) => {
      await updateFlutterVersion(
        args.appVersion as string ?? "",
        args.androidBuild as string ?? "",
        args.iosBuild as string ?? "",
      );
      return "Version updated.";
    },
  },

  // ── Generate ──
  {
    name: "generate_module",
    description: "Scaffold a complete BLoC module with bloc, event, state, screen, factory, and import files. Use when creating a new feature module in an Opticore project.",
    schema: z.object({
      moduleName: z.string().describe("Module name in snake_case (e.g. user_profile)"),
      withRoute: z.boolean().optional().describe("Also register a route in app_router.dart"),
    }),
    handler: async (args) => {
      const name = args.moduleName as string;
      generateModule(name);
      if (args.withRoute) addRoute(name);
      return `Module '${name}' generated.${args.withRoute ? " Route registered." : ""}`;
    },
  },
  {
    name: "generate_repo",
    description: "Generate a repository file for an existing module. Use when adding data layer to a feature module.",
    schema: z.object({
      moduleName: z.string().describe("Module name in snake_case"),
    }),
    handler: async (args) => {
      generateRepoModule(args.moduleName as string);
      return `Repository generated for '${args.moduleName}'.`;
    },
  },
  {
    name: "add_route",
    description: "Add a route entry for a module to app_router.dart. Use when a module exists but its route is not registered.",
    schema: z.object({
      moduleName: z.string().describe("Module name in snake_case"),
    }),
    handler: async (args) => {
      addRoute(args.moduleName as string);
      return `Route added for '${args.moduleName}'.`;
    },
  },

  // ── Project ──
  {
    name: "open_xcode",
    description: "Open the iOS project in Xcode.",
    schema: z.object({}),
    handler: async () => { await openIos(); return "Xcode opened."; },
  },
  {
    name: "open_android_studio",
    description: "Open the Android project in Android Studio.",
    schema: z.object({}),
    handler: async () => { await openAndroid(); return "Android Studio opened."; },
  },
  {
    name: "list_devices",
    description: "List all connected Flutter devices including emulators and physical devices. Use to see available devices before running the app.",
    schema: z.object({
      disableFvm: z.boolean().optional().describe("Use global Flutter SDK"),
    }),
    handler: async (args) => captureOutput(() => listDevices(!(args.disableFvm as boolean ?? false))),
  },
  {
    name: "run_app",
    description: "Run the Flutter app on a connected device. Use when the user wants to test the app.",
    schema: z.object({
      device: z.string().optional().describe("Device ID to run on"),
      release: z.boolean().optional().describe("Run in release mode"),
      flavor: z.string().optional().describe("Build flavor"),
      disableFvm: z.boolean().optional().describe("Use global Flutter SDK"),
    }),
    handler: async (args) => {
      await runApp({
        device: args.device as string | undefined,
        release: args.release as boolean ?? false,
        flavor: args.flavor as string | undefined,
        useFvm: !(args.disableFvm as boolean ?? false),
      });
      return "App running.";
    },
  },
  {
    name: "project_status",
    description: "Show project version, config, platform info, and backup count. Use for a quick project overview.",
    schema: z.object({}),
    handler: async () => captureOutput(() => showStatus()),
  },
  {
    name: "doctor",
    description: "Check development environment health: Flutter SDK, FVM, CocoaPods, Xcode CLI tools, project structure. Use to diagnose setup issues or before starting work.",
    schema: z.object({}),
    handler: async () => captureOutput(() => runDoctor()),
  },

  // ── Config ──
  {
    name: "init",
    description: "Initialize OptiKit configuration (.optikitrc.json) in the current project. Use when setting up OptiKit for the first time.",
    schema: z.object({}),
    handler: async () => { await initializeProject(); return "OptiKit initialized."; },
  },
  {
    name: "init_app",
    description: "Scaffold Opticore app structure (main.dart, config, router). Use when creating a new Opticore app from scratch.",
    schema: z.object({
      appName: z.string().optional().describe("App name for CoreSetup configuration"),
    }),
    handler: async (args) => {
      await initOpticoreApp(args.appName as string ?? "MyApp");
      return "Opticore app scaffolded.";
    },
  },
  {
    name: "rollback_list",
    description: "List available OptiKit backups with timestamps. Use before restoring to see what backups exist.",
    schema: z.object({
      before: z.string().optional().describe("Filter backups before date (YYYY-MM-DD)"),
    }),
    handler: async (args) => captureOutput(() => rollbackFiles(args.before as string | undefined)),
  },
  {
    name: "rollback_restore",
    description: "Restore files from a specific OptiKit backup by index. Use to undo a version bump or other file modification.",
    schema: z.object({
      index: z.number().describe("Backup index number to restore"),
    }),
    handler: async (args) => {
      await rollbackRestore(args.index as number);
      return "Backup restored.";
    },
  },
  {
    name: "setup_vscode",
    description: "Create .vscode/settings.json with Flutter/Dart settings including FVM SDK path and format-on-save.",
    schema: z.object({}),
    handler: async () => { await createVscodeSettings(); return "VS Code settings created."; },
  },
  {
    name: "check_upgrade",
    description: "Check if a newer version of OptiKit CLI is available on npm.",
    schema: z.object({}),
    handler: async () => captureOutput(() => checkUpgrade()),
  },
];
