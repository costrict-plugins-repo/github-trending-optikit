import fs from "fs";
import path from "path";
import { execCommand } from "../../utils/services/exec.js";
import { LoggerHelpers } from "../../utils/services/logger.js";
import { validateFlutterProject, validateFlutterSdk } from "../../utils/validators/validation.js";
import { createBackupWithCleanup } from "../../utils/services/backup.js";
import { handleCommandError } from "../../utils/helpers/error.js";
import { getFlutterCommand } from "../../utils/services/command.js";

export { cleanProject };

async function cleanProject(noFvm: boolean) {
  LoggerHelpers.info(
    noFvm ? "Running clean without FVM..." : "Running clean with FVM..."
  );

  // Pre-flight validation
  if (!validateFlutterProject()) {
    process.exit(1);
  }

  if (!(await validateFlutterSdk(!noFvm))) {
    process.exit(1);
  }

  try {
    const useFvm = !noFvm;

    // Step 1: Run flutter clean
    LoggerHelpers.info("Running Flutter clean...");
    await execCommand(getFlutterCommand("flutter clean", useFvm));
    LoggerHelpers.success("Flutter clean completed.");

    // Step 2: Remove pubspec.lock using Node.js fs (cross-platform)
    const pubspecLockPath = path.join(process.cwd(), "pubspec.lock");
    if (fs.existsSync(pubspecLockPath)) {
      LoggerHelpers.info("Removing pubspec.lock...");
      createBackupWithCleanup(pubspecLockPath);
      fs.unlinkSync(pubspecLockPath);
      LoggerHelpers.success("pubspec.lock removed.");
    } else {
      LoggerHelpers.info("pubspec.lock does not exist, skipping removal.");
    }

    // Step 3: Run flutter pub get
    LoggerHelpers.info("Running Flutter pub get...");
    await execCommand(getFlutterCommand("flutter pub get", useFvm));
    LoggerHelpers.success("Flutter pub get completed.");

    LoggerHelpers.success("Project cleaned successfully.");
  } catch (error) {
    handleCommandError(error, "Error during clean");
  }
}
