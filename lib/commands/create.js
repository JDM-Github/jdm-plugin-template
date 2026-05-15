// ─────────────────────────────────────────────────────────────
//  jdm-plugin-template  —  lib/commands/create.js
//
//  The "create" command scaffolds a new project for your plugin.
//
//  This template shows:
//    ✔  How to use the header / step / ok / fail / info helpers
//    ✔  How to prompt the user interactively with rl (readline)
//    ✔  How to use the --name flag to skip the prompt
//    ✔  How to clone a GitHub repo and strip .git
//    ✔  How to write a local config file (.jdm-config.json)
//    ✔  How to use an install.log for error output
//
//  Remove or replace anything you don't need.
// ─────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { writeConfig } from "../config.js";
import { ok, fail, warn, info, step, header, divider } from "../logger.js";

// ── Replace this with your actual GitHub template repo URL ────
const TEMPLATE_REPO = "https://github.com/your-username/your-template-repo";

// ── Folders that would conflict in cwd install ────────────────
const CONFLICT_FOLDERS = ["src", "dist"]; // ← adjust as needed

// ─────────────────────────────────────────────────────────────
//  Install log  (written to <targetDir>/install.log on error)
// ─────────────────────────────────────────────────────────────
let logPath = null;

function initLog(targetDir) {
    logPath = path.join(targetDir, "install.log");
    fs.writeFileSync(logPath, `[install log — ${new Date().toISOString()}]\n\n`, "utf8");
}

function appendLog(line) {
    if (logPath) fs.appendFileSync(logPath, line + "\n", "utf8");
}

function cleanLog() {
    if (logPath && fs.existsSync(logPath)) {
        fs.unlinkSync(logPath);
        logPath = null;
    }
}

// ─────────────────────────────────────────────────────────────
//  Exec wrapper  (captures stdout/stderr into install.log)
// ─────────────────────────────────────────────────────────────
function exec(cmd, opts = {}) {
    try {
        const result = execSync(cmd, { ...opts, stdio: "pipe" });
        if (result) appendLog(`[OK] ${cmd}\n${result.toString()}`);
        return result;
    } catch (err) {
        appendLog([
            `[FAIL] ${cmd}`,
            err.stdout?.toString() ?? "",
            err.stderr?.toString() ?? "",
        ].join("\n"));
        throw err;
    }
}

