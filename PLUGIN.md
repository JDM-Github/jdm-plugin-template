# Plugin Command Schema Reference

This document covers every feature available when defining commands in your plugin's `package.json` under `jdmPlugin.commands`. It exists so you can build complex, conditional UIs without guessing.

---

## Top-Level Structure

```json
{
  "jdmPlugin": {
    "namespace": "your-plugin",
    "description": "Short description shown in the plugin list",
    "commands": [ ...Command ]
  }
}
```

---

## Command Object

```ts
{
  "name": string,          // shown in the command panel and used in CLI: jdm-cli <namespace> <name>
  "description": string,   // shown at the top of the config panel
  "fields": [ ...Field ]   // empty array = "No configuration required — ready to run"
}
```

---

## Field Object — Full Reference

```ts
{
  // ── Always required ────────────────────────────────────────
  "key":   string,     // internal identifier, also the key in the args record
  "label": string,     // shown above the input in the config panel
  "type":  "text" | "select" | "boolean",

  // ── Usually required (except radio fields) ─────────────────
  "flag":  string,     // e.g. "--name", "--install" — omit only on radio fields

  // ── Optional common fields ─────────────────────────────────
  "placeholder": string,          // text inputs only
  "options":     string[],        // select inputs only
  "default":     string | boolean,
  "required":    boolean,         // shows red * and blocks Run if empty
  "description": string,          // small hint text below the input

  // ── Conditional visibility (pick one system per field) ─────
  "radio":            boolean,    // see § Radio / Switch Button
  "class":            string,     // see § Class Gating + § Disable When Active
  "class_target":     string,     // see § Radio / Switch Button
  "disable_when_active": string,  // see § Disable When Active
}
```

---

## Field Types

### `"type": "text"`

Renders a text input.

```json
{
  "key": "name",
  "label": "Project Name",
  "flag": "--name",
  "type": "text",
  "placeholder": "my-app",
  "required": true
}
```

CLI output: `--name "my-app"`

---

### `"type": "select"`

Renders a dropdown. First option is the default unless `"default"` is set.

```json
{
  "key": "env",
  "label": "Environment",
  "flag": "--env",
  "type": "select",
  "options": ["development", "staging", "production"],
  "default": "development"
}
```

CLI output: `--env "production"`

---

### `"type": "boolean"`

Renders a toggle switch. When ON the flag is emitted, when OFF nothing is emitted.

```json
{
  "key": "install",
  "label": "Install Dependencies",
  "flag": "--install",
  "type": "boolean",
  "default": false
}
```

CLI output: `--install` (only when toggled ON)

---

## Radio / Switch Button

Use this when you have **mutually exclusive modes** that also control which other fields are shown.

### Rules

- Set `"radio": true` and `"class": "switch_button"` on every option in the group.
- Set a unique `"class_target"` on each — this is the value emitted in the CLI arg.
- Omit `"flag"` — the runner emits `--switch_button="<class_target>"` automatically.
- The runner ensures only one radio per group can be ON at a time.

```json
{
  "key": "radio_blueprint",
  "label": "Blueprint",
  "radio": true,
  "class": "switch_button",
  "class_target": "blueprint",
  "type": "boolean",
  "default": true,
  "description": "Scaffold a REST Blueprint"
},
{
  "key": "radio_socket",
  "label": "Socket Event",
  "radio": true,
  "class": "switch_button",
  "class_target": "socket",
  "type": "boolean",
  "default": false,
  "description": "Scaffold a Socket.IO event handler"
}
```

CLI output (when Blueprint is active): `--switch_button="blueprint"`  
CLI output (when Socket is active): `--switch_button="socket"`

> **Multiple radio groups** are supported. Give each group a different `"class"` value — e.g. `"class": "switch_mode"` for one group and `"class": "switch_target"` for another. They will render as separate segmented controls and operate independently.

---

## Class Gating

Fields with a `"class"` that matches a radio's `"class_target"` are **only shown when that radio is active**.

```json
{
  "key": "prod",
  "label": "Disabled on Production",
  "class": "blueprint",
  "flag": "--prod",
  "type": "boolean",
  "default": false
}
```

