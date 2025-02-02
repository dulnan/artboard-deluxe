import { pluginOptions } from '../helpers/pluginOptions'
import type { ArtboardPluginDefinition, ArtboardPluginInit } from './../types'

export function defineArtboardPlugin<
  // The type of the options.
  O extends object,
  // The type for additional public plugin methods or properties returned.
  R extends object = object,
  // Whether there is at least one required option.
  HasOptions = object extends O ? true : false,
>(
  init: ArtboardPluginInit<O, R>,
): HasOptions extends true
  ? // No option properties are required.
    (options?: O) => ArtboardPluginDefinition<O, R>
  : // Some option properties are required, thus an object argument is required.
    (options: O) => ArtboardPluginDefinition<O, R> {
  return function (providedOptions?: O) {
    const options = pluginOptions(providedOptions as O)
    return {
      options,
      init,
    }
  }
}
