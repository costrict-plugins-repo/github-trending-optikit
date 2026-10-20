# OptiKit Run & Devices

List connected devices and run the Flutter app using the OptiKit CLI.

## List Connected Devices

```bash
optikit devices               # with FVM (default)
optikit devices --disable-fvm
```

Shows: device number, name, platform, `[Emulator]` or `[Physical]`, and device ID.

## Run the App

### On Default Device

```bash
optikit run
optikit run --release          # release mode (-r)
optikit run --flavor <name>    # with flavor (-f)
optikit run --disable-fvm
```

### On a Specific Device

```bash
# First list devices to get the ID
optikit devices

# Then run on that device
optikit run --device <device-id>    # or -d <device-id>
optikit run -d <device-id> --release
optikit run -d <device-id> --flavor <name>
```

### Interactive Device Picker

Prompts for a numbered selection from the connected devices list:

```bash
optikit run-select
optikit run-select --release
optikit run-select --flavor <name>
optikit run-select --disable-fvm
```

## Typical Workflow

```bash
# See what's connected
optikit devices

# Pick interactively
optikit run-select

# Or target a specific device
optikit run -d emulator-5554
```

---

Now look at the user's request and run the appropriate device/run command(s) above.