- Visible only when `radio_blueprint` is ON (because `class_target: "blueprint"`).
- Hidden (and excluded from args) when `radio_socket` is ON.

There is no limit to how many fields can share the same class — all of them will show/hide together.

---

## Disable When Active

Use this when one field (typically a "full/all" boolean) should **suppress** a group of other fields.

### Rules

- On the controlling field: set `"disable_when_active": "<class-name>"`.
- On each field to suppress: set `"class": "<class-name>"`.
- When the controlling field is ON, all fields with that class disappear from the UI and are excluded from args.
- When the controlling field is OFF, the suppressed fields appear normally.

```json
{
  "key": "frontend",
  "label": "Build Frontend",
  "class": "manual",
  "flag": "--frontend",
  "type": "boolean",
  "default": false
},
{
  "key": "backend",
  "label": "Build Backend",
  "class": "manual",
  "flag": "--backend",
  "type": "boolean",
  "default": false
},
{
  "key": "full",
  "label": "Full Build",
  "flag": "--full",
  "disable_when_active": "manual",
  "type": "boolean",
  "default": false
}
```

- `--full` ON → `--frontend` and `--backend` are hidden. CLI output: `--full`
- `--full` OFF → individual toggles are shown. CLI output: `--frontend --backend` (whatever is toggled)

---

## Combining Systems

The three visibility systems stack cleanly — a field obeys all rules simultaneously.

| Field has…                     | Visible when…                                              |
|--------------------------------|------------------------------------------------------------|
| No `class`                     | Always                                                     |
| `radio: true, class: "switch_button"` | Always (rendered as segmented control, not in field list) |
| `class: "<radio class_target>"` | That radio is the active selection                        |
| `class: "<X>", disable_when_active` controller is ON | Never (hidden)                      |
| `class` that is neither a radio target nor disabled | Always                             |

### Real Example — `make` command

```json
{
  "name": "make",
  "description": "Scaffold a Blueprint, Service, or Socket event",
  "fields": [
    {
      "key": "name",
      "label": "API Name",
      "flag": "--name",
      "type": "text",
      "placeholder": "person",
      "description": "e.g. 'person' creates PersonBlueprint"
    },
    {
      "key": "radio_blueprint",
      "label": "Blueprint",
      "radio": true,
      "class": "switch_button",
      "class_target": "blueprint",
      "type": "boolean",
      "default": true
    },
    {
      "key": "radio_socket",
      "label": "Socket Event",
      "radio": true,
      "class": "switch_button",
      "class_target": "socket",
      "type": "boolean",
      "default": false
    },
    {
      "key": "prod",
      "label": "Disabled on Production",
      "class": "blueprint",
      "flag": "--prod",
      "type": "boolean",
      "default": false
    },
    {
      "key": "deployed",
      "label": "Disabled on Deployed",
      "class": "blueprint",
      "flag": "--deployed",
      "type": "boolean",
      "default": false
    }
  ]
}
```

What the UI shows:

- Always: `name` text input
- Always: Blueprint / Socket Event segmented control
- Only when Blueprint active: `--prod` and `--deployed` toggles
- Only when Socket active: (nothing extra in this example)

CLI output (Blueprint active, prod toggled): `jdm-cli electron-flask make --name "person" --switch_button="blueprint" --prod`

---

## Quick Reference Card

```
Field wants to...                Use...
─────────────────────────────────────────────────────────────────
Always appear                    No special keys needed
Be one of a mutually-exclusive   radio: true
  set of modes                   class: "switch_button"
                                 class_target: "<unique-name>"
                                 (omit flag)

Only appear when a radio mode    class: "<radio's class_target>"
  is active

Suppress a group of fields       disable_when_active: "<class-name>"
  when it is ON                  (on the controlling field)

Be suppressed by the above       class: "<same class-name>"
  controller
```

---

## Validation Notes

- `required: true` only checks that the field value is non-empty. It does not apply to fields that are currently hidden by class gating or `disable_when_active`.
- A field with no `flag` that is not a radio field will silently produce no CLI output. Always set `flag` on non-radio fields.
- `class_target` on a non-radio field has no effect — it is only read from radio fields to determine the active switch target.