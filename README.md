# jdm-plugin-template

A starter template for building **jdm-cli** plugins. This repo is also self-bootstrapping — the `create` command clones this very repo into a new project, giving contributors a clean slate to start from.

---

## What is this?

`jdm-plugin-template` is the **official base template** for all jdm-cli plugins. It ships with a working plugin structure, a set of standard commands (`create`, `dev`, `build`, `clean`, `install`), shared logging helpers, and a version compatibility system — so you spend time building your plugin, not scaffolding it.

---

## Quick Start

### Use this template to scaffold a new plugin

```bash
# Install the CLI (if you haven't already)
npm install -g jdm-cli
jdm-cli add plugin-template

# Scaffold a new plugin project
jdm-cli plugin-template create

# Then follow the prompts, or use flags:
jdm-cli plugin-template create --name my-plugin
jdm-cli plugin-template create --name my-plugin --install
```

This will:
1. Clone this repo into a folder named `my-plugin` (or `.` for current dir)
2. Strip `.git` so it's a clean project — not a fork
3. Optionally run `npm install` for you

---

## Project Structure

```
jdm-plugin-template/
├── lib/
│   ├── index.js          # Entry point — namespace, command map, dispatcher
│   ├── config.js         # Config read/write and compatibility guard
│   ├── compat.js         # Plugin version + per-command compatibility ranges
│   ├── logger.js         # Shared logging helpers (ok, fail, warn, info, step, header)
│   └── commands/
│       ├── create.js     # Scaffold a new project (clones this repo)
│       ├── dev.js        # Start development environment
│       ├── build.js      # Compile / package the project
│       ├── clean.js      # Remove build artifacts
│       └── install.js    # Install dependencies
├── package.json
└── README.md
```

---

## Built-in Commands

| Command   | Description                              | Key Flags                              |
|-----------|------------------------------------------|----------------------------------------|
| `create`  | Scaffold a new project from this template | `--name <name>`, `--install`          |
| `dev`     | Start development environment            | _(wire up your own processes)_         |
| `build`   | Compile / package the project            | `--frontend`, `--backend`, `--full`   |
| `clean`   | Remove build artifacts                   | `--dry` (preview without deleting)    |
| `install` | Install dependencies                     | _(none)_                               |

---

## Contributing / Building Your Own Plugin

This repo is the starting point. Here's how to get going:

### 1. Scaffold a copy

```bash
jdm-cli plugin-template create --name my-plugin --install
cd my-plugin
```

Or clone manually:

```bash
git clone https://github.com/JDM-Github/jdm-plugin-template my-plugin
cd my-plugin
rm -rf .git
npm install
```

### 2. Set your namespace

In **three places**, replace `"plugin-template"` with your plugin's name:

| File | What to change |
|---|---|
| `lib/index.js` | `export const namespace = "plugin-template"` |
| `lib/config.js` | `const PLUGIN_NAME = "plugin-template"` |
| `lib/logger.js` | `const ns = "plugin-template"` inside `header()` |
| `package.json` | `"name"`, `"jdmPlugin.namespace"`, `"jdmPlugin.description"` |

### 3. Add your commands

1. Create `lib/commands/my-command.js` with a default export
2. Import it in `lib/index.js` and add it to the `commands` map
3. If it needs interactive prompts (`ask(rl, ...)`), add the name to `INTERACTIVE_COMMANDS`
4. Add it to `showDesign()` for the help screen
5. Add it to the `jdmPlugin.commands` array in `package.json`

### 4. Wire up `dev` and `build`

Both files have clearly marked `// TODO` blocks — drop in your actual build commands, server launchers, or watchers there. Cross-platform terminal helpers (Windows Terminal, CMD, gnome-terminal, osascript) are already included in `dev.js`.

### 5. Update compatibility (when needed)

When you make breaking changes to the template structure, bump `COMPAT` in `lib/compat.js` so existing projects get a clear error instead of a silent failure:

```js
// lib/compat.js
export const pluginVersion = "1.1.0";

export const COMPAT = {
    global: ">=1.1.0",  // bump when ALL commands need a newer project
    commands: {
        build: ">=1.1.0",  // or target a specific command
    },
};
```

---

## Logger Helpers

All commands share the same logging helpers from `lib/logger.js`:

```js
import { ok, fail, warn, info, step, header, divider } from "../logger.js";

ok(chalk, "Thing worked");        //  ✔  Thing worked  (green)
fail(chalk, "Thing broke");       //  ✖  Thing broke   (red)
warn(chalk, "Watch out");         //  ⚠  Watch out     (yellow)
info(chalk, "Just so you know");  //  ·  Just so you know (gray)

step(chalk, 1, 3, "Doing X");     // [1/3]  Doing X
header(chalk, "my-command");      // jdm / plugin-template / my-command
divider(chalk);                   // ─────────────────────────────────────
```

---

## Config System

Every scaffolded project gets a `.jdm-config.json` file. This allows commands to verify they're running inside a compatible project:

```json
{
  "plugin-template": {
    "pluginVersion": "1.0.0",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "projectName": "my-plugin"
  }
}
```

Use `checkCompat(chalk, "command-name")` at the top of any command that requires a valid project context. It will warn if the config is missing, or error with a helpful message if the version is out of range.

---

## Requirements

- Node.js 18+
- Git (for the `create` command)
- jdm-cli installed globally

---

## License

MIT — [JDM-Github](https://github.com/JDM-Github)