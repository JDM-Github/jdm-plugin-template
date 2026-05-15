// ─────────────────────────────────────────────────────────────
//  jdm-plugin-template  —  lib/commands/clean.js
//
//  The "clean" command removes build artifacts and temp files.
//
//  This template shows:
//    ✔  How to remove folders/files with existence checks
//    ✔  How to give the user a dry-run option (--dry)
//    ✔  Pattern for defining what to clean in one place
// ─────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { checkCompat } from "../config.js";
import { ok, warn, info, header, divider } from "../logger.js";

// ── Define everything that should be cleaned here ─────────────
//  Each entry is relative to process.cwd().
//  Add/remove paths to match your plugin's output structure.
const CLEAN_TARGETS = [
    "dist",
    "build",
    ".cache",
    // "some-other-artifact-folder",
];

// ─────────────────────────────────────────────────────────────
//  Main export
//  Signature: clean(chalk, args)
// ─────────────────────────────────────────────────────────────
export default async function clean(chalk, args = []) {
    header(chalk, "clean");

    // ── Guard: must be inside a valid project ─────────────────
    if (!checkCompat(chalk, "clean")) return;

    // ── Flags ─────────────────────────────────────────────────
    //  --dry   Print what would be deleted without deleting it
    const dry = args.includes("--dry");
    if (dry) info(chalk, chalk.yellow("Dry run — nothing will be deleted"));

    const root = process.cwd();
    let removed = 0;

    for (const target of CLEAN_TARGETS) {
        const fullPath = path.join(root, target);

        if (!fs.existsSync(fullPath)) {
            // Skip silently — already clean
            continue;
        }

        if (dry) {
            warn(chalk, `Would remove: ${chalk.cyan(target)}`);
        } else {
            fs.rmSync(fullPath, { recursive: true, force: true });
            ok(chalk, `Removed ${chalk.cyan(target)}`);
            removed++;
        }
    }

    if (removed === 0 && !dry) {
        info(chalk, "Nothing to clean.");
    }

    console.log();
    divider(chalk);
    console.log(dry
        ? chalk.yellow("    ⚠  Dry run complete — no files deleted")
        : chalk.green("    ✔  Clean complete!")
    );
    divider(chalk);
    console.log();
}