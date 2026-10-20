# 🔍 Troubleshooting

Quick fixes for common OptiKit issues.

---

## ❌ `optikit` or `ok` command not found

```bash
# Reinstall globally
npm install -g optikit

# Verify
optikit --version
```

If still not found, check your npm global bin is in PATH:

```bash
npm bin -g
# Add the output path to your shell config if missing
```

---

## ❌ FVM not found

```
✖ FVM Flutter SDK not found at .fvm/flutter_sdk
```

**Fix:** Install FVM and set up the project:

```bash
fvm install
fvm use <version>
```

Or skip FVM for this command:

```bash
optikit apk -f                  # -f = --disable-fvm
```

Or disable FVM globally in `.optikitrc.json`:

```json
{
  "useFvmByDefault": false
}
```

---

## ❌ Not a Flutter project

```
✖ Not a Flutter project: pubspec.yaml not found.
```

**Fix:** Run OptiKit from the **root** of your Flutter project (where `pubspec.yaml` is).

---

## ❌ iOS / Android project not found

```
✖ iOS project directory not found.
✖ Android project directory not found.
```

**Fix:** Add platform support:

```bash
flutter create .                # Adds missing ios/ and android/ directories
```

---

## ❌ Build fails

1. **Check environment first:**

```bash
optikit dr                      # Doctor checks Flutter, FVM, platforms
```

2. **Try a clean build:**

```bash
optikit apk --clean             # Clean before building
optikit ipa --clean             # Clean before building (iOS)
```

3. **For iOS CocoaPods issues:**

```bash
optikit ci -cu                  # Clean iOS + clear cache + update repo
```

---

## ❌ Wrong version after bump

**Check current state:**

```bash
optikit v                       # Show current version info
```

**Restore from backup:**

```bash
optikit undo                    # List all backups
optikit undo --restore 1        # Restore the most recent backup
```

---

## ❌ Module generation overwrites existing files

OptiKit warns before overwriting. If you accidentally overwrote:

```bash
# Check git for the original
git diff lib/module/<module_name>/
git checkout -- lib/module/<module_name>/
```

---

## 💡 General Tips

| Tip | Command |
|-----|---------|
| Check environment health | `optikit dr` |
| Preview without executing | `optikit apk --dry-run` |
| See all available commands | `optikit aliases` |
| Get help for any command | `optikit <command> --help` |
| Check for CLI updates | `optikit up` |
