# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Related Documentation

| File | Purpose |
|---|---|
| [OPTIKIT_AGENT.md](OPTIKIT_AGENT.md) | Full AI agent reference — deep command details, behaviors, constraints |
| [docs/USAGE.md](docs/USAGE.md) | End-user command reference |
| [docs/VERSION_MANAGEMENT.md](docs/VERSION_MANAGEMENT.md) | Version bump strategy and dual build number system |
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | Installation methods (NPM, Homebrew, source) |

## Claude Slash Commands (`.claude/commands/`)

These commands can be copied into any Flutter project that uses OptiKit:

| Command | Triggers |
|---|---|
| `/version` | Show, bump, or manually set version/build numbers |
| `/build` | Build APK, AAB, iOS, or IPA |
| `/clean` | Clean Flutter project or iOS CocoaPods |
| `/generate` | Scaffold a BLoC module for Opticore |
| `/run` | List devices and run the app |
| `/rollback` | Inspect and restore backups |
| `/setup` | Init config and VSCode settings |
| `/sync-docs` | Keep all docs in sync after any source change |

> After any change to `src/`, run `/sync-docs` to update all documentation automatically.

## Essential Commands

```bash
npm install              # Install dependencies
npm run build            # Compile TypeScript (src/ -> dist/)
npm start                # Run CLI (equivalent to node dist/cli.js)
npm link                 # Create global symlink for local testing
optikit <command>        # Test commands after npm link
```

**No test suite exists** — `npm test` is a stub. There is no linter configured.

## Project Overview

OptiKit is a TypeScript CLI for Flutter/Opticore developers. It automates module scaffolding, builds, version management, and project maintenance. Built with yargs, chalk, and boxen.

## Architecture

### How Commands Work

All commands are registered in `src/cli.ts` using yargs `.command()` blocks. Each block imports a handler from a domain module under `src/commands/`. The pattern:

1. `cli.ts` defines the command name, positional args, options (flags), and description
2. The handler function delegates to the imported command module
3. Command modules use utilities from `src/utils/` (validators, helpers, services)

### Domain Organization

Commands are grouped by domain: `build/`, `clean/`, `version/`, `project/`, `config/`. Utilities are grouped by role: `validators/`, `helpers/`, `services/`.

### Key Architectural Patterns

**FVM Support** — Most Flutter commands support a `--disable-fvm` flag. By default, commands prepend `fvm` to Flutter/Dart commands. The flag switches to the global Flutter SDK. Constants for both variants live in `src/constants.ts` (`FLUTTER_COMMANDS` vs `FVM_COMMANDS`).

**Version Management (Dual Build Numbers)** — Android and iOS have independent build numbers. `bump <type>` increments the semver and resets both. `bump-ios` / `bump-android` / `bump-build` increment build numbers independently. Version updates touch three files simultaneously: `pubspec.yaml`, `ios/Runner.xcodeproj/project.pbxproj`, and `ios/Runner/Info.plist`.

**Backup System** — Before modifying version files, OptiKit creates timestamped backups in `.optikit-backup/`. Retention is capped at 5 backups (configurable in `constants.ts` `BACKUP_CONFIG`). The `rollback` command lists and restores these.

**Process Execution** — Three execution patterns in `src/utils/services/exec.ts`: `execCommand()` for general shell commands with streaming output, `execInIos()` for commands in `ios/` with 10-min timeout, and `execInIosWithRetry()` for flaky CocoaPods operations (3 retries, 10s delay).

**Module Generation** — The `generate module` command scaffolds a complete BLoC pattern: bloc, event, state, screen, factory, and import file. Templates are inline in `src/commands/project/generate.ts`. Class names are derived from snake_case module names via `getClassName()` (e.g., `user_profile` -> `UserProfileBloc`).

**Configuration** — `.optikitrc.json` loaded with priority: project root > home directory. Managed by `src/utils/services/config.ts`.

**Constants** — All magic strings, paths, commands, error messages, and build configs are centralized in `src/constants.ts`. Always use these rather than inline strings.

## Adding New Commands

1. Create a command module in the appropriate domain folder under `src/commands/`
2. Import it in `src/cli.ts` (use `.js` extension in imports — ES modules requirement)
3. Add a `.command()` block following the existing pattern in cli.ts
4. Use `LoggerHelpers` for output, `execCommand()` for shell ops, validators for pre-flight checks

## Important Conventions

- **ES Modules**: `"type": "module"` — all imports must use `.js` extension even for `.ts` files
- **Strict TypeScript**: `strict: true` in tsconfig, target ESNext with NodeNext module resolution
- **Path construction**: Always use `path.join()` for cross-platform paths
- **Process execution**: Never use `child_process` directly — use `execCommand()` / `execInIos()` wrappers
- **Constants over strings**: Use `src/constants.ts` for paths, commands, error messages, and config values
