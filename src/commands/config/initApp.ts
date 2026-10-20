import fs from "fs";
import path from "path";
import { LoggerHelpers } from "../../utils/services/logger.js";
import { validateFlutterProject } from "../../utils/validators/validation.js";
import { handleCommandError } from "../../utils/helpers/error.js";
import { writeFile, createDirectories } from "../../utils/helpers/file.js";

export { initOpticoreApp };

async function initOpticoreApp(appName: string): Promise<void> {
  if (!validateFlutterProject()) {
    process.exit(1);
  }

  try {
    const libDir = path.join(process.cwd(), "lib");
    const configDir = path.join(libDir, "config");

    // Create config directory
    createDirectories(configDir, []);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    LoggerHelpers.info(`Initializing Opticore app: ${appName}...`);

    // 1. Generate main.dart
    generateMainDart(libDir, appName);

    // 2. Generate app_router.dart
    generateAppRouter(configDir);

    // 3. Generate app_config_setup.dart
    generateAppConfigSetup(configDir, appName);

    // 4. Generate network_setup.dart
    generateNetworkSetup(configDir);

    LoggerHelpers.success(`Opticore app "${appName}" initialized successfully.`);
    LoggerHelpers.info("\nGenerated files:");
    LoggerHelpers.info("  lib/main.dart");
    LoggerHelpers.info("  lib/config/app_router.dart");
    LoggerHelpers.info("  lib/config/app_config_setup.dart");
    LoggerHelpers.info("  lib/config/network_setup.dart");
    LoggerHelpers.info("\nNext steps:");
    LoggerHelpers.info("  1. Review and customize lib/config/app_config_setup.dart");
    LoggerHelpers.info("  2. Add routes in lib/config/app_router.dart");
    LoggerHelpers.info("  3. Generate modules with: optikit generate module <name>");
    LoggerHelpers.info("  4. Register routes with: optikit add-route <name>");
  } catch (error) {
    handleCommandError(error, "Error initializing Opticore app");
  }
}

function generateMainDart(libDir: string, appName: string) {
  const mainPath = path.join(libDir, "main.dart");

  if (fs.existsSync(mainPath)) {
    LoggerHelpers.warning("main.dart already exists. Skipping to avoid overwrite.");
    LoggerHelpers.info("To regenerate, delete lib/main.dart first.");
    return;
  }

  const template = `import 'package:flutter/material.dart';
import 'package:opticore/opticore.dart';
import 'config/app_config_setup.dart';
import 'config/app_router.dart';
import 'config/network_setup.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    CoreSetup(
      appConfig: AppConfig(
        appTitle: '${appName}',
        theme: AppConfigSetup.theme,
        initialRoute: AppRouter.initialRoute,
        onGenerateRoute: AppRouter.generateRoute,
      ),
      prepConfig: () async {
        await NetworkSetup.initialize();
        // Add other initialization here (Firebase, Hive, etc.)
      },
    ),
  );
}
`;

  writeFile(mainPath, template);
  LoggerHelpers.success("Created lib/main.dart");
}

function generateAppRouter(configDir: string) {
  const routerPath = path.join(configDir, "app_router.dart");

  const template = `import 'package:flutter/material.dart';
import 'package:opticore/opticore.dart';

class AppRouter {
  static const String initialRoute = '/';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      // Routes will be added here by: optikit add-route <moduleName>
      // === OPTIKIT_ROUTE_ANCHOR === (do not remove this line)
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for \${settings.name}'),
            ),
          ),
        );
    }
  }
}
`;

  writeFile(routerPath, template);
  LoggerHelpers.success("Created lib/config/app_router.dart");
}

function generateAppConfigSetup(configDir: string, appName: string) {
  const configPath = path.join(configDir, "app_config_setup.dart");

  const template = `import 'package:flutter/material.dart';
import 'package:opticore/opticore.dart';

class AppConfigSetup {
  static ThemeData get theme => ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
    useMaterial3: true,
  );

  static void initializeConfigs() {
    // Toast notification colors
    ToastConfig.instantiate(
      const ToastConfig(
        successColor: Colors.green,
        errorColor: Colors.red,
        infoColor: Colors.blue,
        warningColor: Colors.orange,
      ),
    );

    // API response messages
    ApiResponseConfig.instantiate(
      ApiResponseConfig(
        errorMessage: 'Something went wrong. Please try again.',
        requestTimeoutMessage: 'Request timed out. Check your connection.',
        networkIssuesMessage: 'Network error. Please check your internet.',
      ),
    );

    // Unauthenticated handler (401/403)
    UnAuthenticatedConfig.instantiate(
      UnAuthenticatedConfig(
        onUnauthenticated: () {
          // Clear user cache and navigate to login
          // Example: RouteHelper.pushAndRemoveUntil(LoginScreen());
        },
      ),
    );
  }
}
`;

  writeFile(configPath, template);
  LoggerHelpers.success("Created lib/config/app_config_setup.dart");
}

function generateNetworkSetup(configDir: string) {
  const networkPath = path.join(configDir, "network_setup.dart");

  const template = `import 'package:opticore/opticore.dart';

class NetworkSetup {
  static const String baseUrl = 'https://api.example.com';

  static Future<void> initialize() async {
    // Configure base URL
    NetworkHelper.instance.setBaseUrl(baseUrl);

    // Set default headers
    await NetworkConfig.updateHeaders(
      newHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );

    // Optional: Enable SSL certificate pinning
    // await NetworkHelper.loadPinningCertificate();
  }

  static Future<void> setAuthToken(String token) async {
    await NetworkConfig.updateHeaders(
      newHeaders: {
        'Authorization': 'Bearer \$token',
      },
    );
  }

  static Future<void> clearAuthToken() async {
    await NetworkConfig.removeHeaders(keys: ['Authorization']);
  }
}
`;

  writeFile(networkPath, template);
  LoggerHelpers.success("Created lib/config/network_setup.dart");
}
