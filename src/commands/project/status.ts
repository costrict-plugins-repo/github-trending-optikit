import fs from "fs";
import path from "path";
import chalk from "chalk";
import { getCurrentVersion, formatVersion, getCurrentIosBuildNumber } from "../../utils/helpers/version.js";
import { getConfigPath } from "../../utils/services/config.js";
import { validateFlutterProject } from "../../utils/validators/validation.js";
import { PROJECT_PATHS, BACKUP_CONFIG } from "../../constants.js";

export { showStatus };

async function showStatus(): Promise<void> {
  console.log(chalk.bold("\nOptiKit Status"));
  console.log(chalk.gray("─".repeat(45)));

  // Version info
  if (validateFlutterProject(true)) {
    try {
      const current = getCurrentVersion();
      const iosBuild = getCurrentIosBuildNumber();
      console.log(chalk.cyan("\n  Version:"), chalk.white.bold(formatVersion(current)));
      console.log(chalk.gray("    Android Build:"), chalk.white(current.buildNumber));
      console.log(chalk.gray("    iOS Build:"), chalk.white(iosBuild));
    } catch {
      console.log(chalk.yellow("\n  Version:"), chalk.gray("Unable to read"));
    }
  } else {
    console.log(chalk.yellow("\n  Version:"), chalk.gray("Not a Flutter project"));
  }

  // FVM status
  const fvmPath = path.join(process.cwd(), PROJECT_PATHS.FVM_FLUTTER_SDK);
  const useFvm = fs.existsSync(fvmPath);
  console.log(chalk.cyan("  Flutter:"), chalk.white(useFvm ? "FVM" : "Global SDK"));

  // Backup count
  const backupCount = countBackups(process.cwd());
  console.log(chalk.cyan("  Backups:"), chalk.white(backupCount > 0 ? `${backupCount} file(s)` : "None"));

  // Config
  const configPath = getConfigPath();
  console.log(chalk.cyan("  Config:"), chalk.white(configPath ?? "Not initialized (run: optikit init)"));

  // Project structure
  const hasIos = fs.existsSync(path.join(process.cwd(), PROJECT_PATHS.IOS_DIR));
  const hasAndroid = fs.existsSync(path.join(process.cwd(), PROJECT_PATHS.ANDROID_DIR));
  const platforms = [hasIos ? "iOS" : null, hasAndroid ? "Android" : null].filter(Boolean).join(", ");
  console.log(chalk.cyan("  Platforms:"), chalk.white(platforms || "None detected"));

  console.log(chalk.gray("\n" + "─".repeat(45) + "\n"));
}

function countBackups(dir: string): number {
  let count = 0;

  function search(currentDir: string): void {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (entry.name === BACKUP_CONFIG.DIR_NAME) {
            count += fs.readdirSync(path.join(currentDir, entry.name)).length;
          } else if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
            search(path.join(currentDir, entry.name));
          }
        }
      }
    } catch { /* skip inaccessible dirs */ }
  }

  search(dir);
  return count;
}
