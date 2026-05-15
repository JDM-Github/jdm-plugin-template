// ─────────────────────────────────────────────────────────────
//  jdm-plugin-template  —  lib/commands/dev.js
//
//  The "dev" command starts your development environment.
//
//  This template shows:
//    ✔  How to guard a command with checkCompat
//    ✔  How to spawn processes in new terminal windows
//       (Windows Terminal → CMD fallback → Unix terminals)
//    ✔  How to allocate free ports dynamically
//    ✔  How to pass env vars to spawned processes
//
//  Replace the process launch blocks with whatever your plugin
//  needs to start (servers, watchers, proxies, etc.)
// ─────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import net from "net";
import { spawn } from "child_process";
import { checkCompat } from "../config.js";
import { ok, fail, info, header, divider } from "../logger.js";

// ─────────────────────────────────────────────────────────────
//  Port allocation
// ─────────────────────────────────────────────────────────────

/** Returns a free port on 127.0.0.1 by binding to port 0. */
function getFreePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(0, "127.0.0.1", () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        server.on("error", reject);
    });
}

// ─────────────────────────────────────────────────────────────
//  Cross-platform terminal launchers
// ─────────────────────────────────────────────────────────────

/**
 * Launch a command in a new Windows Terminal tab.
 * Falls back to launchInCmdWindow if wt.exe isn't available.
 */
function launchInWindowsTerminal(title, cwd, command, args, env = {}) {
    const envPrefix = Object.entries(env).map(([k, v]) => `set ${k}=${v} &&`).join(" ");
    const fullCmd = `cd /d "${cwd}" && ${envPrefix} ${command} ${args.join(" ")}`;

    const proc = spawn("wt.exe", [
        "-w", "0", "new-tab", "--title", title,
        "--", "cmd.exe", "/k", fullCmd,
    ], { detached: true, stdio: "ignore", shell: false });

    proc.unref();
}

/** Launch in a plain new CMD window (fallback when wt.exe is absent). */
function launchInCmdWindow(cwd, command, args, env = {}) {
    const envPrefix = Object.entries(env).map(([k, v]) => `set ${k}=${v} &&`).join(" ");
    const fullCmd = `cd /d "${cwd}" && ${envPrefix} ${command} ${args.join(" ")}`;

    const proc = spawn("cmd.exe", ["/c", "start", "cmd.exe", "/k", fullCmd], {
        detached: true, stdio: "ignore", shell: false,
    });
    proc.unref();
}

/** Try Windows Terminal; return false if unavailable. */
function tryWindowsTerminal(title, cwd, command, args, env = {}) {
    try { launchInWindowsTerminal(title, cwd, command, args, env); return true; }
    catch { return false; }
}

/** Try common Unix/macOS terminals in priority order. */
function launchInUnixTerminal(title, cwd, command, args, env = {}) {
    const envPrefix = Object.entries(env).map(([k, v]) => `${k}=${v}`).join(" ");
    const fullCmd = `cd "${cwd}" && ${envPrefix} ${command} ${args.join(" ")}; exec $SHELL`;

    const terminals = [
        ["gnome-terminal", ["--title", title, "--", "bash", "-c", fullCmd]],
        ["xterm", ["-title", title, "-e", `bash -c '${fullCmd}'`]],
        ["osascript", ["-e", `tell application "Terminal" to do script "cd \\"${cwd}\\" && ${envPrefix} ${command} ${args.join(" ")}"`]],
    ];

    for (const [term, termArgs] of terminals) {
        try {
            spawn(term, termArgs, { detached: true, stdio: "ignore" }).unref();
            return true;
        } catch { /* try next */ }
    }
    return false;
}

// ─────────────────────────────────────────────────────────────
//  Main export
//  Signature: dev(chalk, args)
//  No rl — dev doesn't need interactive prompts.
// ─────────────────────────────────────────────────────────────
export default async function dev(chalk, args = []) {
    header(chalk, "dev");

    // ── Guard: must be inside a valid project ─────────────────
    if (!checkCompat(chalk, "dev")) return;

    const root = process.cwd();

    // ── TODO: define your service directories here ────────────
    //  const backendDir  = path.join(root, "backend");
    //  const frontendDir = path.join(root, "frontend");
    //
    //  Example existence check:
    //  if (!fs.existsSync(backendDir)) {
    //      fail(chalk, `backend/ not found in ${chalk.cyan(root)}`);
    //      return;
    //  }

    // ── Allocate ports (remove if your plugin doesn't use them)
    // const port = await getFreePort();
    // info(chalk, `Allocated port ${port}`);

    // ── TODO: launch your dev processes ──────────────────────
    //
    //  Windows example:
    //    const launched = tryWindowsTerminal("My Dev Server", root, "npm", ["run", "dev"], {});
    //    if (!launched) launchInCmdWindow(root, "npm", ["run", "dev"], {});
    //
    //  Unix example:
    //    const success = launchInUnixTerminal("My Dev Server", root, "npm", ["run", "dev"], {});
    //    if (!success) {
    //        fail(chalk, "Could not open terminal. Run manually:");
    //        console.log(chalk.gray(`      cd "${root}" && npm run dev`));
    //        return;
    //    }

    // ── Placeholder output — replace when you wire up processes
    info(chalk, "Dev command placeholder — wire up your processes above.");
    ok(chalk, "Nothing launched yet (template mode)");

    console.log();
    divider(chalk);
    console.log(chalk.green("    ✔  Dev environment ready!"));
    divider(chalk);
    console.log();
}