// ─────────────────────────────────────────────────────────────
//  rl helper  (wraps readline.question as a Promise)
// ─────────────────────────────────────────────────────────────
function ask(rl, question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

// ─────────────────────────────────────────────────────────────
//  Main export
//  Signature must match what index.js passes:
//    create(chalk, rl, args)
// ─────────────────────────────────────────────────────────────
export default async function create(chalk, rl, args = []) {
    header(chalk, "create");

    // ── Parse flags ───────────────────────────────────────────
    //  --name my-project   → skip the name prompt
    //  --install           → run npm install / pip install after clone
    const nameIdx = args.indexOf("--name");
    const nameArg = nameIdx !== -1 ? args[nameIdx + 1] : null;
    const shouldInstall = args.includes("--install");

    // ── Step 1: resolve target directory ─────────────────────
    step(chalk, 1, 3, "Target Directory");

    const answer = nameArg
        ?? (await ask(rl, chalk.white("\n  Project name (or . for current folder): "))).trim();

    let targetDir;

    if (answer === ".") {
        // ── Install into current directory ────────────────────
        targetDir = process.cwd();
        info(chalk, `Using current directory: ${chalk.cyan(targetDir)}`);

        const entries = fs.readdirSync(targetDir);
        const conflicts = entries.filter(
            (e) => CONFLICT_FOLDERS.includes(e) && fs.statSync(path.join(targetDir, e)).isDirectory()
        );

        if (conflicts.length > 0) {
            fail(chalk, `Conflicting folders: ${conflicts.map((c) => chalk.red(c)).join(", ")}`);
            const confirm = (await ask(rl, chalk.white("  Remove them and continue? [y/N]: "))).trim().toLowerCase();
            if (confirm !== "y") {
                console.log(chalk.gray("\n  Aborted.\n"));
                return;
            }
            for (const c of conflicts) {
                fs.rmSync(path.join(targetDir, c), { recursive: true, force: true });
                ok(chalk, `Removed ${chalk.red(c)}`);
            }
        } else if (entries.length > 0) {
            warn(chalk, "Current folder is not empty.");
            const confirm = (await ask(rl, chalk.white("  Continue anyway? [y/N]: "))).trim().toLowerCase();
            if (confirm !== "y") {
                console.log(chalk.gray("\n  Aborted.\n"));
                return;
            }
        }

    } else {
        // ── Create a named subfolder ──────────────────────────
        if (!answer || answer.includes("/") || answer.includes("\\")) {
            fail(chalk, "Invalid project name.");
            return;
        }
        targetDir = path.join(process.cwd(), answer);
        if (fs.existsSync(targetDir)) {
            warn(chalk, `Folder ${chalk.cyan(answer)} already exists.`);
            const confirm = (await ask(rl, chalk.white("  Continue anyway? [y/N]: "))).trim().toLowerCase();
            if (confirm !== "y") {
                console.log(chalk.gray("\n  Aborted.\n"));
                return;
            }
        } else {
            fs.mkdirSync(targetDir, { recursive: true });
            ok(chalk, `Created folder: ${chalk.cyan(targetDir)}`);
        }
    }

    initLog(targetDir);

    // ── Step 2: clone template ────────────────────────────────
    step(chalk, 2, 3, "Cloning template");

    try {
        info(chalk, `Cloning from ${chalk.cyan(TEMPLATE_REPO)}...`);
        exec(`git clone ${TEMPLATE_REPO} .`, { cwd: targetDir });

        // Strip .git so this becomes a clean project, not a fork
        const gitDir = path.join(targetDir, ".git");
        if (fs.existsSync(gitDir)) {
            fs.rmSync(gitDir, { recursive: true, force: true });
            info(chalk, "Removed .git (clean slate)");
        }

        ok(chalk, "Template cloned");
    } catch (err) {
        fail(chalk, `Clone failed: ${err.message}`);
        console.log(chalk.yellow("\n    Full output written to: ") + chalk.white("install.log"));
        return;
    }

    // ── Step 3: optional dependency install ──────────────────
    step(chalk, 3, 3, "Dependencies");

    if (shouldInstall) {
        try {
            info(chalk, "Running npm install...");
            exec("npm install", { cwd: targetDir });
            ok(chalk, "Dependencies installed");
        } catch (err) {
            fail(chalk, `npm install failed: ${err.message}`);
            console.log(chalk.yellow("\n    Full output written to: ") + chalk.white("install.log"));
            return;
        }
    } else {
        info(chalk, "Skipped (pass --install to auto-install)");
    }

    // ── Write local config ────────────────────────────────────
    writeConfig(targetDir, { projectName: path.basename(targetDir) });
    info(chalk, `Created ${chalk.cyan(".jdm-config.json")}`);

    cleanLog();

    // ── Done ──────────────────────────────────────────────────
    console.log();
    divider(chalk);
    console.log(chalk.green("    ✔  Project ready!"));
    console.log(chalk.gray(`    Location: ${targetDir}`));
    divider(chalk);
    console.log();

    if (!shouldInstall) {
        console.log(chalk.white("  Next steps:"));
        console.log(chalk.gray("    jdm <namespace> install  →  install dependencies"));
        console.log(chalk.gray("    jdm <namespace> dev      →  start development"));
    } else {
        console.log(chalk.white("  Next steps:"));
        console.log(chalk.gray("    jdm <namespace> dev  →  start development"));
    }
    console.log();
}