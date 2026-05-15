// ─────────────────────────────────────────────────────────────
//  jdm-plugin-template  —  lib/compat.js
//
//  Single source of truth for version compatibility.
//
//  HOW IT WORKS
//  ─────────────
//  • `pluginVersion`  – the version of THIS plugin (bump on releases)
//  • `COMPAT.global`  – minimum project version required by ALL commands
//  • `COMPAT.commands`– per-command overrides (takes priority over global)
//
//  RANGE SYNTAX (no external deps)
//  ────────────────────────────────
//  ">=1.0.0"           project created with plugin 1.0.0 or newer
//  "<=2.0.0"           project created with plugin 2.0.0 or older
//  "1.0.0"             exact version only
//  ">=1.0.0||<=0.9.5"  union (rare — use sparingly)
//
//  WHEN TO BUMP
//  ─────────────
//  • You change a template repo structure that breaks an existing command
//    → bump COMPAT.commands[thatCommand] to ">=<new-plugin-version>"
//  • You change something that affects ALL commands (e.g. config layout)
//    → bump COMPAT.global
//  • You add a brand-new command that doesn't touch existing templates
//    → no bump needed
// ─────────────────────────────────────────────────────────────

export const pluginVersion = "1.0.0";

export const COMPAT = {

    // Every command: project must have been created with >= this version.
    // Set to null to disable the global check.
    global: ">=1.0.0",

    // Per-command overrides.
    // Only add an entry here when a command needs a tighter requirement
    // than the global range.
    commands: {
        // "build": ">=1.0.0",
    },
};