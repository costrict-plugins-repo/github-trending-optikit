import { createInterface } from "readline";
import { validateFlutterProject } from "../../utils/validators/validation.js";
import { LoggerHelpers } from "../../utils/services/logger.js";
import {
  getCurrentVersion,
  incrementVersion,
  formatVersion,
  getNextBuildNumber,
  getCurrentIosBuildNumber,
  getCurrentIosMarketingVersion
} from "../../utils/helpers/version.js";
import { handleCommandError } from "../../utils/helpers/error.js";
import { updateFlutterVersion } from "./update.js";
import chalk from "chalk";

export {
  bumpVersion,
  bumpIosBuildOnly,
  bumpAndroidBuildOnly,
  bumpBothBuilds,
  showCurrentVersion
};

/**
 * Prompts user for confirmation. Returns true if confirmed.
 * Skips prompt and returns true if skipConfirm is true (--yes flag).
 */
function confirmAction(message: string, skipConfirm: boolean): Promise<boolean> {
  if (skipConfirm) return Promise.resolve(true);

  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(chalk.yellow(`${message} (y/n): `), (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

/**
 * Shows a colored diff preview of what will change.
 */
function showDiffPreview(
  oldVersion: string,
  newVersion: string,
  oldAndroidBuild: number,
  newAndroidBuild: number | string,
  oldIosBuild: number,
  newIosBuild: number | string
) {
  console.log(chalk.cyan("\nFile changes preview:"));

  if (newAndroidBuild !== "") {
    console.log(chalk.gray("\n  pubspec.yaml:"));
    console.log(chalk.red(`    - version: ${oldVersion}+${oldAndroidBuild}`));
    console.log(chalk.green(`    + version: ${newVersion}+${newAndroidBuild}`));
  }

  if (newIosBuild !== "") {
    console.log(chalk.gray("\n  project.pbxproj:"));
    console.log(chalk.red(`    - MARKETING_VERSION = ${oldVersion};`));
    console.log(chalk.green(`    + MARKETING_VERSION = ${newVersion};`));
    console.log(chalk.red(`    - CURRENT_PROJECT_VERSION = ${oldIosBuild};`));
    console.log(chalk.green(`    + CURRENT_PROJECT_VERSION = ${newIosBuild};`));
  }

  console.log();
}

async function bumpVersion(
  type: 'major' | 'minor' | 'patch',
  skipConfirm: boolean = false
): Promise<void> {
  if (!validateFlutterProject()) {
    process.exit(1);
  }

  try {
    const current = getCurrentVersion();
    const currentIosBuild = getCurrentIosBuildNumber();
    const newVersion = incrementVersion(current, type);
    const currentVersionString = `${current.major}.${current.minor}.${current.patch}`;
    const newVersionString = `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`;

    LoggerHelpers.info(`Current version: ${formatVersion(current)}`);
    LoggerHelpers.info(`Bumping ${type} version...`);

    console.log(chalk.cyan("\nVersion changes:"));
    console.log(chalk.gray("  Old:"), chalk.white(formatVersion(current)));
    console.log(chalk.gray("  New:"), chalk.green.bold(formatVersion(newVersion)));

    console.log(chalk.cyan("\nBuild number strategy:"));
    console.log(chalk.gray("  Android:"), chalk.white(`${current.buildNumber} → ${newVersion.buildNumber} (incremented)`));
    console.log(chalk.gray("  iOS:"), chalk.white(`${currentIosBuild} → 1 (reset for new version)`));

    showDiffPreview(currentVersionString, newVersionString, current.buildNumber, newVersion.buildNumber, currentIosBuild, 1);

    const confirmed = await confirmAction("Proceed with version bump?", skipConfirm);
    if (!confirmed) {
      LoggerHelpers.info("Bump cancelled.");
      return;
    }

    await updateFlutterVersion(
      newVersionString,
      newVersion.buildNumber.toString(),
      "1"
    );

    LoggerHelpers.success(`Version bumped to ${formatVersion(newVersion)}`);
    console.log(chalk.gray("\nAndroid build:"), chalk.white(newVersion.buildNumber));
    console.log(chalk.gray("iOS build:"), chalk.white("1"));

  } catch (error) {
    handleCommandError(error, "Error bumping version");
  }
}

async function bumpIosBuildOnly(skipConfirm: boolean = false): Promise<void> {
  if (!validateFlutterProject()) {
    process.exit(1);
  }

  try {
    const current = getCurrentVersion();
    const iosVersionString = getCurrentIosMarketingVersion();
    const currentIosBuild = getCurrentIosBuildNumber();
    const nextIosBuild = currentIosBuild + 1;

    LoggerHelpers.info(`Current iOS version: ${iosVersionString} (build ${currentIosBuild})`);
    LoggerHelpers.info("Incrementing iOS build number only (for TestFlight)...");

    console.log(chalk.cyan("\nBuild number changes:"));
    console.log(chalk.gray("  Version:"), chalk.white(`${iosVersionString} (unchanged)`));
    console.log(chalk.gray("  Android:"), chalk.white(`${current.buildNumber} (unchanged)`));
    console.log(chalk.gray("  iOS:"), chalk.white(`${currentIosBuild} → ${nextIosBuild}`), chalk.green("(incremented)"));

    showDiffPreview(iosVersionString, iosVersionString, current.buildNumber, "", currentIosBuild, nextIosBuild);

    const confirmed = await confirmAction("Proceed?", skipConfirm);
    if (!confirmed) {
      LoggerHelpers.info("Bump cancelled.");
      return;
    }

    await updateFlutterVersion(iosVersionString, "", nextIosBuild.toString());

    LoggerHelpers.success(`iOS build number incremented to ${nextIosBuild}`);

  } catch (error) {
    handleCommandError(error, "Error incrementing iOS build");
  }
}

async function bumpAndroidBuildOnly(skipConfirm: boolean = false): Promise<void> {
  if (!validateFlutterProject()) {
    process.exit(1);
  }

  try {
    const current = getCurrentVersion();
    const currentVersionString = `${current.major}.${current.minor}.${current.patch}`;
    const currentIosBuild = getCurrentIosBuildNumber();
    const nextAndroidBuild = current.buildNumber + 1;

    LoggerHelpers.info(`Current version: ${formatVersion(current)}`);
    LoggerHelpers.info("Incrementing Android build number only...");

    console.log(chalk.cyan("\nBuild number changes:"));
    console.log(chalk.gray("  Version:"), chalk.white(`${currentVersionString} (unchanged)`));
    console.log(chalk.gray("  Android:"), chalk.white(`${current.buildNumber} → ${nextAndroidBuild}`), chalk.green("(incremented)"));
    console.log(chalk.gray("  iOS:"), chalk.white("(unchanged)"));

    showDiffPreview(currentVersionString, currentVersionString, current.buildNumber, nextAndroidBuild, currentIosBuild, "");

    const confirmed = await confirmAction("Proceed?", skipConfirm);
    if (!confirmed) {
      LoggerHelpers.info("Bump cancelled.");
      return;
    }

    await updateFlutterVersion(currentVersionString, nextAndroidBuild.toString(), "");

    LoggerHelpers.success(`Android build number incremented to ${nextAndroidBuild}`);

  } catch (error) {
    handleCommandError(error, "Error incrementing Android build");
  }
}

async function bumpBothBuilds(skipConfirm: boolean = false): Promise<void> {
  if (!validateFlutterProject()) {
    process.exit(1);
  }

  try {
    const current = getCurrentVersion();
    const currentVersionString = `${current.major}.${current.minor}.${current.patch}`;
    const currentIosBuild = getCurrentIosBuildNumber();
    const nextAndroidBuild = current.buildNumber + 1;
    const nextIosBuild = currentIosBuild + 1;

    LoggerHelpers.info(`Current version: ${formatVersion(current)}`);
    LoggerHelpers.info("Incrementing both Android and iOS build numbers...");

    console.log(chalk.cyan("\nBuild number changes:"));
    console.log(chalk.gray("  Version:"), chalk.white(`${currentVersionString} (unchanged)`));
    console.log(chalk.gray("  Android:"), chalk.white(`${current.buildNumber} → ${nextAndroidBuild}`), chalk.green("(incremented)"));
    console.log(chalk.gray("  iOS:"), chalk.white(`${currentIosBuild} → ${nextIosBuild}`), chalk.green("(incremented)"));

    showDiffPreview(currentVersionString, currentVersionString, current.buildNumber, nextAndroidBuild, currentIosBuild, nextIosBuild);

    const confirmed = await confirmAction("Proceed?", skipConfirm);
    if (!confirmed) {
      LoggerHelpers.info("Bump cancelled.");
      return;
    }

    await updateFlutterVersion(currentVersionString, nextAndroidBuild.toString(), nextIosBuild.toString());

    LoggerHelpers.success(`Both build numbers incremented successfully`);

  } catch (error) {
    handleCommandError(error, "Error incrementing build numbers");
  }
}

async function showCurrentVersion(): Promise<void> {
  try {
    const current = getCurrentVersion();
    const versionString = formatVersion(current);
    const currentIosBuild = getCurrentIosBuildNumber();

    console.log(chalk.bold("\n📱 Current Version Information\n"));
    console.log(chalk.cyan("Version:"), chalk.white.bold(versionString));
    console.log(chalk.gray("  Major:"), chalk.white(current.major));
    console.log(chalk.gray("  Minor:"), chalk.white(current.minor));
    console.log(chalk.gray("  Patch:"), chalk.white(current.patch));
    console.log(chalk.gray("  Android Build:"), chalk.white(current.buildNumber));
    console.log(chalk.gray("  iOS Build:"), chalk.white(currentIosBuild));
    console.log();

  } catch (error) {
    handleCommandError(error, "Error reading version");
  }
}
