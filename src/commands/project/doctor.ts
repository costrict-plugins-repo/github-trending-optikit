import chalk from "chalk";
import { execCommandSilent } from "../../utils/services/exec.js";
import { validateFlutterProject, validateIosProject, validateAndroidProject } from "../../utils/validators/validation.js";
import { getConfigPath } from "../../utils/services/config.js";
import { HELP_URLS } from "../../constants.js";
import { sectionHeader } from "../../styles.js";

export { runDoctor };

interface CheckResult {
  name: string;
  passed: boolean;
  version?: string;
  fix?: string;
}

async function checkCommand(
  name: string,
  command: string,
  fix: string
): Promise<CheckResult> {
  try {
    const output = await execCommandSilent(command);
    const version = output.trim().split("\n")[0];
    return { name, passed: true, version };
  } catch {
    return { name, passed: false, fix };
  }
}

async function runDoctor(): Promise<void> {
  sectionHeader("OptiKit Doctor");

  const results: CheckResult[] = [];

  // Tool checks (run in parallel)
  const toolChecks = await Promise.all([
    checkCommand("Flutter SDK", "flutter --version", `Install Flutter: ${HELP_URLS.FLUTTER_INSTALL}`),
    checkCommand("FVM", "fvm --version", `Install FVM: ${HELP_URLS.FVM_INSTALL} (optional)`),
    checkCommand("CocoaPods", "pod --version", "Install: gem install cocoapods"),
    checkCommand("Xcode CLI Tools", "xcode-select -p", "Install: xcode-select --install"),
  ]);
  results.push(...toolChecks);

  // Project checks
  results.push(
    { name: "Flutter project", passed: validateFlutterProject(true), fix: "Run from Flutter project root" },
    { name: "iOS project", passed: validateIosProject(true), fix: "Run: flutter create ." },
    { name: "Android project", passed: validateAndroidProject(true), fix: "Run: flutter create ." },
  );

  const configPath = getConfigPath();
  results.push({
    name: "OptiKit config",
    passed: configPath !== null,
    version: configPath ?? undefined,
    fix: "Run: optikit init",
  });

  // Display results
  console.log();
  let passCount = 0;

  for (const result of results) {
    if (result.passed) {
      passCount++;
      const ver = result.version ? chalk.gray(` ${result.version}`) : "";
      console.log(chalk.green("   ✔"), chalk.white(result.name) + ver);
    } else {
      console.log(chalk.red("   ✖"), chalk.white(result.name));
      if (result.fix) {
        console.log(chalk.gray("     └─"), chalk.yellow(result.fix));
      }
    }
  }

  const total = results.length;
  const color = passCount === total ? chalk.green : passCount >= total - 2 ? chalk.yellow : chalk.red;
  console.log(chalk.gray("\n  ─────────────────────────────────"));
  console.log(color(`  ${passCount}/${total} checks passed\n`));
}
