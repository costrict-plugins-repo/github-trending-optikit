# OptiKit CLI — AI Agent Reference

Add this file to the root of any Flutter project and reference it in your AI assistant's context so it knows exactly how to use the OptiKit CLI.

---

## What is OptiKit?

OptiKit (`optikit`) is a CLI tool for Flutter developers that automates:
- Module scaffolding (full BLoC pattern for the Opticore framework)
- Version and build number management (iOS + Android independently)
- Production builds (APK, AAB, IPA, iOS)
- Project cleaning (Flutter + iOS CocoaPods with automatic retry)
- Device management and app running
- Automatic timestamped backups before every destructive operation
- Config initialization and backup rollback

Install globally: `npm install -g optikit`

---

## Non-Negotiable Rules

1. **Always run from Flutter project root** — the directory that contains `pubspec.yaml`
2. **FVM is on by default** — append `--disable-fvm` to any build/clean/run/devices command if the project has no `.fvm/flutter_sdk`
3. **Module names must be `snake_case`** — only lowercase letters, numbers, underscores (`^[a-z0-9_]+$`)
4. **Version format in `pubspec.yaml` must be `X.Y.Z+B`** — e.g. `1.2.3+45`
5. **All commands pre-validate** — they exit with code 1 and a clear error if the environment isn't valid

---

## Full Command Reference

### Configuration & Setup

| Command | What it does |
|---------|-------------|
| `optikit init` | Creates `.optikitrc.json`, adds `.optikit-backup/` to `.gitignore` |
| `optikit setup-vscode` | Creates `.vscode/settings.json` configured for FVM |
| `optikit rollback` | Lists all backups grouped by file with timestamps and sizes |
| `optikit rollback --restore <n>` | Restores backup number `n` from the list |

**Default `.optikitrc.json`** created by `optikit init`:
```json
{
  "backupRetentionCount": 5,
  "useFvmByDefault": true,
  "autoBackup": true,
  "verbose": false
}
```
Config lookup order: `./optikitrc.json` → `./.optikitrc` → `~/.optikitrc.json`

`optikit init` also appends `.optikit-backup/` to `.gitignore` automatically if `.gitignore` exists. If config already exists, it warns and exits without overwriting.

**VSCode `settings.json` template** (created by `setup-vscode`):
```json
{
  "dart.flutterSdkPath": ".fvm/flutter_sdk",
  "editor.formatOnSave": true,
  "dart.previewFlutterUiGuides": true,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/build": true
  }
}
```

**`optikit rollback`** recursively searches for all `.optikit-backup/` directories (skips hidden dirs and `node_modules`), groups results by original file, shows index + timestamp + time-ago + file size in KB.

**`optikit rollback --restore <n>`** copies backup file `n` back to its original path.

---

### Version & Build Number Management

Flutter has **two separate build numbers**:
- **Android**: the `+N` suffix in `pubspec.yaml` (`version: 1.2.3+45`) — must always increase on Google Play, never reset
- **iOS**: `CURRENT_PROJECT_VERSION` in `ios/Runner.xcodeproj/project.pbxproj` — resets to 1 per new version on App Store Connect

`optikit version` reads both independently and shows them:
```
📱 Current Version Information

Version: 1.2.3+45
  Major: 1   Minor: 2   Patch: 3
  Android Build: 45      ← from pubspec.yaml
  iOS Build: 3           ← read directly from project.pbxproj
```

#### Semantic Bump Commands

| Command | Version | Android Build | iOS Build | When to use |
|---------|---------|---------------|-----------|-------------|
| `optikit bump patch` | `+0.0.1` | `+1` | Reset to `1` | Bug fixes |
| `optikit bump minor` | `+0.1.0`, patch→0 | `+1` | Reset to `1` | New features |
| `optikit bump major` | `+1.0.0`, minor+patch→0 | `+1` | Reset to `1` | Breaking changes |

**Why iOS always resets to 1 on `bump`?**
App Store Connect requires unique build numbers *per version*. Build 1 of v1.0.0 and Build 1 of v1.0.1 are completely different submissions. This matches Apple's model.

