import fs from "fs";
import path from "path";
import chalk from "chalk";
import {
  createDirectories,
  writeFile,
  getClassName,
} from "../../utils/helpers/file.js";
import { LoggerHelpers } from "../../utils/services/logger.js";
import { handleCommandError } from "../../utils/helpers/error.js";
import { ERROR_MESSAGES, MODULE_STRUCTURE } from "../../constants.js";

export { generateModule, generateRepoModule, addRoute };

function generateModule(moduleName: string) {
  // Validate module name
  if (!moduleName || moduleName.trim().length === 0) {
    LoggerHelpers.error(ERROR_MESSAGES.MODULE_NAME_EMPTY);
    process.exit(1);
  }

  if (!MODULE_STRUCTURE.NAME_PATTERN.test(moduleName)) {
    LoggerHelpers.error(ERROR_MESSAGES.MODULE_NAME_INVALID);
    process.exit(1);
  }

  const modulePath = path.join("lib", "module", moduleName);
  const isNew = !fs.existsSync(modulePath);

  try {
    const directories = [...MODULE_STRUCTURE.DIRECTORIES];

    if (!isNew) {
      LoggerHelpers.warning(`Module ${moduleName} already exists at ${modulePath}`);
      LoggerHelpers.info("Files will be overwritten...");
    }

    createDirectories(modulePath, directories);

    LoggerHelpers.info(`Creating module structure for ${moduleName}...`);

    generateBloc(moduleName, path.join(modulePath, "bloc"));
    generateEvent(moduleName, path.join(modulePath, "event"));
    generateState(moduleName, path.join(modulePath, "state"));
    generateScreen(moduleName, path.join(modulePath, "screen"));
    generateImport(moduleName, path.join(modulePath, "import"));
    generateStateFactory(moduleName, path.join(modulePath, "factory"));

    LoggerHelpers.success(`Module ${moduleName} created with full structure.`);
  } catch (error) {
    // Clean up only if we created a new module directory
    if (isNew) {
      if (fs.existsSync(modulePath)) {
        try {
          fs.rmSync(modulePath, { recursive: true });
          LoggerHelpers.warning("Cleaned up partial module files.");
        } catch { /* ignore cleanup errors */ }
      }
    }
    handleCommandError(error, "Error generating module");
  }
}

function generateBloc(moduleName: string, blocPath: string) {
  const blocFilePath = path.join(blocPath, `${moduleName}_bloc.dart`);
  const className = getClassName(moduleName);

  const template = `part of '../import/${moduleName}_import.dart';

class ${className}Bloc extends BaseBloc {
    ${className}Bloc() : super(
    ${className}Factory(),
    initialState: ${className}InitialState(),
    ) {
      on<${className}InitialEvent>(_onInitialEvent);
    }

    Future<void> _onInitialEvent(
      ${className}InitialEvent event,
      Emitter<BaseState> emit,
    ) async {
      // Handle initial event
    }

    @override
    void onDispose() {}
}
  `;

  writeFile(blocFilePath, template);
  LoggerHelpers.success(
    `Bloc file ${moduleName}_bloc.dart created in ${blocPath}`
  );
}

function generateEvent(moduleName: string, eventPath: string) {
  const eventFilePath = path.join(eventPath, `${moduleName}_event.dart`);
  const className = getClassName(moduleName);

  const template = `part of '../import/${moduleName}_import.dart';

class ${className}InitialEvent extends BaseEvent {}
  `;

  writeFile(eventFilePath, template);
  LoggerHelpers.success(
    `Event file ${moduleName}_event.dart created in ${eventPath}`
  );
}

function generateState(moduleName: string, statePath: string) {
  const stateFilePath = path.join(statePath, `${moduleName}_state.dart`);
  const className = getClassName(moduleName);

  const template = `part of '../import/${moduleName}_import.dart';

class ${className}InitialState extends RenderDataState {
  ${className}InitialState() : super(null);
}
  `;

  writeFile(stateFilePath, template);
  LoggerHelpers.success(
    `State file ${moduleName}_state.dart created in ${statePath}`
  );
}

