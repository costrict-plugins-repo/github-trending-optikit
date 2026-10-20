# OptiKit Clean

Clean the Flutter or iOS project using the OptiKit CLI.

## Flutter Clean

Runs 3 steps in sequence: `flutter clean` → backup + delete `pubspec.lock` → `flutter pub get`

```bash
optikit clean-flutter             # with FVM (default)
optikit clean-flutter --disable-fvm  # without FVM
```

## iOS Clean (CocoaPods)

All pod operations run inside `ios/`, with **3 retries and 10s delay** per network operation.
OptiKit also auto-runs `flutter precache --ios` if `Flutter.xcframework` is missing.

| Command | Steps |
|---|---|
| `optikit clean-ios` | deintegrate → pod install |
| `optikit clean-ios --clean-cache` | deintegrate → pod cache clean → pod install |
| `optikit clean-ios --repo-update` | deintegrate → pod repo update → pod update |
| `optikit clean-ios --clean-cache --repo-update` | full nuclear clean |

## When to Use What

| Symptom | Solution |
|---|---|
| Weird build errors, stale cache | `optikit clean-flutter` |
| Pod version conflicts | `optikit clean-ios` |
| CocoaPods cache corrupt | `optikit clean-ios --clean-cache` |
| Outdated pod specs / repo issues | `optikit clean-ios --repo-update` |
| Everything broken after dependency update | `optikit clean-flutter` + `optikit clean-ios --clean-cache --repo-update` |

## Full Nuclear Clean

```bash
optikit clean-flutter
optikit clean-ios --clean-cache --repo-update
```

---

Now look at the user's request and run the appropriate clean command(s) above.
