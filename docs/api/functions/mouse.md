[artboard-deluxe](../globals.md) / mouse

# mouse()

> **mouse**(`options`?): [`ArtboardPluginDefinition`](../type-aliases/ArtboardPluginDefinition.md)\<\{ `scrollDirectionThreshold`: `number`; `setCursor`: `boolean`; `useSpacebar`: `boolean`; `velocity`: `Partial`\<`VelocityQueueOptions`\>; \}\>

## Parameters

### options?

#### scrollDirectionThreshold

`number`

#### setCursor

`boolean`

Whether to set the cursor on the root element to indicate when dragging.

Note by default this is disabled because changing the cursor can trigger style recalculation, see https://gist.github.com/paulirish/5d52fb081b3570c81e3a/565c05680b27c9cfd9f5e971d295cd558c3e1843.

#### useSpacebar

`boolean`

Only allow dragging while holding the spacebar.

#### velocity

`Partial`\<`VelocityQueueOptions`\>

Options for the velocity queue.

## Returns

[`ArtboardPluginDefinition`](../type-aliases/ArtboardPluginDefinition.md)\<\{ `scrollDirectionThreshold`: `number`; `setCursor`: `boolean`; `useSpacebar`: `boolean`; `velocity`: `Partial`\<`VelocityQueueOptions`\>; \}\>

## Defined in

plugins/mouse/index.ts:10