function generateScreen(moduleName: string, screenPath: string) {
  const screenFilePath = path.join(screenPath, `${moduleName}_screen.dart`);
  const className = getClassName(moduleName);

  const template = `part of '../import/${moduleName}_import.dart';

class ${className}Screen extends StatefulWidget {
  final ${className}Bloc bloc;
  const ${className}Screen({super.key, required this.bloc});

  @override
  _${className}ScreenState createState() => _${className}ScreenState(bloc);
}

class _${className}ScreenState extends BaseScreen<${className}Bloc, ${className}Screen, dynamic> {
  _${className}ScreenState(super.bloc);

  @override
  Widget buildWidget(BuildContext context, RenderDataState state) {
    return Container();
  }
  
  @override
  void listenToState(BuildContext context, BaseState state) {}
}
  `;

  writeFile(screenFilePath, template);
  LoggerHelpers.success(
    `Screen file ${moduleName}_screen.dart created in ${screenPath}`
  );
}

function generateImport(moduleName: string, importPath: string) {
  const importFilePath = path.join(importPath, `${moduleName}_import.dart`);
  const className = getClassName(moduleName);

  const template = `import 'package:flutter/material.dart';
import 'package:opticore/opticore.dart';

part '../bloc/${moduleName}_bloc.dart';
part '../event/${moduleName}_event.dart';
part '../screen/${moduleName}_screen.dart';
part '../state/${moduleName}_state.dart';
part '../factory/${moduleName}_factory.dart';
  `;

  writeFile(importFilePath, template);
  LoggerHelpers.success(
    `Import file ${moduleName}_import.dart created in ${importPath}`
  );
}

function generateStateFactory(moduleName: string, factoryPath: string) {
  const factoryFilePath = path.join(
    factoryPath,
    `${moduleName}_factory.dart`
  );
  const className = getClassName(moduleName);

  const template = `part of '../import/${moduleName}_import.dart';

class ${className}Factory extends BaseFactory {
  @override
  BaseState getState<M>(M data) {
    return DefaultState();
  }
}
  `;

  writeFile(factoryFilePath, template);
  LoggerHelpers.success(
    `State Factory file ${moduleName}_factory.dart created in ${factoryPath}`
  );
}

function generateRepo(moduleName: string, repoPath: string) {
  const repoFilePath = path.join(repoPath, `${moduleName}_repo.dart`);
  const className = getClassName(moduleName);

  const template = `import 'package:opticore/opticore.dart';

class ${className}Repo extends BaseRepo {

  Future<ApiResponse<Map<String, dynamic>?>> fetchData() async {
    return await networkHelper.request<Map<String, dynamic>>(
      '/${moduleName.replace(/_/g, '-')}',
      (json) => json ?? {},
    );
  }
}
`;

  writeFile(repoFilePath, template);
  LoggerHelpers.success(
    `Repo file ${moduleName}_repo.dart created in ${repoPath}`
  );
}

/**
 * Builds the list of selectable items for the directory picker.
 */
interface PickerItem {
  label: string;
  icon: string;
  action: "select" | "back" | "open" | "create";
  dirName?: string;
}

function buildPickerItems(currentPath: string, rootPath: string): PickerItem[] {
  const items: PickerItem[] = [];

  // "Select here" always first
  items.push({ label: "Select this directory", icon: "✔", action: "select" });

  // Go back (unless at root)
  const canGoBack = currentPath !== rootPath && currentPath !== ".";
  if (canGoBack) {
    items.push({ label: "..", icon: "↩", action: "back" });
  }

  // Subdirectories
  if (fs.existsSync(currentPath)) {
    const dirs = fs.readdirSync(currentPath, { withFileTypes: true })
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => e.name)
      .sort();
    for (const dir of dirs) {
      items.push({ label: `${dir}/`, icon: "📁", action: "open", dirName: dir });
    }
  }

  // Create new folder always last
  items.push({ label: "Create new folder", icon: "✚", action: "create" });

  return items;
}

/**
 * Interactive arrow-key directory picker.
 * Navigate with arrow keys, enter to select/open, esc to cancel.
 */
