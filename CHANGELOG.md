# 📌 Changelog

All notable changes to **OptiKit CLI** are documented here.

## 🔄 Versioning Strategy

We follow **Semantic Versioning (SemVer)**:

- 🚀 **MAJOR**: Breaking changes that may affect compatibility
- 🌟 **MINOR**: New features or improvements (backward compatible)
- 🛠 **PATCH**: Bug fixes and minor improvements

---

### 🛠 [1.4.2] - Fix bump-ios Overwriting Manually Set iOS Version

- 🔴 Fixed `bump-ios` / `tf` overwriting a manually set `MARKETING_VERSION` in `project.pbxproj` with the stale version from `pubspec.yaml`
- 🆕 Added `getCurrentIosMarketingVersion()` helper that reads `MARKETING_VERSION` directly from `project.pbxproj` (falls back to `pubspec.yaml` if iOS file is missing)
- 🔄 `bumpIosBuildOnly()` now uses the iOS marketing version as source of truth instead of `pubspec.yaml`, so calling `flutter-update-version --app-version X --ios-build N` followed by `bump-ios` / `tf` correctly preserves the manually set version

---

### 🛠 [1.4.1] - Fix Generate Module Command

- 🔴 Fixed `generate module` routing to repo handler instead of module handler
- 🔄 Restructured `generate` as parent command with `module` and `repo` subcommands
- 🧹 Removed stale `repo/` directory from module scaffolding structure

---

### 🌟 [1.4.0] - Interactive Repo Picker & Module Cleanup

- 📂 Interactive arrow-key directory picker for `gen repo` — browse, open, go back, or create folders
- 🔄 Removed repo from `generate module` — lighter module scaffolding
- 🏗️ Repo is now standalone (own import, no `part of`) and can live anywhere

---

### 🌟 [1.3.0] - MCP Plugin, Short Aliases & Combo Flags

- 🤖 **Claude Code Integration**:
  - Built-in MCP server with 28 tools — Claude understands your Flutter project and acts on it
  - `optikit mcp` starts the MCP server (stdio transport)
  - `optikit setup-claude` registers the plugin with Claude Code (macOS, Linux, Windows)
  - `optikit setup-claude --uninstall` removes the plugin cleanly
  - Available as a Claude Code plugin via marketplace

- 🆕 **New Features**:
  - `ok` binary — use `ok` or `optikit` interchangeably, no shell alias needed
  - 23 short aliases for all commands (`apk`, `ipa`, `tf`, `ci`, `bi`, `v`, `gen`, `rs`, `info`, `dr`, `undo`, `up`, and more)
  - Combo build flags — `--clean`, `-o` (open), `-b` (bump), `-i` (bump-ios) on all build commands
  - `testflight` / `tf` command — bump iOS build + build IPA in one step
  - `aliases` command — full reference of all shortcuts, flags, and examples
  - Short flags across commands — `-f`, `-a`, `-c`, `-u`, `-r`, `-i`
  - Elapsed time display on build commands
  - Tab completion via `optikit completion`

- 🏗️ **Improvements**:
  - CLI modularized into domain-specific command files
  - Enhanced `--help` with grouped aliases and combo examples
  - Branded startup banner with version display
  - Logger upgraded with icons (✔ ✖ ⚠ ℹ) and new `step()` / `dim()` methods

- 📝 **Documentation**:
  - README, USAGE, VERSION_MANAGEMENT, INSTALLATION rewritten
  - New TROUBLESHOOT.md for common issues
  - Removed 4 redundant internal docs

- 🔄 **Changes**:
  - `clean` alias changed from `ca` to `c`
  - `flavor` flag on `run`/`run-select` no longer uses `-f` (conflicts with `--disable-fvm`)

### ⚡ [1.2.5] - Simultaneous Build Bump

- Added `bump-build` command — increment both Android and iOS build numbers at once

### 🎯 [1.2.4] - iOS Build Number Accuracy

- Fixed `bump-ios` to read actual iOS build number from `project.pbxproj`
- `version` command now shows Android and iOS build numbers separately

### 🧹 [1.2.3] - Silent Validation

- Removed unwanted version output during command validation

### 🔧 [1.2.2] - Command Naming Fix

- Fixed yargs command conflicts breaking version bumps
- Fixed major/minor/patch bumps only incrementing Android build
- Simplified names: `version bump <type>` → `bump <type>`
- Default `useFvmByDefault` changed to `true`

### 📂 [1.2.1] - Open Build Output

- Added `open-ipa`, `open-apk`, `open-bundle` — access build artifacts
- Cross-platform support (macOS, Windows, Linux)

### 📱 [1.2.0] - Device Management

- Added `devices`, `run`, `run-select` — device management commands
- Interactive device picker with numbered prompts
- Reorganized codebase by domain (build, clean, version, project, config)

### ⚙️ [1.1.1] - VS Code Setup

- Added `setup-vscode` — auto-configure VS Code for FVM

### 🔄 [1.0.4] - Opticore Compatibility

- Updated CLI for latest Opticore version

### 🔄 [1.0.3] - Optimization

- Optimized Opticore compatibility

### 🛡️ [1.0.2] - Error Handling

- Improved error handling and messaging

### 🎉 [1.0.1] - Initial Release

- First release of OptiKit CLI

---

Stay updated with the latest enhancements and fixes! 🚀
