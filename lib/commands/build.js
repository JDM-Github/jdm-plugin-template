// ─────────────────────────────────────────────────────────────
//  jdm-plugin-template  —  lib/commands/build.js
//
//  The "build" command compiles / packages your project.
//
//  This template shows:
//    ✔  Multi-flag build stages (--frontend, --backend, --full)
//    ✔  How to shell out to build tools (npm run build, etc.)
//    ✔  How to copy output files to a destination folder
//    ✔  Graceful error handling per stage
//
//  Rename to compile.js / bundle.js / package.js — whatever
//  makes sense for your plugin.
// ─────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { checkCompat } from "../config.js";
import { ok, fail, info, warn, step, header, divider } from "../logger.js";

// ─────────────────────────────────────────────────────────────
//  Internal exec helper
// ─────────────────────────────────────────────────────────────
function exec(cmd, opts = {}) {
    try {
        execSync(cmd, { ...opts, stdio: "pipe" });
    } catch (err) {
        const out = [err.stdout?.toString(), err.stderr?.toString()].filter(Boolean).join("\n");
        throw new Error(out || err.message);
    }
}

// ─────────────────────────────────────────────────────────────
//  Build stages  (each is its own function — easy to compose)
// ─────────────────────────────────────────────────────────────

/**
 * Example "frontend" stage.
 * Replace with your actual frontend build command + output path.
 */
function buildFrontend(chalk, root) {
    // const frontendDir = path.join(root, "frontend");
    // info(chalk, "Building frontend...");
    // exec("npm run build", { cwd: frontendDir });
    // ok(chalk, "Frontend built");

    // Placeholder
    info(chalk, "buildFrontend placeholder — wire up your build command.");
    ok(chalk, "Frontend stage done (placeholder)");
}

/**
 * Example "backend" stage.
 * Replace with your backend compile/package command.
 */
function buildBackend(chalk, root) {
    // const backendDir = path.join(root, "backend");
    // info(chalk, "Packaging backend...");
    // exec("python build.py", { cwd: backendDir });
    // ok(chalk, "Backend packaged");

    info(chalk, "buildBackend placeholder — wire up your build command.");
    ok(chalk, "Backend stage done (placeholder)");
}

// ─────────────────────────────────────────────────────────────
//  Main export
//  Signature: build(chalk, args)
// ─────────────────────────────────────────────────────────────
export default async function build(chalk, args = []) {
    header(chalk, "build");

    // ── Guard ─────────────────────────────────────────────────
    if (!checkCompat(chalk, "build")) return;

    // ── Parse flags ───────────────────────────────────────────
    //  --frontend   build only the frontend
    //  --backend    build only the backend
    //  --full       build everything (same as --frontend --backend)
    const doFrontend = args.includes("--frontend") || args.includes("--full");
    const doBackend = args.includes("--backend") || args.includes("--full");
    const doAll = !doFrontend && !doBackend;   // no flags → build all

    const root = process.cwd();
    let stageN = 1;
    const total = (doAll ? 2 : 0) + (doFrontend ? 1 : 0) + (doBackend ? 1 : 0);

    try {
        if (doFrontend || doAll) {
            step(chalk, stageN++, total, "Frontend");
            buildFrontend(chalk, root);
        }

        if (doBackend || doAll) {
            step(chalk, stageN++, total, "Backend");
            buildBackend(chalk, root);
        }
    } catch (err) {
        fail(chalk, `Build failed: ${err.message}`);
        return;
    }

    console.log();
    divider(chalk);
    console.log(chalk.green("    ✔  Build complete!"));
    divider(chalk);
    console.log();
}