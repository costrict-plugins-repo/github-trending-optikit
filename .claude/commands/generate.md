# OptiKit Generate Module

Scaffold a complete BLoC pattern module for the Opticore framework using the OptiKit CLI.

> Only for projects using the [Opticore](https://pub.dev/packages/opticore) package.

## Command

```bash
optikit generate module <module_name>
```

**Name rules:** `snake_case` only — lowercase letters, numbers, underscores. No hyphens, no spaces, no uppercase.

## What Gets Generated

Running `optikit generate module user_profile` creates:

```
lib/module/user_profile/
├── import/   user_profile_import.dart   ← central hub (imports flutter + opticore, declares all parts)
├── bloc/     user_profile_bloc.dart     ← UserProfileBloc extends BaseBloc
├── event/    user_profile_event.dart    ← UserProfileInitialEvent extends BaseEvent
├── state/    user_profile_state.dart    ← UserProfileInitialState extends RenderDataState
├── screen/   user_profile_screen.dart   ← UserProfileScreen extends StatefulWidget + BaseScreen
└── factory/  user_profile_factory.dart  ← UserProfileStateFactory extends BaseFactory
```

## Class Naming

`user_profile` → prefix `UserProfile` (snake_case → PascalCase, no suffix on prefix):

| File | Class |
|---|---|
| `user_profile_bloc.dart` | `UserProfileBloc` |
| `user_profile_event.dart` | `UserProfileInitialEvent` |
| `user_profile_state.dart` | `UserProfileInitialState` |
| `user_profile_screen.dart` | `UserProfileScreen` |
| `user_profile_factory.dart` | `UserProfileStateFactory` |

## Generated Import File

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

## After Generation

Wire the new screen into your router. The module is fully self-contained via the `part of` system — just import `user_profile_import.dart` where you need access to the screen or bloc.

> If the module already exists, files are overwritten without stopping — OptiKit shows a warning but continues.

---

Now look at the user's request, determine the module name in snake_case, and run the command above.
