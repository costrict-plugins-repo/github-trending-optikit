# Sync OptiKit Documentation

You are the documentation maintainer for the OptiKit CLI project. Your job is to keep all documentation perfectly in sync with the actual source code after any change.

Run this workflow whenever:
- A new command is added or removed
- A command's flags, behavior, or output changes
- A new utility, service, or helper is added
- File structure changes
- Version bump logic changes
- Any source file in `src/` is modified

---

## Step 1 — Read the Source of Truth

Read these files to understand the current state of the code:

```
src/cli.ts                          ← all commands and their flags
src/constants.ts                    ← build flags, paths, retry config, error messages
src/commands/build/releases.ts      ← build command implementations
src/commands/clean/flutter.ts       ← flutter clean steps
src/commands/clean/ios.ts           ← ios clean steps + retry logic
src/commands/version/bump.ts        ← bump logic, iOS reset behavior
src/commands/version/update.ts      ← file write targets, backup triggers
src/commands/project/generate.ts    ← module template content, class naming
src/commands/project/devices.ts     ← device listing, run, run-select
src/commands/project/open.ts        ← open commands, OS-specific logic
src/commands/project/setup.ts       ← VSCode settings template
src/commands/config/init.ts         ← init defaults, gitignore logic
src/commands/config/rollback.ts     ← backup search, restore, grouping
src/utils/helpers/version.ts        ← version parsing, iOS build read source
src/utils/services/backup.ts        ← backup naming, retention, structure
src/utils/services/config.ts        ← config lookup order
src/utils/validators/validation.ts  ← what each validator checks
```

---

## Step 2 — Check What Changed

Compare what you read in Step 1 against each documentation file below. For each file, identify:
- Commands that no longer exist → remove them
- New commands → add them
- Changed flags or behavior → update descriptions
- Changed file paths or output paths → update references
- Changed retry counts, timeouts, or defaults → update numbers

---

## Step 3 — Update Each Doc File

Update all files that are out of sync. Do not touch files that are already accurate.

### `CLAUDE.md` (root)
Tracks the developer-facing architecture of the CLI itself. Update when:
- Folder structure changes (new command files, new utilities)
- New utility functions are added to helpers/services
- Adding new commands section changes
- FVM behavior, retry config, or version flow changes
- Important notes change (ES module rules, path patterns, etc.)

Key sections to check:
- Folder Structure tree
- Each utility module's function list
- Version Management Flow steps
- iOS Build Pattern retry numbers
- Adding New Commands checklist

### `docs/USAGE.md`
End-user command reference. Update when any command is added, removed, or its flags change.

Sections to check:
- Configuration Commands
- Version Management Commands
- Device Management Commands
- Build Commands
- Clean Commands
- Project Commands

### `docs/VERSION_MANAGEMENT.md`
Deep dive into version strategy. Update when:
- bump command behavior changes (especially iOS reset logic)
- New bump-* commands are added
- Files modified by version commands change
- Command reference table changes

### `docs/SAFETY_FEATURES.md`
Backup system and validation docs. Update when:
- New files get backed up
- Backup retention count changes
- New validators are added
- Error messages change

### `docs/INSTALLATION.md`
Update only if install method or prerequisites change.

### `docs/TROUBLESHOOT.md`
Update if new error messages are added or error handling changes.

### `OPTIKIT_AGENT.md` (root)
AI agent reference — the most important file to keep accurate. Update when ANYTHING changes:
- Any command flag, behavior, or output
- File paths modified by commands
- Retry counts, timeouts, defaults
- Class naming conventions in generate
- Backup structure or naming

### `.claude/commands/version.md`
Update when: bump commands change, files modified change, manual version flags change.

### `.claude/commands/build.md`
Update when: build flags change, output paths change, new artifact types added.

### `.claude/commands/clean.md`
Update when: clean steps change, retry config changes, new clean flags added.

### `.claude/commands/generate.md`
Update when: generated file structure changes, class naming changes, template content changes.

### `.claude/commands/run.md`
Update when: run flags change, device listing format changes, new run options added.

### `.claude/commands/rollback.md`
Update when: backup structure changes, new files are backed up, retention count changes.

### `.claude/commands/setup.md`
Update when: init defaults change, VSCode settings template changes, new setup commands added.

---

## Step 4 — Cross-Check References

After updating, verify:
- All file path references in `CLAUDE.md` match actual files in `src/`
- All `docs/` cross-links still point to files that exist in `docs/`
- `README.md` links to `docs/` files all use the `docs/` prefix
- `OPTIKIT_AGENT.md` command table has no missing or phantom commands vs `src/cli.ts`

---

## Step 5 — Report What Changed

After finishing, summarize:
1. Which docs were updated and why
2. Which docs were already accurate (no changes needed)
3. Any inconsistencies found that couldn't be auto-resolved