**Why Android never resets?**
Google Play requires strictly increasing build numbers across all uploads ever. Resetting would reject the upload.

#### Build-Only Bump Commands

| Command | Version | Android Build | iOS Build | When to use |
|---------|---------|---------------|-----------|-------------|
| `optikit bump-ios` | unchanged | unchanged | reads actual iOS build from `project.pbxproj`, then `+1` | TestFlight re-upload |
| `optikit bump-android` | unchanged | `+1` | unchanged | Google Play re-upload |
| `optikit bump-build` | unchanged | `+1` | reads actual iOS build from `project.pbxproj`, then `+1` | Simultaneous re-upload both stores |

`bump-ios` and `bump-build` read the current iOS build from `ios/Runner.xcodeproj/project.pbxproj` (`CURRENT_PROJECT_VERSION`) — not from `pubspec.yaml`. If the file is missing, defaults to `1`.

#### Manual Version Override

```bash
optikit flutter-update-version \
  --app-version 2.0.0 \
  --android-build 100 \
  --ios-build 5
```

All three flags are optional. Passing an empty string for `--android-build` or `--ios-build` skips that platform's update. Omitting a flag defaults to empty (skip).

**Exact files modified by ALL version commands (with backups created before each write):**
1. `pubspec.yaml` — regex-replaces `version: X.Y.Z+B`
2. `ios/Runner.xcodeproj/project.pbxproj` — replaces `MARKETING_VERSION = ...;` and `CURRENT_PROJECT_VERSION = ...;`
3. `ios/Runner/Info.plist` — replaces `CFBundleShortVersionString` and `CFBundleVersion` values

---

### Build Commands

All builds run in `--release` mode. APK and Bundle also add `--obfuscate --split-debug-info=build/app/outputs/symbols`. Build commands do **not** modify source files and do **not** create backups.

| Command | Flutter command | Extra flags | Platform validation |
|---------|----------------|-------------|-------------------|
| `optikit flutter-build-apk` | `flutter build apk` | `--release --obfuscate --split-debug-info=build/app/outputs/symbols` | `android/` + `build.gradle` |
| `optikit flutter-build-bundle` | `flutter build appbundle` | `--release --obfuscate --split-debug-info=build/app/outputs/symbols` | `android/` + `build.gradle` |
| `optikit flutter-build-ios` | `flutter build ios` | `--release` | `ios/` + `Runner.xcodeproj` or `.xcworkspace` |
| `optikit flutter-build-ipa` | `flutter build ipa` | `--release` | `ios/` + `Runner.xcodeproj` or `.xcworkspace` |

All accept `--disable-fvm`. FVM versions prepend `fvm` to every flutter command.

**Build output paths:**
- APK: `build/app/outputs/flutter-apk/`
- Bundle: `build/app/outputs/bundle/release/`
- IPA: `build/ios/ipa/`

---

### Open Outputs & IDEs

| Command | Opens |
|---------|-------|
| `optikit open-apk` | `build/app/outputs/flutter-apk/` |
| `optikit open-bundle` | `build/app/outputs/bundle/release/` |
| `optikit open-ipa` | `build/ios/ipa/` |
| `optikit open-ios` | Xcode via `open ios/Runner.xcworkspace` |
| `optikit open-android` | Android Studio (macOS: `open -a 'Android Studio' android`, Windows: `start android`, Linux: `xdg-open android`) |

All open commands validate Flutter project + platform project before opening. Cross-platform.

---

### Clean Commands

**`optikit clean-flutter`** runs 3 steps in sequence:
1. `fvm flutter clean` (or `flutter clean` with `--disable-fvm`)
2. Backs up `pubspec.lock` → deletes it
3. `fvm flutter pub get`

```bash
optikit clean-flutter
optikit clean-flutter --disable-fvm
```

**`optikit clean-ios`** runs a deep CocoaPods reset:
1. Checks if `Flutter.xcframework` exists in the SDK cache — runs `fvm flutter precache --ios` if missing
2. Deletes `ios/Podfile.lock`
3. `pod deintegrate`
4. If `--clean-cache`: `pod cache clean --all`
5. If `--repo-update`: `pod repo update` (3 retries, 10s delay) → `pod update` (3 retries, 10s delay)
6. Otherwise: `pod install` (3 retries, 10s delay)

