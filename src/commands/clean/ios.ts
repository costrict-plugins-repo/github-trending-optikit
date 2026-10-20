import * as fs from "fs";
import * as path from "path";
import { LoggerHelpers } from "../../utils/services/logger.js";
import { execInIos, execCommand, iosDirectory, execInIosWithRetry } from "../../utils/services/exec.js";
import { validateFlutterProject, validateIosProject } from "../../utils/validators/validation.js";
import { FLUTTER_COMMANDS, FVM_COMMANDS, RETRY_CONFIG } from "../../constants.js";
import { handleCommandError } from "../../utils/helpers/error.js";

export { cleanIosProject };

async function getFlutterSdkPath(): Promise<string> {
  const fvmDir = path.join(process.cwd(), ".fvm", "flutter_sdk");

  if (fs.existsSync(fvmDir)) {
    LoggerHelpers.info(`Using FVM Flutter SDK...`);
    return fvmDir;
  }

  const command = "which flutter";
  try {
    const globalFlutterPath = await execCommand(command);
    LoggerHelpers.info("Using Flutter SDK...");
    return path.dirname(globalFlutterPath.trim());
  } catch (error) {
    LoggerHelpers.error(
      "Flutter SDK not found. Please ensure Flutter is installed."
    );
    throw error; 
  }
}

async function getFlutterXcframeworkPath(): Promise<string> {
  const flutterSdkPath = await getFlutterSdkPath();
  return path.join(
    flutterSdkPath,
    "bin/cache/artifacts/engine/ios/Flutter.xcframework"
  );
}

async function ensureFlutterArtifactsExist() {
  const flutterXcframeworkPath = await getFlutterXcframeworkPath();

  if (!fs.existsSync(flutterXcframeworkPath)) {
    LoggerHelpers.warning("Flutter.xcframework not found.");

    const useFvm = fs.existsSync(path.join(process.cwd(), ".fvm", "flutter_sdk"));
    const precacheCommand = useFvm
      ? FVM_COMMANDS.PRECACHE_IOS
      : FLUTTER_COMMANDS.PRECACHE_IOS;

    try {
      LoggerHelpers.info("Downloading Flutter.xcframework...");
      await execCommand(precacheCommand);
      LoggerHelpers.success(
        "Flutter.xcframework has been downloaded successfully."
      );
    } catch (error) {
      LoggerHelpers.error(
        `Failed to run precache: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  } else {
    LoggerHelpers.success(
      "Flutter.xcframework exists. No need to run precache."
    );
  }
}

async function cleanIosProject(cleanCache: boolean, repoUpdate: boolean) {
  // Pre-flight validation
  if (!validateFlutterProject()) {
    process.exit(1);
  }

  if (!validateIosProject()) {
    process.exit(1);
  }

  try {
    LoggerHelpers.info("Running clean for iOS project...");

    await ensureFlutterArtifactsExist();

    LoggerHelpers.info("Removing Podfile.lock...");
    const podfileLockPath = path.join(iosDirectory, "Podfile.lock");
    if (fs.existsSync(podfileLockPath)) {
      fs.unlinkSync(podfileLockPath);
      LoggerHelpers.success("Removed Podfile.lock.");
    } else {
      LoggerHelpers.info("Podfile.lock does not exist, skipping removal.");
    }

    LoggerHelpers.info("Deintegrating pods...");
    await execInIos("pod deintegrate");
    LoggerHelpers.success("Deintegrated pods.");

    if (cleanCache) {
      LoggerHelpers.info("Cleaning CocoaPods cache...");
      await execInIos("pod cache clean --all");
      LoggerHelpers.success("Cleaned CocoaPods cache.");
    }

    if (repoUpdate) {
      LoggerHelpers.info("Updating CocoaPods repositories...");
      try {
        await execInIosWithRetry("pod repo update", RETRY_CONFIG.DEFAULT_ATTEMPTS, RETRY_CONFIG.DEFAULT_DELAY_MS);
        LoggerHelpers.success("Updated CocoaPods repositories.");
      } catch (error) {
        LoggerHelpers.error("Failed to update CocoaPods repositories. Retrying...");
      }

      LoggerHelpers.info("Installing pods with repo update...");
      try {
        await execInIosWithRetry("pod update", RETRY_CONFIG.DEFAULT_ATTEMPTS, RETRY_CONFIG.DEFAULT_DELAY_MS);
        LoggerHelpers.success("Installed pods with repo update.");
      } catch (error) {
        LoggerHelpers.error("Failed to update pods. Retrying...");
      }
    } else {
      LoggerHelpers.info("Installing pods without repo update...");
      await execInIosWithRetry("pod install", RETRY_CONFIG.DEFAULT_ATTEMPTS, RETRY_CONFIG.DEFAULT_DELAY_MS);
      LoggerHelpers.success("Installed pods without repo update.");
    }
  } catch (error) {
    handleCommandError(error, "Error cleaning iOS project");
  }
}
