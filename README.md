<h1 align="center">🚀 OptiKit CLI</h1>

<p align="center">
  <strong>Build, version, and deploy Flutter apps in one CLI.</strong><br/>
  The command-line toolkit for Flutter & Opticore developers.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/optikit"><img src="https://img.shields.io/npm/v/optikit?style=flat-square&color=cyan&label=npm" alt="npm"/></a>
  <a href="https://flutter.dev"><img src="https://img.shields.io/badge/Flutter-Compatible-02569B?style=flat-square&logo=flutter&logoColor=white" alt="Flutter"/></a>
  <a href="https://claude.com/plugins/optikit"><img src="https://img.shields.io/badge/Claude%20Code-Plugin-blueviolet?style=flat-square" alt="Claude Code Plugin"/></a>
  <img src="https://img.shields.io/badge/MCP-Supported-orange?style=flat-square" alt="MCP Supported"/>
  <img src="https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-blue?style=flat-square" alt="Platform"/>
  <a href="https://pub.dev/packages/opticore"><img src="https://img.shields.io/badge/Opticore-pub.dev-teal?style=flat-square" alt="Opticore"/></a>
  <a href="https://www.linkedin.com/in/dev-mahmoud-elshenawy/"><img src="https://img.shields.io/badge/Creator-Mahmoud%20El%20Shenawy-blue?style=flat-square" alt="Creator"/></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License"/></a>
</p>

<p align="center">
  <a href="https://www.buymeacoffee.com/m.elshenawy">
    <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support%20My%20Work-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=0D1117" alt="Buy Me A Coffee"/>
  </a>
</p>

---

## ⚡ Install & Go

```bash
npm install -g optikit
```

You get two commands — `optikit` (full name) and `ok` (shorthand). Both work identically.

```bash
optikit init                    # 🔧 Setup OptiKit in your project
optikit bump patch              # 📦 1.0.0 → 1.0.1
optikit apk                     # 🏗️ Build release APK
optikit tf -o                   # 🚀 TestFlight: bump iOS + build IPA + open
optikit gen module login -r     # 🧩 Generate BLoC module with route
optikit aliases                 # 📋 See all shortcuts
```

> 💡 Prefer shorter commands? Use `ok` instead of `optikit` — every example above works with both.

---

## 🔥 Why OptiKit?

| Feature | Description |
|---------|-------------|
| 🤖 **Claude Code Plugin** | AI understands your project and acts on it via MCP |
| ✅ **Short aliases** | Every command has a memorable shortcut |
| ✅ **Combo flags** | Clean, bump, build, and open in one command |
| ✅ **Smart versioning** | Dual iOS/Android build numbers handled automatically |
| ✅ **Auto backups** | Version files backed up before every change |
| ✅ **Module scaffolding** | Full BLoC pattern generated in one command |
| ✅ **FVM support** | Built-in Flutter Version Manager integration |

---

## 📖 Commands at a Glance

> Every command has a short alias. Run `optikit aliases` to see the full list in your terminal.

### 🏗️ Build

| Command | Alias | What it does |
|---------|-------|-------------|
| `optikit flutter-build-apk` | `apk` | Build release APK |
| `optikit flutter-build-bundle` | `aab` | Build release AAB |
| `optikit flutter-build-ios` | `ios` | Build iOS app |
| `optikit flutter-build-ipa` | `ipa` | Build release IPA |
| `optikit testflight` | `tf` | Bump iOS build + build IPA |

**Combo flags** — mix and match on any build command:

```bash
optikit apk --clean             # 🧹 Clean → build
optikit ipa -b patch -o         # 📦 Bump → build → open output
optikit ipa --clean -i -o       # 🧹 Clean → bump iOS → build → open
optikit tf -o                   # 🚀 TestFlight → open output
```

### 🧹 Clean

| Command | Alias | What it does |
|---------|-------|-------------|
| `optikit clean` | `c` | Clean Flutter project |
| `optikit clean-flutter` | `cf` | Clean Flutter (explicit) |
| `optikit clean-ios` | `ci` | Clean iOS / CocoaPods |

```bash
optikit clean -a                # Clean all (Flutter + iOS)
optikit ci -cu                  # Clean iOS + cache + repo update
```

### 📦 Version

| Command | Alias | What it does |
|---------|-------|-------------|
| `optikit version` | `v` | Show current version |
| `optikit bump patch` | | Bug fix: 1.0.0 → 1.0.1 |
| `optikit bump minor` | | Feature: 1.0.0 → 1.1.0 |
| `optikit bump major` | | Breaking: 1.0.0 → 2.0.0 |
| `optikit bump-ios` | `bi` | Bump iOS build only |
| `optikit bump-android` | `ba` | Bump Android build only |
| `optikit bump-build` | `bb` | Bump both build numbers |

> 📘 Deep dive: **[Version Management](docs/VERSION_MANAGEMENT.md)**

### 🧩 Generate

```bash
optikit gen module login        # Scaffold BLoC module
optikit gen module login -r     # Scaffold + register route
optikit gen repo user           # Generate repository
optikit route settings          # Add route to app_router.dart
```

### 📱 Run & Open

```bash
optikit run                     # Run app on device
optikit rs                      # Interactive device picker
optikit devs                    # List connected devices
optikit xcode                   # Open in Xcode
optikit studio                  # Open in Android Studio
```

### 🔧 Tools

```bash
optikit info                    # Project status snapshot
optikit dr                      # Environment health check
optikit undo                    # List/restore backups
optikit up                      # Check for CLI updates
optikit vscode                  # Setup VS Code settings
```

---

## 🎯 Common Workflows

