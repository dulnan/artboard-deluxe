[artboard-deluxe](../globals.md) / keyboard

# keyboard()

> **keyboard**(`options`?): [`ArtboardPluginDefinition`](../type-aliases/ArtboardPluginDefinition.md)\<\{ `keymap`: `Keymap`; `modifier`: `KeyboardModifier`; \}\>

## Parameters

### options?

#### keymap

`Keymap`

Override the default keymap.

Should be an object whose properties are the keyboard code (according to
KeyboardEvent['code']) and the values is an array where the first item is
the name of the Artboard method to call and the second (optional value) is
whether a modifier key is required.

#### modifier

`KeyboardModifier`

The modifier key to check.

Defaults to 'ctrl'.

## Returns

[`ArtboardPluginDefinition`](../type-aliases/ArtboardPluginDefinition.md)\<\{ `keymap`: `Keymap`; `modifier`: `KeyboardModifier`; \}\>

## Defined in

plugins/keyboard/index.ts:29
