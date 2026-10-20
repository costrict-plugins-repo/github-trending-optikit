import { execCommand, execCommandSilent } from "../../utils/services/exec.js";
import { LoggerHelpers } from "../../utils/services/logger.js";
import { validateFlutterProject, validateFlutterSdk } from "../../utils/validators/validation.js";
import { handleCommandError } from "../../utils/helpers/error.js";
import chalk from "chalk";

export { listDevices, runApp, getDevicesList, runAppInteractive };

/**
 * Device information structure
 */
interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  isEmulator: boolean;
};

/**
 * Gets a parsed list of devices
 */
async function getDevicesList(useFvm: boolean = false): Promise<DeviceInfo[]> {
  const flutterCommand = useFvm ? "fvm flutter" : "flutter";

  try {
    const stdout = await execCommandSilent(`${flutterCommand} devices --machine`);
    const devices = JSON.parse(stdout) as Array<{
      id: string;
      name: string;
      platform: string;
      emulator: boolean;
    }>;

    return devices.map(device => ({
      id: device.id,
      name: device.name,
      platform: device.platform,
      isEmulator: device.emulator
    }));
  } catch (error) {
    // Fallback to empty array if parsing fails
    return [];
  }
}

/**
 * Lists all connected devices with numbered list
 */
async function listDevices(useFvm: boolean = false): Promise<void> {
  // Pre-flight validation
  if (!validateFlutterProject()) {
    process.exit(1);
  }

  if (!(await validateFlutterSdk(!useFvm))) {
    process.exit(1);
  }

  try {
    LoggerHelpers.info("Fetching connected devices...\n");

    const devices = await getDevicesList(useFvm);

    if (devices.length === 0) {
      LoggerHelpers.warning("No devices found.");
      console.log(chalk.gray("\nMake sure you have:"));
      console.log(chalk.gray("  - A device connected via USB"));
      console.log(chalk.gray("  - An emulator/simulator running"));
      console.log(chalk.gray("  - Chrome browser for web development\n"));
      return;
    }

    console.log(chalk.bold("\n📱 Connected Devices:\n"));

    devices.forEach((device, index) => {
      const number = chalk.cyan(`[${index + 1}]`);
      const name = chalk.white.bold(device.name);
      const platform = chalk.gray(`(${device.platform})`);
      const type = device.isEmulator ? chalk.yellow(" [Emulator]") : chalk.green(" [Physical]");
      const id = chalk.gray(`ID: ${device.id}`);

      console.log(`${number} ${name} ${platform}${type}`);
      console.log(`    ${id}`);
      console.log();
    });

    console.log(chalk.gray("═".repeat(60)));
    console.log(chalk.gray("To run on a specific device:"));
    console.log(chalk.white("  optikit run --device <device-id>"));
    console.log(chalk.gray("\nOr use interactive selection:"));
    console.log(chalk.white("  optikit run-select"));
    console.log(chalk.gray("═".repeat(60) + "\n"));

  } catch (error) {
    handleCommandError(error, "Error listing devices");
  }
}

/**
 * Configuration for running the Flutter app
 */
interface RunConfig {
  device?: string;
  release?: boolean;
  flavor?: string;
  useFvm?: boolean;
}

/**
 * Runs the Flutter app on a connected device
 */
async function runApp(config: RunConfig): Promise<void> {
  // Pre-flight validation
  if (!validateFlutterProject()) {
    process.exit(1);
  }

  if (!(await validateFlutterSdk(!config.useFvm))) {
    process.exit(1);
  }

  try {
    const flutterCommand = config.useFvm ? "fvm flutter" : "flutter";

    // Build the run command
    let command = `${flutterCommand} run`;

    // Add device flag if specified
    if (config.device) {
      command += ` --device-id ${config.device}`;
      LoggerHelpers.info(`Running on device: ${config.device}`);
    } else {
      LoggerHelpers.info("Running on default device...");
    }

    // Add release flag if specified
    if (config.release) {
      command += " --release";
      LoggerHelpers.info("Running in release mode");
    }

    // Add flavor flag if specified
    if (config.flavor) {
      command += ` --flavor ${config.flavor}`;
      LoggerHelpers.info(`Running with flavor: ${config.flavor}`);
    }

    console.log(chalk.cyan("\nStarting Flutter app..."));
    console.log(chalk.gray(`Command: ${command}\n`));

    await execCommand(command);

  } catch (error) {
    handleCommandError(error, "Error running app");
  }
}

/**
 * Interactive device selection and run
 */
async function runAppInteractive(config: Omit<RunConfig, 'device'>): Promise<void> {
  // Pre-flight validation
  if (!validateFlutterProject()) {
    process.exit(1);
  }

  if (!(await validateFlutterSdk(!config.useFvm))) {
    process.exit(1);
  }

  try {
    LoggerHelpers.info("Fetching connected devices...\n");

    const devices = await getDevicesList(config.useFvm);

    if (devices.length === 0) {
      LoggerHelpers.error("No devices found. Please connect a device or start an emulator.");
      process.exit(1);
    }

    // Show devices
    console.log(chalk.bold("\n📱 Connected Devices:\n"));

    devices.forEach((device, index) => {
      const number = chalk.cyan.bold(`[${index + 1}]`);
      const name = chalk.white.bold(device.name);
      const platform = chalk.gray(`(${device.platform})`);
      const type = device.isEmulator ? chalk.yellow(" [Emulator]") : chalk.green(" [Physical]");

      console.log(`${number} ${name} ${platform}${type}`);
    });

    console.log(chalk.gray("\n" + "═".repeat(60)));
    console.log(chalk.cyan("Enter device number to run on:"));
    console.log(chalk.gray("═".repeat(60) + "\n"));

    // Use readline for user input
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.on('error', () => {
      LoggerHelpers.error("Input error. Please try again.");
      process.exit(1);
    });

    rl.question(chalk.yellow("Device number: "), async (answer: string) => {
      rl.close();

      const deviceIndex = parseInt(answer) - 1;

      if (isNaN(deviceIndex) || deviceIndex < 0 || deviceIndex >= devices.length) {
        LoggerHelpers.error(`Invalid device number. Please choose between 1 and ${devices.length}`);
        process.exit(1);
      }

      const selectedDevice = devices[deviceIndex];

      console.log(chalk.green(`\n✓ Selected: ${selectedDevice.name}\n`));

      // Run on selected device
      await runApp({
        ...config,
        device: selectedDevice.id
      });
    });

  } catch (error) {
    handleCommandError(error, "Error selecting device");
  }
}
