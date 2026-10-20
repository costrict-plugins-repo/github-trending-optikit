# OptiKit Rollback

Inspect and restore automatic OptiKit backups for this Flutter project.

## How Backups Work

OptiKit automatically backs up files before modifying them:

| Command | Files Backed Up |
|---|---|
| `bump patch/minor/major` | `pubspec.yaml`, `project.pbxproj`, `Info.plist` |
| `bump-ios`, `bump-android`, `bump-build` | `pubspec.yaml`, `project.pbxproj`, `Info.plist` |
| `flutter-update-version` | `pubspec.yaml`, `project.pbxproj`, `Info.plist` |
| `clean-flutter` | `pubspec.lock` |

Backups live in `.optikit-backup/` next to each original file. Last 5 kept per file.

## List All Backups

```bash
optikit rollback
```

Output is grouped by original file, sorted newest first, with timestamps and sizes:

```
pubspec.yaml
  [1] 12/23/2025, 10:30:00 AM (5m ago, 2.14 KB)
  [2] 12/23/2025, 9:15:00 AM (1h ago, 2.13 KB)

ios/Runner.xcodeproj/project.pbxproj
  [3] 12/23/2025, 10:30:00 AM (5m ago, 48.2 KB)
```

## Restore a Specific Backup

```bash
optikit rollback --restore <number>
```

Example — restore the most recent pubspec.yaml backup:

```bash
optikit rollback --restore 1
```

## Backup File Structure

```
your-flutter-project/
├── pubspec.yaml
├── .optikit-backup/
│   └── pubspec_2025-12-23T10-30-00-000Z.yaml
└── ios/
    ├── Runner.xcodeproj/
    │   └── .optikit-backup/
    │       └── project_2025-12-23T10-30-00-000Z.pbxproj
    └── Runner/
        └── .optikit-backup/
            └── Info_2025-12-23T10-30-00-000Z.plist
```

> `.optikit-backup/` is gitignored automatically by `optikit init`.

---

Now look at the user's request — list backups or restore the one they need.
