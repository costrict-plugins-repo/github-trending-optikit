import fs from "fs";
import path from "path";
import { LoggerHelpers } from "../../utils/services/logger.js";
import { validateFlutterProject } from "../../utils/validators/validation.js";
import { handleCommandError } from "../../utils/helpers/error.js";
import { VSCODE_SETTINGS_TEMPLATE, PROJECT_PATHS } from "../../constants.js";

export {
  createVscodeSettings,
};

async function createVscodeSettings() {
  if (!validateFlutterProject()) {
    process.exit(1);
  }

  try {
    const vscodeDir = path.join(process.cwd(), PROJECT_PATHS.VSCODE_DIR);
    const settingsPath = path.join(process.cwd(), PROJECT_PATHS.VSCODE_SETTINGS);

    if (!fs.existsSync(vscodeDir)) {
      fs.mkdirSync(vscodeDir, { recursive: true });
      LoggerHelpers.success("Created .vscode directory.");
    } else {
      LoggerHelpers.info(".vscode directory already exists.");
    }

    fs.writeFileSync(settingsPath, JSON.stringify(VSCODE_SETTINGS_TEMPLATE, null, 2), "utf8");
    LoggerHelpers.success("Created .vscode/settings.json with Flutter configuration.");
  } catch (error) {
    handleCommandError(error, "Error creating VSCode settings");
  }
}
