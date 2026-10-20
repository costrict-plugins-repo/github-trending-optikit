# OptiKit Build

Build a production Flutter artifact for this project using the OptiKit CLI.

## Available Builds

| Artifact | Command | Platform | Flags |
|---|---|---|---|
| APK | `optikit flutter-build-apk` | Android | `--release --obfuscate --split-debug-info` |
| AAB (Bundle) | `optikit flutter-build-bundle` | Android (Play Store) | `--release --obfuscate --split-debug-info` |
| iOS app | `optikit flutter-build-ios` | iOS (no archive) | `--release` |
| IPA | `optikit flutter-build-ipa` | iOS (App Store / TestFlight) | `--release` |

All commands use FVM by default. Add `--disable-fvm` if the project doesn't use FVM.

## Build Output Locations

| Artifact | Path |
|---|---|
| APK | `build/app/outputs/flutter-apk/` |
| AAB | `build/app/outputs/bundle/release/` |
| IPA | `build/ios/ipa/` |

## Open Output in Finder After Build

```bash
optikit open-apk     # open APK output folder
optikit open-bundle  # open AAB output folder
optikit open-ipa     # open IPA output folder
```

## Typical Release Workflow

```bash
# 1. Bump version first
optikit bump patch

# 2. Build
optikit flutter-build-ipa     # for iOS
optikit flutter-build-bundle  # for Android

# 3. Open output to upload
optikit open-ipa
optikit open-bundle
```

## Pre-flight Checks (Automatic)

Before building, OptiKit validates:
- `pubspec.yaml` exists (Flutter project check)
- Flutter or FVM SDK is installed
- `ios/` with `Runner.xcodeproj` or `.xcworkspace` (iOS builds)
- `android/` with `build.gradle` (Android builds)

---

Now look at the user's request and run the appropriate build command(s) above.
