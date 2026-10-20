export { getFlutterCommand };

/**
 * Gets the appropriate Flutter command based on FVM usage
 *
 * @param baseCommand - The base Flutter command (e.g., "flutter clean")
 * @param useFvm - Whether to use FVM
 * @returns The command string with or without FVM prefix
 *
 * @example
 * getFlutterCommand("flutter clean", true) // "fvm flutter clean"
 * getFlutterCommand("flutter pub get", false) // "flutter pub get"
 */
function getFlutterCommand(baseCommand: string, useFvm: boolean): string {
  if (useFvm) {
    return baseCommand.replace(/^flutter\s/, "fvm flutter ");
  }
  return baseCommand;
}
