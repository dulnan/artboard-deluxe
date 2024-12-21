[artboard-deluxe](../globals.md) / PossibleBlockingRect

# PossibleBlockingRect

> **PossibleBlockingRect**: [`Rectangle`](Rectangle.md) \| [`number`, `number`, `number`, `number`]

A possible return type for the getBlockingRects() method.

You may either return an object compatible with `Rectangle` (such as the return value of `element.getBoundingClientRect()`) or an array of four numbers representing `[x, y, width, height]`.

## Defined in

types/index.ts:18