function pickDirectory(startPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let currentPath = startPath;
    const rootPath = startPath;
    let cursor = 0;
    let items = buildPickerItems(currentPath, rootPath);
    let totalLines = 0;
    let creatingFolder = false;
    let folderInput = "";

    const stdin = process.stdin;
    const wasRaw = stdin.isRaw ?? false;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    function render() {
      // Clear previous output
      if (totalLines > 0) {
        process.stdout.write(`\x1B[${totalLines}A`);
        process.stdout.write("\x1B[0J");
      }

      const lines: string[] = [];

      // Header — current path with breadcrumb
      lines.push("");
      lines.push(chalk.cyan.bold(`  📂 ${currentPath}/`));
      lines.push(chalk.gray("  ─────────────────────────────────────"));

      // Menu items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const isActive = i === cursor;

        if (isActive) {
          const pointer = chalk.cyan.bold("❯");
          const icon = item.action === "select" ? chalk.green(item.icon) :
                       item.action === "back" ? chalk.yellow(item.icon) :
                       item.action === "create" ? chalk.magenta(item.icon) :
                       chalk.blue(item.icon);
          lines.push(`  ${pointer} ${icon}  ${chalk.white.bold(item.label)}`);
        } else {
          const icon = chalk.gray(item.icon);
          lines.push(`    ${icon}  ${chalk.gray(item.label)}`);
        }
      }

      lines.push(chalk.gray("  ─────────────────────────────────────"));

      if (creatingFolder) {
        lines.push(chalk.magenta(`  ✚ New folder name: `) + chalk.white.bold(folderInput) + chalk.gray("▌"));
      } else {
        lines.push(chalk.gray("  ↑↓ navigate  ⏎ select/open  ← back  esc cancel"));
      }

      const output = lines.join("\n") + "\n";
      process.stdout.write(output);
      totalLines = lines.length;
    }

    function cleanup() {
      stdin.setRawMode(wasRaw);
      stdin.removeListener("data", onKeypress);
      stdin.pause();
    }

    function refreshItems() {
      items = buildPickerItems(currentPath, rootPath);
      cursor = 0;
    }

    function onKeypress(key: string) {
      // Handle folder creation mode
      if (creatingFolder) {
        if (key === "\r") {
          // Enter — create the folder
          const trimmed = folderInput.trim();
          if (trimmed.length > 0) {
            const newPath = path.join(currentPath, trimmed);
            fs.mkdirSync(newPath, { recursive: true });
            currentPath = newPath;
            refreshItems();
          }
          creatingFolder = false;
          folderInput = "";
          render();
        } else if (key === "\x1B") {
          // Esc — cancel folder creation
          creatingFolder = false;
          folderInput = "";
          render();
        } else if (key === "\x7F" || key === "\b") {
          // Backspace
          folderInput = folderInput.slice(0, -1);
          render();
        } else if (key.length === 1 && key.charCodeAt(0) >= 32) {
          // Regular character
          folderInput += key;
          render();
        }
        return;
      }

      const item = items[cursor];

      // Escape — cancel (single \x1B only, not arrow key sequences)
      if (key === "\x1B" && key.length === 1) {
        cleanup();
        reject(new Error("Directory selection cancelled."));
        return;
      }

      // Arrow keys
      if (key === "\x1B[A") {
        // Up
        cursor = cursor > 0 ? cursor - 1 : items.length - 1;
        render();
        return;
      }
      if (key === "\x1B[B") {
        // Down
        cursor = cursor < items.length - 1 ? cursor + 1 : 0;
        render();
        return;
      }
      if (key === "\x1B[D") {
        // Left arrow — go back
        if (currentPath !== rootPath && currentPath !== ".") {
          currentPath = path.dirname(currentPath);
          refreshItems();
          render();
        }
        return;
      }
      if (key === "\x1B[C") {
        // Right arrow — open directory if cursor is on a folder
        if (item.action === "open" && item.dirName) {
          currentPath = path.join(currentPath, item.dirName);
          refreshItems();
          render();
        }
        return;
      }

      // Enter — perform action
      if (key === "\r") {
        if (item.action === "select") {
          cleanup();
          resolve(currentPath);
          return;
        }
        if (item.action === "back") {
          currentPath = path.dirname(currentPath);
          refreshItems();
          render();
          return;
        }
        if (item.action === "open" && item.dirName) {
          currentPath = path.join(currentPath, item.dirName);
          refreshItems();
          render();
          return;
        }
        if (item.action === "create") {
          creatingFolder = true;
          folderInput = "";
          render();
          return;
        }
      }

      // Ctrl+C
      if (key === "\x03") {
        cleanup();
        process.exit(0);
      }
    }

    stdin.on("data", onKeypress);
    render();
  });
}

