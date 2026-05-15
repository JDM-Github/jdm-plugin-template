// ─────────────────────────────────────────────────────────────
//  jdm-plugin-template  —  lib/index.js
//
//  Main entry point for the plugin.
//  jdm-cli imports this file and calls run(command, args, chalk, rl).
//
//  Required exports:
//    namespace  (string)  — the CLI prefix:  jdm <namespace> <command>
//    commands   (object)  — map of command name → handler function
//    run        (fn)      — dispatcher called by jdm-cli
//    showDesign (fn)      — prints the help screen
//
//  To add a new command:
//    1. Create lib/commands/my-command.js with a default export
//    2. Import it here
//    3. Add it to the `commands` map
//    4. Add it to showDesign()
//    5. Add it to the jdmPlugin.commands array in package.json
// ─────────────────────────────────────────────────────────────

import create from "./commands/create.js";
import dev from "./commands/dev.js";
import build from "./commands/build.js";
import clean from "./commands/clean.js";
import install from "./commands/install.js";

// ── Namespace ─────────────────────────────────────────────────
//  This is the prefix used in the CLI:  jdm <namespace> <command>
//  Change this to match your plugin's jdmPlugin.namespace in package.json
export const namespace = "plugin-template"; // ← CHANGE THIS

// ── Command map ───────────────────────────────────────────────
//  Keys are the exact command strings the user types.
//  Values are the imported handler functions.
//
//  Commands that need interactive prompts receive (chalk, rl, args).
//  Commands that don't need prompts receive (chalk, args).
//  See the run() dispatcher below for how this is handled.
export const commands = {
    create,
    dev,
    build,
    clean,
    install,

    // ── Add your own commands here ────────────────────────────
    // "my-command": myCommand,
};

// ── Commands that need the readline interface (rl) ────────────
//  List any command names that call ask(rl, ...) for user input.
const INTERACTIVE_COMMANDS = ["create"];

// ─────────────────────────────────────────────────────────────
//  run()  —  called by jdm-cli for every invocation
//
//  command  (string)   — e.g. "create", "dev", "build"
//  args     (string[]) — remaining CLI args / flags
//  chalk    (object)   — chalk instance from jdm-cli
//  rl       (object)   — readline interface from jdm-cli
// ─────────────────────────────────────────────────────────────
export async function run(command, args, chalk, rl) {

    // ── Help shortcut ─────────────────────────────────────────
    if (command === "help" || command === "--help" || command === "-h" || !command) {
        return showDesign(chalk);
    }

    // ── Lookup ────────────────────────────────────────────────
    const fn = commands[command];
    if (!fn) {
        console.log(chalk.red(`\n  ✖  Unknown command: "${command}"`));
        console.log(chalk.gray(`     Available: ${Object.keys(commands).join(", ")}`));
        return;
    }

    // ── Dispatch ──────────────────────────────────────────────
    if (INTERACTIVE_COMMANDS.includes(command)) {
        return fn(chalk, rl, args);
    }
    return fn(chalk, args);
}

// ─────────────────────────────────────────────────────────────
//  showDesign()  —  the help / overview screen
//
//  Customize this to describe your plugin's commands.
// ─────────────────────────────────────────────────────────────
export async function showDesign(chalk) {
    console.log(chalk.cyan(`\n  ⚡ ${namespace} Plugin`));
    // ← Replace the tagline with your plugin's description
    console.log(chalk.gray("     Your plugin tagline goes here."));
    console.log(chalk.gray("     Available commands:\n"));

    // ── List your commands here ───────────────────────────────
    //  Format:  command name (padded)  +  short description
    console.log(`  ${chalk.green("create")}      ${chalk.dim("Scaffold a new project")}`);
    console.log(`  ${chalk.green("dev")}         ${chalk.dim("Start development environment")}`);
    console.log(`  ${chalk.green("build")}       ${chalk.dim("Compile / package the project")}`);
    console.log(`  ${chalk.green("clean")}       ${chalk.dim("Remove build artifacts")}`);
    console.log(`  ${chalk.green("install")}     ${chalk.dim("Install dependencies")}`);

    // ── Add your own commands to the list above ───────────────
    // console.log(`  ${chalk.green("my-command")}  ${chalk.dim("Does something useful")}`);

    console.log();
}