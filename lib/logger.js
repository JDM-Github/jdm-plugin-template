// ─────────────────────────────────────────────────────────────
//  jdm-plugin-template  —  lib/logger.js
//
//  Shared logging helpers used across all commands.
//  Import what you need:
//    import { ok, fail, info, warn, step, header } from "../logger.js";
//
//  All functions take (chalk, msg) so chalk stays injectable
//  and the plugin doesn't need to manage a global chalk ref.
// ─────────────────────────────────────────────────────────────

// ── Pretty-print helpers ──────────────────────────────────────
export function ok(chalk, msg) { console.log(chalk.green("    ✔  ") + msg); }
export function fail(chalk, msg) { console.log(chalk.red("    ✖  ") + msg); }
export function warn(chalk, msg) { console.log(chalk.yellow("    ⚠  ") + msg); }
export function info(chalk, msg) { console.log(chalk.gray("    ·  ") + msg); }

// ── Step counter line ─────────────────────────────────────────
//  step(chalk, 1, 3, "Doing the thing")  →  [1/3]  Doing the thing
export function step(chalk, n, total, label) {
    console.log();
    console.log(chalk.cyan(`  [${n}/${total}]`) + "  " + chalk.bold(label));
}

// ── Command header ────────────────────────────────────────────
//  header(chalk, "create")  →  jdm / your-namespace / create
//
//  Customize the namespace string to match your plugin.
export function header(chalk, command = "") {
    const ns = "plugin-template"; // ← replace with your namespace
    console.log();
    console.log(
        chalk.cyan("  jdm") +
        chalk.gray(" / ") +
        chalk.white(ns) +
        (command ? chalk.gray(" / ") + chalk.bold(command) : "")
    );
    console.log(chalk.gray("  ─────────────────────────────────────"));
    console.log();
}

// ── Section divider ───────────────────────────────────────────
export function divider(chalk) {
    console.log(chalk.gray("  ─────────────────────────────────────"));
}