```bash
# 🚀 TestFlight upload
optikit tf -o

# 📦 Release APK with version bump
optikit apk -b patch -o

# 🧹 Full clean rebuild
optikit ipa --clean -o

# 🧩 New feature module
optikit gen module user_profile -r

# 🔍 Check project state
optikit info
```

---

## ⚙️ Configuration

```bash
optikit init                    # Creates .optikitrc.json
```

```json
{
  "backupRetentionCount": 5,
  "useFvmByDefault": true,
  "autoBackup": true
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `backupRetentionCount` | `5` | Number of backups to keep per file |
| `useFvmByDefault` | `true` | Use FVM for all Flutter commands |
| `autoBackup` | `true` | Backup files before version changes |

---

## 💾 Backups & Rollback

OptiKit **automatically backs up** version files before any modification:

| File | Backed up before |
|------|-----------------|
| `pubspec.yaml` | Version bumps, clean |
| `ios/Runner.xcodeproj/project.pbxproj` | Version bumps |
| `ios/Runner/Info.plist` | Version bumps |

Backups are stored in `.optikit-backup/` directories next to the original files with timestamps:

```
your-project/
├── pubspec.yaml
├── .optikit-backup/
│   ├── pubspec_2026-03-25T10-30-00-000Z.yaml
│   └── pubspec_2026-03-25T11-15-30-000Z.yaml
└── ios/Runner.xcodeproj/
    ├── project.pbxproj
    └── .optikit-backup/
        └── project_2026-03-25T10-30-00-000Z.pbxproj
```

**Manage backups:**

```bash
optikit undo                    # 📋 List all backups
optikit undo --restore 1        # ♻️ Restore backup #1
optikit undo --before 2026-03-20  # 📅 Filter backups by date
```

Old backups are automatically cleaned up (keeps last 5 by default, configurable via `backupRetentionCount`).

> 💡 `.optikit-backup/` is added to `.gitignore` during `optikit init`.

---

## 🤖 AI-Powered with Claude Code

OptiKit ships as a **Claude Code plugin** powered by the **Model Context Protocol (MCP)**. Claude doesn't just run commands — it **understands your Flutter project** and makes intelligent decisions.

### 🧠 How It Works

You describe what you need. Claude **picks the right tools automatically**:

| You say | Claude does |
|---------|-----------|
| *"Fix this build error"* | Runs `clean` → `build` automatically |
| *"Prepare a TestFlight build"* | Runs `testflight` (bump iOS + build IPA) |
| *"Create a login feature"* | Generates BLoC module + registers route |
| *"We need to release v2.0"* | Bumps major version + builds both platforms |
| *"What version are we on?"* | Shows version with iOS & Android build numbers |
| *"Undo the last version bump"* | Lists backups and restores the right one |

### ⚡ Setup in Seconds

**Option 1 — Plugin Marketplace:**
```bash
/plugin marketplace add dev-mahmoud-elshenawy/optikit
/plugin install optikit
```

**Option 2 — One Command:**
```bash
optikit setup-claude
```

That's it. All OptiKit tools are instantly available to Claude.

### 🛠️ Available Tool Categories

| Category | What Claude can do |
|----------|--------------------|
| 🏗️ **Build** | Build APK, AAB, iOS, IPA with clean/bump/open combos |
| 🧹 **Clean** | Fix stale caches, CocoaPods issues, full project cleanup |
| 📦 **Version** | Bump versions, manage iOS/Android build numbers independently |
| 🧩 **Generate** | Scaffold BLoC modules, repositories, and auto-register routes |
| 📱 **Run** | Launch app on devices, list connected devices |
| 🔧 **Diagnostics** | Health checks, project status, backup management |
| ⚙️ **Config** | Project setup, VS Code config, upgrade checks |

The MCP server runs locally via stdio — fast, private, no cloud dependency.

```bash
optikit setup-claude              # ✅ Register with Claude Code
optikit setup-claude --uninstall  # ❌ Remove when needed
```

---

## 📘 Documentation

| Doc | Description |
|-----|-------------|
| 📖 **[Command Reference](docs/USAGE.md)** | All commands, flags, and examples |
| 📦 **[Version Management](docs/VERSION_MANAGEMENT.md)** | iOS/Android dual build strategy |
| 🔧 **[Installation Guide](docs/INSTALLATION.md)** | NPM, Homebrew, source install |
| 🔍 **[Troubleshooting](docs/TROUBLESHOOT.md)** | Common issues and quick fixes |

---

## ⚡ Supercharge Development with Opticore

**OptiKit CLI** is the companion tool for **[Opticore](https://pub.dev/packages/opticore)** — a lightweight BLoC-based micro-framework for Flutter.

| Together they give you | |
|---|---|
| 🧩 **Module scaffolding** | Generate full BLoC modules that plug directly into Opticore |
| 🛣️ **Auto-routing** | Register routes in `app_router.dart` with one flag |
| 🏗️ **App initialization** | Scaffold `main.dart`, config, and router for Opticore projects |
| 📦 **Smart builds** | Build, version, and clean with short commands and combo flags |

> 💡 **Not using Opticore?** No problem — build, version, clean, and run commands work with **any Flutter project**.

---

## 👤 Created By

<div align="center">

### Built with ❤️ by [Mahmoud El Shenawy](https://github.com/dev-mahmoud-elshenawy)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?logo=linkedin&logoColor=white&style=for-the-badge)](https://www.linkedin.com/in/dev-mahmoud-elshenawy)
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white&style=for-the-badge)](https://github.com/dev-mahmoud-elshenawy)
[![Medium](https://img.shields.io/badge/Medium-000000?logo=medium&logoColor=white&style=for-the-badge)](https://medium.com/@dev-mahmoud-elshenawy)

</div>

---

## 📜 License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

**OptiKit** is open-source under the **[MIT License](./LICENSE)**. Free for personal and commercial use.
