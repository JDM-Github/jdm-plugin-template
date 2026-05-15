// ─────────────────────────────────────────────────────────────
//  jdm-plugin-template  —  lib/commands/install.js
//
//  The "install" command installs dependencies for the project.
//
//  This template shows:
//    ✔  Running npm install / pip install per sub-folder
//    ✔  Checking for package.json / requirements.txt before running
//    ✔  Reporting success/failure per package manager
// ─────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { checkCompat } from "../config.js";
import { ok, fail, warn, info, step, header, divider } from "../logger.js";

// ── Directories to install deps for ───────────────────────────
//  Each entry:
//    dir     → subfolder relative to project root
//    type    → "npm" | "pip"
//
//  Add, remove, or reorder as your plugin needs.
const INSTALL_TARGETS = [
    { dir: ".", type: "npm" }
    // { dir: "frontend", type: "npm" },
    // { dir: "backend",  type: "pip" },
];

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
//  Main export
//  Signature: install(chalk, args)
// ─────────────────────────────────────────────────────────────
export default async function install(chalk, args = []) {
    header(chalk, "install");

    // ── Guard ─────────────────────────────────────────────────
    if (!checkCompat(chalk, "install")) return;

    const root = process.cwd();

    if (INSTALL_TARGETS.length === 0) {
        info(chalk, "No install targets defined yet.");
        info(chalk, "Edit INSTALL_TARGETS in lib/commands/install.js to add your dirs.");
        console.log();
        return;
    }

    for (let i = 0; i < INSTALL_TARGETS.length; i++) {
        const { dir, type } = INSTALL_TARGETS[i];
        step(chalk, i + 1, INSTALL_TARGETS.length, `Installing ${dir}`);

        const fullDir = path.join(root, dir);

        if (!fs.existsSync(fullDir)) {
            warn(chalk, `${dir}/ not found — skipping`);
            continue;
        }

        try {
            if (type === "npm") {
                const pkgJson = path.join(fullDir, "package.json");
                if (!fs.existsSync(pkgJson)) {
                    warn(chalk, `No package.json in ${dir}/ — skipping`);
                    continue;
                }
                info(chalk, `Running npm install in ${chalk.cyan(dir)}/...`);
                exec("npm install", { cwd: fullDir });
                ok(chalk, "npm dependencies installed");

            } else if (type === "pip") {
                const req = path.join(fullDir, "requirements.txt");
                if (!fs.existsSync(req)) {
                    warn(chalk, `No requirements.txt in ${dir}/ — skipping`);
                    continue;
                }
                info(chalk, `Running pip install in ${chalk.cyan(dir)}/...`);
                exec("pip install -r requirements.txt", { cwd: fullDir });
                ok(chalk, "Python dependencies installed");
            }
        } catch (err) {
            fail(chalk, `Failed to install ${dir}: ${err.message}`);
            return;
        }
    }

    console.log();
    divider(chalk);
    console.log(chalk.green("    ✔  All dependencies installed!"));
    divider(chalk);
    console.log();
}