import chalk from "chalk";

interface AliasEntry {
  alias: string;
  command: string;
  description: string;
}

interface FlagEntry {
  short: string;
  long: string;
  commands: string;
}

const buildAliases: AliasEntry[] = [
  { alias: "apk", command: "flutter-build-apk", description: "Build release APK" },
  { alias: "aab", command: "flutter-build-bundle", description: "Build release AAB bundle" },
  { alias: "ios", command: "flutter-build-ios", description: "Build iOS app" },
  { alias: "ipa", command: "flutter-build-ipa", description: "Build release IPA" },
  { alias: "tf", command: "testflight", description: "Bump iOS + build IPA" },
];

const cleanAliases: AliasEntry[] = [
  { alias: "c", command: "clean", description: "Clean Flutter (use -a for all)" },
  { alias: "cf", command: "clean-flutter", description: "Clean Flutter project" },
  { alias: "ci", command: "clean-ios", description: "Clean iOS / CocoaPods" },
];

const versionAliases: AliasEntry[] = [
  { alias: "v", command: "version", description: "Show current version" },
  { alias: "bi", command: "bump-ios", description: "Bump iOS build number" },
  { alias: "ba", command: "bump-android", description: "Bump Android build number" },
  { alias: "bb", command: "bump-build", description: "Bump both build numbers" },
  { alias: "vset", command: "flutter-update-version", description: "Set version manually" },
];

const projectAliases: AliasEntry[] = [
  { alias: "gen", command: "generate", description: "Generate module or repo" },
  { alias: "route", command: "add-route", description: "Add route to app_router.dart" },
  { alias: "devs", command: "devices", description: "List connected devices" },
  { alias: "rs", command: "run-select", description: "Interactive device select & run" },
  { alias: "info", command: "status", description: "Project status snapshot" },
  { alias: "dr", command: "doctor", description: "Check environment health" },
];

const openAliases: AliasEntry[] = [
  { alias: "xcode", command: "open-ios", description: "Open project in Xcode" },
  { alias: "studio", command: "open-android", description: "Open project in Android Studio" },
];

const configAliases: AliasEntry[] = [
  { alias: "vscode", command: "setup-vscode", description: "Setup VS Code settings" },
  { alias: "undo", command: "rollback", description: "List/restore backups" },
  { alias: "up", command: "upgrade", description: "Check for CLI updates" },
];

const shortFlags: FlagEntry[] = [
  { short: "-f", long: "--disable-fvm", commands: "build, clean, run, devs" },
  { short: "-a", long: "--all", commands: "clean (flutter + iOS)" },
  { short: "-i", long: "--ios", commands: "clean (also clean iOS)" },
  { short: "-c", long: "--clean-cache", commands: "clean-ios" },
  { short: "-u", long: "--repo-update", commands: "clean-ios" },
  { short: "-r", long: "--with-route", commands: "gen module" },
  { short: "-y", long: "--yes", commands: "bump commands" },
  { short: "-r", long: "--release", commands: "run, run-select" },
  { short: "-d", long: "--device", commands: "run" },
];

const comboFlags: FlagEntry[] = [
  { short: "--clean", long: "", commands: "apk, aab, ios, ipa  Clean before building" },
  { short: "-o", long: "--open", commands: "apk, aab, ipa, tf   Open output after build" },
  { short: "-b", long: "--bump", commands: "apk, aab, ios, ipa  Bump version before build" },
  { short: "-i", long: "--bump-ios", commands: "ipa             Bump iOS build before build" },
];

function printGroup(title: string, entries: AliasEntry[]): void {
  console.log(chalk.cyan.bold(`\n  ${title}`));
  console.log(chalk.gray(`  ${"─".repeat(title.length + 4)}`));
  for (const { alias, command, description } of entries) {
    const aliasCol = chalk.white.bold(alias.padEnd(10));
    const cmdCol = chalk.gray(command.padEnd(24));
    const descCol = chalk.gray(description);
    console.log(`    ${aliasCol} ${cmdCol} ${descCol}`);
  }
}

function printFlags(title: string, flags: FlagEntry[]): void {
  console.log(chalk.cyan.bold(`\n  ${title}`));
  console.log(chalk.gray(`  ${"─".repeat(title.length + 4)}`));
  for (const { short: s, long: l, commands } of flags) {
    const shortCol = chalk.white.bold(s.padEnd(8));
    const longCol = l ? chalk.gray(l.padEnd(16)) : "".padEnd(16);
    const cmdCol = chalk.gray(commands);
    console.log(`    ${shortCol} ${longCol} ${cmdCol}`);
  }
}

function printExamples(): void {
  console.log(chalk.cyan.bold("\n  Common Workflows"));
  console.log(chalk.gray(`  ${"─".repeat(22)}`));

  const examples = [
    ["ok apk", "Build release APK"],
    ["ok apk --clean", "Clean + build APK"],
    ["ok apk -b patch -o", "Bump patch + build APK + open"],
    ["ok ipa --clean -o", "Clean + build IPA + open"],
    ["ok ipa -i -o", "Bump iOS + build IPA + open"],
    ["ok tf", "TestFlight (bump iOS + build IPA)"],
    ["ok tf -o", "TestFlight + open output"],
    ["", ""],
    ["ok c -a", "Clean Flutter + iOS"],
    ["ok ci -cu", "Clean iOS: cache + repo update"],
    ["ok bump patch", "Bump patch version"],
    ["ok gen module login -r", "Generate module with auto-route"],
    ["ok rs -r", "Run on selected device (release)"],
  ];

  for (const [cmd, desc] of examples) {
    if (!cmd) {
      console.log();
      continue;
    }
    console.log(`    ${chalk.green(cmd.padEnd(28))} ${chalk.gray(desc)}`);
  }
}

function printSetupTip(): void {
  console.log(chalk.cyan.bold("\n  Usage"));
  console.log(chalk.gray(`  ${"─".repeat(9)}`));
  console.log(chalk.gray("    Use ") + chalk.white.bold("ok") + chalk.gray(" or ") + chalk.white.bold("optikit") + chalk.gray(" — both work identically."));
  console.log(chalk.gray("\n    Enable tab completion:"));
  console.log(chalk.white.bold("    ok completion >> ~/.zshrc"));
  console.log();
}

export function showAliases(): void {
  console.log(chalk.cyan.bold("\n  OptiKit Alias Reference"));
  console.log(chalk.gray("  ═══════════════════════════"));

  printGroup("Build", buildAliases);
  printGroup("Clean", cleanAliases);
  printGroup("Version & Bump", versionAliases);
  printGroup("Project", projectAliases);
  printGroup("Open", openAliases);
  printGroup("Config", configAliases);
  printFlags("Short Flags", shortFlags);
  printFlags("Build Combo Flags", comboFlags);
  printExamples();
  printSetupTip();
}
