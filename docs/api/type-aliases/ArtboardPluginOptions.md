[artboard-deluxe](../globals.md) / ArtboardPluginOptions

# ArtboardPluginOptions\<T\>

> **ArtboardPluginOptions**\<`T`\>: `object`

## Type Parameters

• **T** *extends* `object`

## Type declaration

### get()

#### Call Signature

Get an option value.

##### Type Parameters

• **K** *extends* `string` \| `number` \| `symbol`

##### Parameters

###### key

`K`

##### Returns

`T`\[`K`\]

#### Call Signature

Get an option value with a default value.

##### Type Parameters

• **K** *extends* `string` \| `number` \| `symbol`

##### Parameters

###### key

`K`

###### defaultValue

`T`\[`K`\]

##### Returns

`NonNullable`\<`T`\[`K`\]\>

### getElement()

Get an option that is either a DOM element or a selector.

Throws an error if no element could be found.

#### Type Parameters

• **K** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

##### fallbackSelector

`string`

##### parent

`HTMLElement`

#### Returns

`HTMLElement`

### getRequired()

Get a required option value. If the option is not set an error is thrown.

#### Type Parameters

• **K** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

#### Returns

`T`\[`K`\]

### set()

Set an option.

#### Type Parameters

• **K** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

##### value

`T`\[`K`\]

#### Returns

`void`

### setAll()

Set all options at once.

#### Parameters

##### newOptions

`T`

#### Returns

`void`

### should()

Returns the boolean representation of an option.

#### Type Parameters

• **K** *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

#### Returns

`boolean`

## Defined in

types/index.ts:39