All pod operations run inside the `ios/` directory. **10-minute timeout** per operation. **3 retries with 10s delay** for network-sensitive operations.

```bash
optikit clean-ios                                # basic: deintegrate + pod install
optikit clean-ios --clean-cache                  # + wipe pod cache
optikit clean-ios --repo-update                  # + update repos + pod update
optikit clean-ios --clean-cache --repo-update    # full nuclear clean
```

---

### Device & Run Commands

```bash
optikit devices                        # list all connected devices (numbered, with IDs)
optikit devices --disable-fvm

optikit run                            # run on default device
optikit run -d <device-id>             # run on specific device (--device)
optikit run -r                         # run in release mode (--release)
optikit run -f <flavor>                # run with flavor (--flavor)
optikit run --disable-fvm

optikit run-select                     # interactive: shows numbered device list, prompts for selection
optikit run-select -r                  # same but release mode
optikit run-select -f <flavor>
optikit run-select --disable-fvm
```

`optikit devices` uses `flutter devices --machine` (JSON), then displays: number, name, platform, `[Emulator]` or `[Physical]`, and device ID.

`optikit run-select` shows the same list, prompts for a number, then internally calls `runApp` with the selected device ID.

---

### Module Generation (Opticore BLoC Only)

> Only for projects using the [Opticore](https://pub.dev/packages/opticore) framework.

```bash
optikit generate module <module_name>
```

**Validation:** name must match `^[a-z0-9_]+$`. Empty name exits with error. Existing module warns and overwrites.

**Generated structure under `lib/module/<module_name>/`:**

```
lib/module/user_profile/
├── import/   user_profile_import.dart   ← central hub
├── bloc/     user_profile_bloc.dart
├── event/    user_profile_event.dart
├── state/    user_profile_state.dart
├── screen/   user_profile_screen.dart
└── factory/  user_profile_factory.dart
```

**Class naming rule:** `user_profile` → prefix `UserProfile` (snake_case words capitalized, joined). Suffix determined by file type:
- `user_profile_bloc.dart` → `UserProfileBloc`
- `user_profile_event.dart` → `UserProfileInitialEvent`
- `user_profile_state.dart` → `UserProfileInitialState`
- `user_profile_screen.dart` → `UserProfileScreen`
- `user_profile_factory.dart` → `UserProfileStateFactory`

**Generated `user_profile_import.dart`:**
```dart
import 'package:flutter/material.dart';
import 'package:opticore/opticore.dart';

part '../bloc/user_profile_bloc.dart';
part '../event/user_profile_event.dart';
part '../screen/user_profile_screen.dart';
part '../state/user_profile_state.dart';
part '../factory/user_profile_factory.dart';
```

All other files start with `part of '../import/user_profile_import.dart';`

**Bloc template:**
```dart
class UserProfileBloc extends BaseBloc {
  UserProfileBloc() : super(UserProfileStateFactory(), initialState: UserProfileInitialState()) {}
  @override void onDispose() {}
}
```

**Screen template** extends `BaseScreen<Bloc, Widget, dynamic>` with `buildWidget` and `listenToState`.

---

## Automatic Backup System (Deep Detail)

**Triggered by:** `flutter-update-version`, all `bump*` commands, `clean-flutter` (for `pubspec.lock`)

**Backup location:** `.optikit-backup/` directory **next to each original file**

**Naming:** `<filename>_<ISO8601>.<ext>` with `:` and `.` replaced by `-`
Example: `pubspec_2025-12-23T10-30-00-000Z.yaml`

**Retention:** Last 5 backups per directory kept (sorted by modification time, oldest deleted)

**Backup structure:**
```
your-flutter-project/
├── pubspec.yaml
├── .optikit-backup/
│   ├── pubspec_2025-12-23T10-30-00-000Z.yaml
│   └── pubspec_2025-12-23T11-00-00-000Z.yaml
└── ios/
    ├── Runner.xcodeproj/
    │   └── .optikit-backup/
    │       └── project_2025-12-23T10-30-00-000Z.pbxproj
    └── Runner/
        └── .optikit-backup/
            └── Info_2025-12-23T10-30-00-000Z.plist
```

`optikit rollback` searches recursively for `.optikit-backup/` dirs, skipping hidden dirs and `node_modules`. Groups results by original file (recovers original path by stripping timestamp from backup filename). Displays index, timestamp, time-ago string (e.g. `5m ago`), and file size in KB.

---

## Pre-Flight Validation (All Commands)

| Check | How it validates |
|-------|-----------------|
| Flutter project | `pubspec.yaml` exists AND contains `flutter:` SDK reference |
| Flutter SDK (FVM mode) | `.fvm/flutter_sdk` dir exists AND `fvm` binary reachable |
| Flutter SDK (global mode) | `flutter` binary reachable in PATH |
| iOS project | `ios/` dir exists AND (`Runner.xcodeproj` OR `Runner.xcworkspace`) present |
| Android project | `android/` dir exists AND (`build.gradle` OR `build.gradle.kts`) present |

Failure = clear colored error message + `process.exit(1)`. No partial execution.

---

## Common Workflows

### Release new version → both stores
```bash
optikit version
optikit bump patch             # 1.2.3+45 → 1.2.4+46 (iOS: 1)
optikit flutter-build-ipa
optikit flutter-build-bundle
```

### Multiple TestFlight uploads (same version)
```bash
optikit bump-ios && optikit flutter-build-ipa   # iOS: 2
optikit bump-ios && optikit flutter-build-ipa   # iOS: 3
```

### Android hotfix only
```bash
optikit bump-android && optikit flutter-build-bundle
```

### Full nuclear iOS clean (CocoaPods issues)
```bash
optikit clean-flutter
optikit clean-ios --clean-cache --repo-update
```

### Scaffold new feature module
```bash
optikit generate module payment_gateway
# wire PaymentGatewayScreen into your router
```

### Recover from bad version bump
```bash
optikit rollback              # numbered list
optikit rollback --restore 1  # restore most recent
```

### New project onboarding
```bash
optikit init          # .optikitrc.json + .gitignore entry
optikit setup-vscode  # .vscode/settings.json
```

---

## AI Decision Guide

| User says… | Command |
|---|---|
| "bump version" / "release a patch" | `optikit bump patch` |
| "new feature bump" | `optikit bump minor` |
| "breaking change" | `optikit bump major` |
| "TestFlight re-upload" / "another iOS build" | `optikit bump-ios` |
| "Play Store re-upload" / "another Android build" | `optikit bump-android` |
| "both stores, same version" | `optikit bump-build` |
| "what version are we on?" | `optikit version` |
| "set version manually to X.Y.Z" | `optikit flutter-update-version --app-version X.Y.Z --android-build N --ios-build N` |
| "build APK" | `optikit flutter-build-apk` |
| "build IPA" / "build for iOS" | `optikit flutter-build-ipa` |
| "build AAB" / "build bundle" | `optikit flutter-build-bundle` |
| "build iOS app" (no archive) | `optikit flutter-build-ios` |
| "open Xcode" | `optikit open-ios` |
| "open Android Studio" | `optikit open-android` |
| "find my APK / IPA / bundle" | `optikit open-apk` / `optikit open-ipa` / `optikit open-bundle` |
| "clean the project" | `optikit clean-flutter` |
| "pod issues" / "iOS clean" | `optikit clean-ios --clean-cache --repo-update` |
| "create module X" / "scaffold X" | `optikit generate module <snake_case_name>` |
| "what devices are connected" | `optikit devices` |
| "run the app" | `optikit run` or `optikit run-select` |
| "run on specific device" | `optikit run --device <device-id>` |
| "something broke after version bump" | `optikit rollback` → `optikit rollback --restore <n>` |
| "setup this project" | `optikit init` |
| "setup VSCode / FVM path" | `optikit setup-vscode` |
