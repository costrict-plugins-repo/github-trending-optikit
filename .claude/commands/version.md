# OptiKit Version Management

Show current version info and bump or set version/build numbers for this Flutter project using the OptiKit CLI.

## Current Version

Run this first to see what we're working with:

```bash
optikit version
```

## Bump Version (Semantic Versioning)

Based on the nature of the change, choose the right bump:

| Change Type | Command | Effect |
|---|---|---|
| Bug fix | `optikit bump patch` | `1.2.3+45` → `1.2.4+46` (iOS: 1) |
| New feature | `optikit bump minor` | `1.2.3+45` → `1.3.0+46` (iOS: 1) |
| Breaking change | `optikit bump major` | `1.2.3+45` → `2.0.0+46` (iOS: 1) |

iOS build resets to 1 on any version bump (App Store Connect expects this).
Android build always increments (Google Play requires strictly increasing numbers).

## Bump Build Numbers Only (No Version Change)

| Platform | Command | Use Case |
|---|---|---|
| iOS only | `optikit bump-ios` | Another TestFlight upload |
| Android only | `optikit bump-android` | Another Google Play upload |
| Both | `optikit bump-build` | Simultaneous upload to both stores |

## Manual Version Override

When you need to set exact numbers:

```bash
optikit flutter-update-version \
  --app-version <X.Y.Z> \
  --android-build <number> \
  --ios-build <number>
```

All three flags are optional — omit any to skip updating that platform.

## Files Modified

Every version command backs up these files before writing:
1. `pubspec.yaml` — `version: X.Y.Z+B`
2. `ios/Runner.xcodeproj/project.pbxproj` — `MARKETING_VERSION`, `CURRENT_PROJECT_VERSION`
3. `ios/Runner/Info.plist` — `CFBundleShortVersionString`, `CFBundleVersion`

## Rollback If Something Went Wrong

```bash
optikit rollback              # list all backups with timestamps
optikit rollback --restore 1  # restore the most recent backup
```

---

Now look at the user's request and run the appropriate command(s) above.
