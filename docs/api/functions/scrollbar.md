[artboard-deluxe](../globals.md) / scrollbar

# scrollbar()

> **scrollbar**(`options`): [`ArtboardPluginDefinition`](../type-aliases/ArtboardPluginDefinition.md)\<\{ `element`: `HTMLElement`; `minThumbSize`: `number`; `orientation`: `ScrollbarOrientation`; `restoreStyles`: `boolean`; `thumbElement`: `string` \| `HTMLElement`; \}\>

## Parameters

### options

#### element

`HTMLElement`

The element representing the scrollbar.

#### minThumbSize

`number`

The minimum size of the thumb.

#### orientation

`ScrollbarOrientation`

The orientation.

#### restoreStyles

`boolean`

Whether to restore the original styles after destroying the plugin instance.

#### thumbElement

`string` \| `HTMLElement`

The element or selector representing the scrollbar thumb.

## Returns

[`ArtboardPluginDefinition`](../type-aliases/ArtboardPluginDefinition.md)\<\{ `element`: `HTMLElement`; `minThumbSize`: `number`; `orientation`: `ScrollbarOrientation`; `restoreStyles`: `boolean`; `thumbElement`: `string` \| `HTMLElement`; \}\>

## Defined in

plugins/scrollbar/index.ts:7