/**
 * Generates a repository file at a user-selected location.
 * Opens an interactive directory picker starting from lib/.
 */
async function generateRepoModule(moduleName: string) {
  try {
    if (!moduleName || moduleName.trim().length === 0) {
      LoggerHelpers.error(ERROR_MESSAGES.MODULE_NAME_EMPTY);
      process.exit(1);
    }

    if (!MODULE_STRUCTURE.NAME_PATTERN.test(moduleName)) {
      LoggerHelpers.error(ERROR_MESSAGES.MODULE_NAME_INVALID);
      process.exit(1);
    }

    LoggerHelpers.info(`Generating repository for ${moduleName}...`);
    LoggerHelpers.info("Select where to create the repo file:");

    const startDir = fs.existsSync("lib") ? "lib" : ".";
    const repoPath = await pickDirectory(startDir);

    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath, { recursive: true });
    }

    generateRepo(moduleName, repoPath);

    LoggerHelpers.success(`Repository created at ${path.join(repoPath, `${moduleName}_repo.dart`)}`);
  } catch (error) {
    handleCommandError(error, "Error generating repo");
  }
}

/**
 * Adds a route entry for a module to the app_router.dart file.
 * Looks for the OPTIKIT_ROUTE_ANCHOR comment and inserts above it.
 */
function addRoute(moduleName: string) {
  try {
    if (!moduleName || moduleName.trim().length === 0) {
      LoggerHelpers.error(ERROR_MESSAGES.MODULE_NAME_EMPTY);
      process.exit(1);
    }

    if (!MODULE_STRUCTURE.NAME_PATTERN.test(moduleName)) {
      LoggerHelpers.error(ERROR_MESSAGES.MODULE_NAME_INVALID);
      process.exit(1);
    }

    const routerPath = path.join("lib", "config", "app_router.dart");

    if (!fs.existsSync(routerPath)) {
      LoggerHelpers.error("app_router.dart not found at lib/config/app_router.dart");
      LoggerHelpers.info("Run 'optikit init-app' first to scaffold the app structure.");
      process.exit(1);
    }

    const className = getClassName(moduleName);
    const routeName = moduleName.replace(/_/g, '-');
    const anchor = "// === OPTIKIT_ROUTE_ANCHOR === (do not remove this line)";

    const routerContent = fs.readFileSync(routerPath, "utf8");

    // Check if route already exists
    if (routerContent.includes(`'/${routeName}'`)) {
      LoggerHelpers.warning(`Route '/${routeName}' already exists in app_router.dart`);
      return;
    }

    if (!routerContent.includes(anchor)) {
      LoggerHelpers.error("Route anchor not found in app_router.dart. Cannot insert route.");
      LoggerHelpers.info("Ensure the file contains: " + anchor);
      process.exit(1);
    }

    // Build the import path for the module
    const importPath = `import '../module/${moduleName}/import/${moduleName}_import.dart';`;

    // Build route case
    const routeCase = `      case '/${routeName}':
        return MaterialPageRoute(
          builder: (_) => BlocProvider(
            create: (_) => ${className}Bloc(),
            child: ${className}Screen(bloc: ${className}Bloc()),
          ),
        );`;

    // Insert route above anchor
    const updatedRouter = routerContent.replace(
      anchor,
      `${routeCase}\n      ${anchor}`
    );

    // Add import if not already present
    let finalContent = updatedRouter;
    if (!finalContent.includes(importPath)) {
      // Insert import after the last existing import line
      const lastImportIndex = finalContent.lastIndexOf("import ");
      if (lastImportIndex !== -1) {
        const endOfImportLine = finalContent.indexOf("\n", lastImportIndex);
        finalContent =
          finalContent.slice(0, endOfImportLine + 1) +
          importPath + "\n" +
          finalContent.slice(endOfImportLine + 1);
      }
    }

    writeFile(routerPath, finalContent);

    LoggerHelpers.success(`Route '/${routeName}' added for module ${moduleName}`);
    LoggerHelpers.info(`  Route: '/${routeName}'`);
    LoggerHelpers.info(`  Screen: ${className}Screen`);
    LoggerHelpers.info(`  BLoC: ${className}Bloc`);
  } catch (error) {
    handleCommandError(error, "Error adding route");
  }
}
