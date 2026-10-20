import chalk from "chalk";
import { execCommandSilent } from "../../utils/services/exec.js";
import { LoggerHelpers } from "../../utils/services/logger.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export { checkUpgrade };

async function checkUpgrade(): Promise<void> {
  try {
    const packageInfo: { version: string } = require("../../../package.json");
    const currentVersion = packageInfo.version;

    LoggerHelpers.info("Checking for updates...");

    let latestVersion: string;
    try {
      const output = await execCommandSilent("npm view optikit version");
      latestVersion = output.trim();
    } catch {
      LoggerHelpers.warning("Could not check npm registry. Are you online?");
      console.log(chalk.cyan("\n  Current:"), chalk.white(currentVersion));
      return;
    }

    console.log(chalk.bold("\nOptiKit Version Check\n"));
    console.log(chalk.cyan("  Current:"), chalk.white(currentVersion));
    console.log(chalk.cyan("  Latest: "), chalk.white(latestVersion));

    if (currentVersion === latestVersion) {
      console.log(chalk.green("\n  You're up to date!\n"));
    } else {
      console.log(chalk.yellow(`\n  Update available: ${currentVersion} → ${latestVersion}`));
      console.log(chalk.white("  Run:"), chalk.cyan("npm install -g optikit\n"));
    }
  } catch (error) {
    LoggerHelpers.error(`Error checking for updates: ${error instanceof Error ? error.message : error}`);
  }
}
