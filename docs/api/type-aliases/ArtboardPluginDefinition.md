[artboard-deluxe](../globals.md) / ArtboardPluginDefinition

# ArtboardPluginDefinition\<T\>

> **ArtboardPluginDefinition**\<`T`\>: `object`

Defines a plugin definition.

This is the return value when you create a plugin, e.g. using `mouse()`.
The plugin definition can then be passed as the second argument in an array to `createArtboard` or by manually adding the plugin after the artboard has been initialised using `artboard.addPlugin()`.

## Type Parameters

• **T** *extends* `object` = `any`

## Type declaration

### init

> **init**: [`ArtboardPluginInit`](ArtboardPluginInit.md)\<`T`\>

**`Internal`**

The method to initlise the plugin.

### options

> **options**: [`ArtboardPluginOptions`](ArtboardPluginOptions.md)\<`T`\>

The options instance.

## Defined in

types/index.ts:94
