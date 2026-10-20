# 📦 Version Management

OptiKit handles Flutter's dual build number system (iOS + Android) automatically.

---

## 🎯 The Problem

Flutter apps have **two independent build numbers**:

| Platform | Where | Rule |
|----------|-------|------|
| 🤖 **Android** | `pubspec.yaml` (`1.0.0+5`) | Must always increase |
| 🍎 **iOS** | Xcode project files | Resets per version |

Different stores, different rules. OptiKit handles both.

---

## 📋 Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `optikit version` | `v` | Show current version |
| `optikit bump patch` | | Bug fix: 1.0.0 → 1.0.1 |
| `optikit bump minor` | | Feature: 1.0.0 → 1.1.0 |
| `optikit bump major` | | Breaking: 1.0.0 → 2.0.0 |
| `optikit bump-ios` | `bi` | Bump iOS build only |
| `optikit bump-android` | `ba` | Bump Android build only |
| `optikit bump-build` | `bb` | Bump both build numbers |
| `optikit testflight` | `tf` | Bump iOS + build IPA |
| `optikit flutter-update-version` | `vset` | Set version manually |

---

## ⚙️ What Each Command Does

### `optikit bump <type>` — New Version Release

| | Version | Android Build | iOS Build |
|---|---------|--------------|-----------|
| Before | 1.0.2 | +45 | 3 |
| After `bump patch` | **1.0.3** | **+46** | **1** (reset) |

✅ Increments version &nbsp; ✅ Increments Android build &nbsp; ✅ Resets iOS build to 1

### `optikit bump-ios` — TestFlight Upload

| | Version | Android Build | iOS Build |
|---|---------|--------------|-----------|
| Before | 1.0.3 | +46 | 1 |
| After `bi` | 1.0.3 | +46 | **2** |

Only iOS build changes. Perfect for multiple TestFlight iterations.

### `optikit bump-android` — Play Store Upload

| | Version | Android Build | iOS Build |
|---|---------|--------------|-----------|
| Before | 1.0.3 | +46 | 2 |
| After `ba` | 1.0.3 | **+47** | 2 |

Only Android build changes.

### `optikit bump-build` — Both Platforms

Increments both Android and iOS build numbers. Version stays the same.

---

## 🚀 Real Workflows

### 📱 TestFlight Iterations

```bash
optikit bump minor              # New version: 1.3.0 (iOS build: 1)
optikit tf -o                   # Build 1 → TestFlight + open
# ... fix a bug ...
optikit tf -o                   # Build 2 → TestFlight + open
# ... another fix ...
optikit tf -o                   # Build 3 → TestFlight + open
```

### 🤖 Android Hotfix

```bash
optikit ba                      # Bump Android build only
optikit apk -o                  # Build + open APK
```

### 🔄 Complete Release Cycle

```bash
# Start: 1.0.2+10 (iOS: 5)
optikit bump minor              # → 1.1.0+11 (iOS: 1)

# TestFlight testing
optikit tf                      # iOS: 2
optikit tf                      # iOS: 3
optikit tf                      # iOS: 4

# Android testing
optikit ba                      # Android: 12

# Bug found, patch it
optikit bump patch              # → 1.1.1+13 (iOS: 1)

# Final builds
optikit tf -o                   # iOS: 2, open output
optikit apk -o                  # Android: 13, open output

# 🚀 Ship it!
```

---

## 📁 Files Updated

Every version command updates up to 3 files:

| File | What changes |
|------|-------------|
| `pubspec.yaml` | `version: X.Y.Z+B` |
| `ios/Runner.xcodeproj/project.pbxproj` | `MARKETING_VERSION`, `CURRENT_PROJECT_VERSION` |
| `ios/Runner/Info.plist` | `CFBundleShortVersionString`, `CFBundleVersion` |

All files are **backed up automatically** before changes. Use `optikit undo` to restore.

---

## 🔢 Version Format

```
pubspec.yaml:  version: 1.2.3+45
                         │ │ │  │
                         │ │ │  └── Android build number
                         │ │ └──── Patch
                         │ └────── Minor
                         └──────── Major

iOS (separate):
  CFBundleShortVersionString: 1.2.3    (display version)
  CFBundleVersion:            1, 2, 3  (build number, resets per version)
```

---

## ❓ Why iOS Resets to 1

App Store Connect requires unique build numbers **per version**, not globally:

```
📱 Version 1.0.0
   Build 1, Build 2, Build 3 ✅ Released

📱 Version 1.0.1
   Build 1  ← starts fresh
   Build 2, Build 3 ✅ Released
```

Android is the opposite — Google Play requires **strictly increasing** build numbers across all versions.

OptiKit handles both strategies automatically.

---

## 📊 Quick Reference

| Command | Version | Android | iOS | Use case |
|---------|---------|---------|-----|----------|
| `bump patch` | +0.0.1 | +1 | Reset to 1 | 🐛 Bug fix |
| `bump minor` | +0.1.0 | +1 | Reset to 1 | ✨ New feature |
| `bump major` | +1.0.0 | +1 | Reset to 1 | 💥 Breaking change |
| `bi` | -- | -- | +1 | 📱 TestFlight |
| `ba` | -- | +1 | -- | 🤖 Play Store |
| `bb` | -- | +1 | +1 | 📱🤖 Both |
| `tf` | -- | -- | +1 + build IPA | 🚀 TestFlight shortcut |
