# OptiKit Setup

Initialize OptiKit and configure the development environment for this Flutter project.

## Initialize OptiKit

Run once per project to create the config file and update `.gitignore`:

```bash
optikit init
```

Creates `.optikitrc.json`:

```json
{
  "backupRetentionCount": 5,
  "useFvmByDefault": true,
  "autoBackup": true,
  "verbose": false
}
```

Also appends `.optikit-backup/` to `.gitignore` automatically.
If config already exists, it warns and exits without overwriting.

## Configure VSCode for FVM

Creates `.vscode/settings.json` with Flutter/FVM settings:

```bash
optikit setup-vscode
```

Generated settings:

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

## Open IDE Projects

```bash
optikit open-ios      # open ios/Runner.xcworkspace in Xcode
optikit open-android  # open android/ in Android Studio
```

## Full Onboarding for a New Developer

```bash
optikit init           # config + .gitignore
optikit setup-vscode   # VSCode settings
optikit open-ios       # verify iOS project opens in Xcode
optikit open-android   # verify Android project opens in Android Studio
```

---

Now look at the user's request and run the appropriate setup command(s) above.
