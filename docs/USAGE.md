# 📖 Command Reference

> Use `optikit` or `ok` — both work identically. Run `optikit aliases` to see all shortcuts.

---

## 🏗️ Build

| Command | Alias | Description |
|---------|-------|-------------|
| `optikit flutter-build-apk` | `apk` | Build release APK |
| `optikit flutter-build-bundle` | `aab` | Build release AAB |
| `optikit flutter-build-ios` | `ios` | Build iOS app |
| `optikit flutter-build-ipa` | `ipa` | Build release IPA |
| `optikit testflight` | `tf` | Bump iOS build + build IPA |

### ⚡ Combo Flags

Mix and match on any build command:

```bash
optikit apk --clean             # 🧹 Clean before building
optikit apk -o                  # 📂 Open output folder after build
optikit apk -b patch            # 📦 Bump patch version before build
optikit apk -b minor -o         # 📦 Bump minor + build + open
optikit ipa -i                  # 📱 Bump iOS build number before build
optikit ipa --clean -i -o       # 🚀 Full workflow: clean → bump iOS → build → open
optikit tf -o                   # 🚀 TestFlight + open output
```

| Flag | Short | Applies to |
|------|-------|-----------|
| `--clean` | | apk, aab, ios, ipa |
| `--open` | `-o` | apk, aab, ipa, tf |
| `--bump <type>` | `-b` | apk, aab, ios, ipa |
| `--bump-ios` | `-i` | ipa |
| `--disable-fvm` | `-f` | all |

---

## 🧹 Clean

| Command | Alias | Description |
|---------|-------|-------------|
| `optikit clean` | `c` | Clean Flutter project |
| `optikit clean-flutter` | `cf` | Clean Flutter (explicit) |
| `optikit clean-ios` | `ci` | Clean iOS / CocoaPods |

```bash
optikit clean -a                # Clean all (Flutter + iOS)
optikit clean -i                # Clean Flutter + also iOS
optikit ci -c                   # Clean iOS + clear cache
optikit ci -u                   # Clean iOS + update repo
optikit ci -cu                  # Clean iOS + cache + repo update
```

| Flag | Short | Command |
|------|-------|---------|
| `--all` | `-a` | clean |
| `--ios` | `-i` | clean |
| `--clean-cache` | `-c` | clean-ios |
| `--repo-update` | `-u` | clean-ios |
| `--disable-fvm` | `-f` | clean, clean-flutter |

---

## 📦 Version & Bump

| Command | Alias | Description |
|---------|-------|-------------|
| `optikit version` | `v` | Show current version info |
| `optikit bump patch` | | Bug fix: 1.0.0 → 1.0.1 |
| `optikit bump minor` | | Feature: 1.0.0 → 1.1.0 |
| `optikit bump major` | | Breaking: 1.0.0 → 2.0.0 |
| `optikit bump-ios` | `bi` | Bump iOS build only |
| `optikit bump-android` | `ba` | Bump Android build only |
| `optikit bump-build` | `bb` | Bump both build numbers |
| `optikit flutter-update-version` | `vset` | Set version manually |

```bash
optikit vset --app-version 2.0.0 --android-build 10 --ios-build 1
```

Add `-y` to skip confirmation: `optikit bump patch -y`

> 📘 Deep dive: **[Version Management](VERSION_MANAGEMENT.md)**

---

## 🧩 Generate

| Command | Alias | Description |
|---------|-------|-------------|
| `optikit generate module <name>` | `gen module` | Scaffold BLoC module |
| `optikit generate repo <name>` | `gen repo` | Generate repository file |
| `optikit add-route <name>` | `route` | Add route to app_router.dart |

```bash
optikit gen module login -r     # 🧩 Scaffold + register route
```

Module creates: `bloc`, `event`, `state`, `screen`, `factory`, and `imports` files.

---

## 📱 Run & Devices

| Command | Alias | Description |
|---------|-------|-------------|
| `optikit run` | | Run app on connected device |
| `optikit run-select` | `rs` | Interactive device picker |
| `optikit devices` | `devs` | List connected devices |

```bash
optikit run -r                  # Run in release mode
optikit run -d <id>             # Run on specific device
optikit rs -r                   # Pick device + release mode
```

---

## 🔗 Open

| Command | Alias | Description |
|---------|-------|-------------|
| `optikit open-ios` | `xcode` | Open in Xcode |
| `optikit open-android` | `studio` | Open in Android Studio |
| `optikit open-ipa` | | Open IPA output folder |
| `optikit open-apk` | | Open APK output folder |
| `optikit open-bundle` | | Open AAB output folder |

> 💡 Use `optikit ipa -o` or `optikit apk -o` to build and open in one step.

---

## 🔧 Config & Tools

| Command | Alias | Description |
|---------|-------|-------------|
| `optikit init` | | Initialize OptiKit config |
| `optikit init-app` | | Scaffold Opticore app structure |
| `optikit setup-vscode` | `vscode` | Create VS Code Flutter settings |
| `optikit rollback` | `undo` | List/restore file backups |
| `optikit status` | `info` | Project status snapshot |
| `optikit doctor` | `dr` | Environment health check |
| `optikit upgrade` | `up` | Check for CLI updates |
| `optikit aliases` | | Show all aliases & shortcuts |

```bash
optikit undo --restore 1        # Restore backup #1
optikit undo --before 2026-03-20  # Show backups before date
```

---

## 🌐 Global Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--dry-run` | | Preview without executing |
| `--disable-fvm` | `-f` | Use global Flutter SDK |
| `--help` | | Show command help |
| `--version` | | Show CLI version |

---

## 📋 All Aliases

| Alias | Command | Alias | Command |
|-------|---------|-------|---------|
| `apk` | flutter-build-apk | `gen` | generate |
| `aab` | flutter-build-bundle | `route` | add-route |
| `ios` | flutter-build-ios | `xcode` | open-ios |
| `ipa` | flutter-build-ipa | `studio` | open-android |
| `tf` | testflight | `vscode` | setup-vscode |
| `c` | clean | `devs` | devices |
| `cf` | clean-flutter | `rs` | run-select |
| `ci` | clean-ios | `info` | status |
| `v` | version | `dr` | doctor |
| `bi` | bump-ios | `undo` | rollback |
| `ba` | bump-android | `up` | upgrade |
| `bb` | bump-build | | |
| `vset` | flutter-update-version | | |

Or run `optikit aliases` to see this in your terminal.
