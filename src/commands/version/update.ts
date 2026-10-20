import fs from "fs";
import path from "path";
import { LoggerHelpers } from "../../utils/services/logger.js";
import { validateFlutterProject } from "../../utils/validators/validation.js";
import { createBackupWithCleanup } from "../../utils/services/backup.js";
import { handleCommandError } from "../../utils/helpers/error.js";
import { isDryRunMode, DryRunManager } from "../../utils/helpers/dryRun.js";
import { PROJECT_PATHS } from "../../constants.js";

const currentDir = process.cwd();

export { updateFlutterVersion };

async function updateFlutterVersion(
  version: string,
  build: string,
  iosBuild: string
) {
  if (!validateFlutterProject()) {
    process.exit(1);
  }

  try {
    LoggerHelpers.info(`Starting update for version ${version}...`);

    // Single dry-run manager for all operations
    const dryRun = isDryRunMode() ? new DryRunManager() : null;

    if (build.trim().length > 0) {
      LoggerHelpers.info("Updating build number in pubspec.yaml...");
      await updatePubspecVersionAndBuild(version, build, dryRun);
    } else {
      LoggerHelpers.info("Android build number not provided. Skipping pubspec.yaml update.");
    }

    if (iosBuild.trim().length > 0) {
      LoggerHelpers.info("Updating iOS version and build number...");
      await updateIosVersionAndBuild(version, iosBuild, dryRun);
    } else {
      LoggerHelpers.info("iOS build number not provided. Skipping iOS update.");
    }

    // Show dry-run summary once at the end
    if (dryRun) {
      dryRun.displaySummary();
      return;
    }

    LoggerHelpers.success(
      `Update complete. Version set to ${version}` +
      (build.trim().length > 0 ? `, Android build set to ${build}` : "") +
      (iosBuild.trim().length > 0 ? `, and iOS build set to ${iosBuild}` : "")
    );
  } catch (error: unknown) {
    handleCommandError(error, "Error while updating Flutter version and build");
  }
}

async function updatePubspecVersionAndBuild(
  version: string,
  build: string,
  dryRun: DryRunManager | null
) {
  try {
    const pubspecPath = path.join(currentDir, PROJECT_PATHS.PUBSPEC);

    if (!fs.existsSync(pubspecPath)) {
      throw new Error(`pubspec.yaml not found at ${pubspecPath}`);
    }

    if (dryRun) {
      dryRun.logFileOperation("Update pubspec.yaml", pubspecPath, `version: ${version}+${build}`);
      return;
    }

    createBackupWithCleanup(pubspecPath);

    const pubspecContent = fs.readFileSync(pubspecPath, "utf8");
    const updatedPubspec = pubspecContent.replace(
      /version: \d+\.\d+\.\d+\+\d+/g,
      `version: ${version}+${build}`
    );

    fs.writeFileSync(pubspecPath, updatedPubspec);
    LoggerHelpers.success(
      `Updated pubspec.yaml with version ${version} and build ${build}`
    );
  } catch (error) {
    LoggerHelpers.error(
      `Error while updating pubspec.yaml: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

async function updateIosVersionAndBuild(
  version: string,
  iosBuild: string,
  dryRun: DryRunManager | null
) {
  try {
    const projectPbxProjPath = path.join(currentDir, PROJECT_PATHS.IOS_PROJECT_PBXPROJ);
    const infoPlistPath = path.join(currentDir, PROJECT_PATHS.IOS_INFO_PLIST);

    if (!fs.existsSync(projectPbxProjPath)) {
      throw new Error(`project.pbxproj not found at ${projectPbxProjPath}`);
    }

    if (dryRun) {
      dryRun.logFileOperation("Update project.pbxproj", projectPbxProjPath, `MARKETING_VERSION = ${version}, CURRENT_PROJECT_VERSION = ${iosBuild}`);
      dryRun.logFileOperation("Update Info.plist", infoPlistPath, `CFBundleShortVersionString = ${version}, CFBundleVersion = ${iosBuild}`);
      return;
    }

    // Update project.pbxproj
    createBackupWithCleanup(projectPbxProjPath);

    let projectContent = fs.readFileSync(projectPbxProjPath, 'utf8');
    projectContent = projectContent
      .replace(
        /MARKETING_VERSION\s*=\s*[^;]+;/g,
        `MARKETING_VERSION = ${version};`
      )
      .replace(
        /CURRENT_PROJECT_VERSION\s*=\s*[^;]+;/g,
        `CURRENT_PROJECT_VERSION = ${iosBuild};`
      );

    fs.writeFileSync(projectPbxProjPath, projectContent);
    LoggerHelpers.success(`Updated MARKETING_VERSION to ${version} and CURRENT_PROJECT_VERSION to ${iosBuild}`);

    // Update Info.plist
    if (!fs.existsSync(infoPlistPath)) {
      throw new Error(`Info.plist not found at ${infoPlistPath}`);
    }

    createBackupWithCleanup(infoPlistPath);

    const infoPlistContent = fs.readFileSync(infoPlistPath, "utf8");
    const updatedPlist = infoPlistContent
      .replace(
        /<key>CFBundleShortVersionString<\/key>\s*<string>[^<]+<\/string>/,
        `<key>CFBundleShortVersionString</key>\n\t<string>${version}</string>`
      )
      .replace(
        /<key>CFBundleVersion<\/key>\s*<string>[^<]+<\/string>/,
        `<key>CFBundleVersion</key>\n\t<string>${iosBuild}</string>`
      );

    fs.writeFileSync(infoPlistPath, updatedPlist);
    LoggerHelpers.success("Updated Info.plist with the new version and iOS build.");
  } catch (error) {
    LoggerHelpers.error(
      `Error while updating iOS version and build: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}
