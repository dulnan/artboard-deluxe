import type {
  ArtboardPluginDefinition,
  ArtboardPluginInit,
  ArtboardPluginOptions,
} from './../types'

function pluginOptions<T extends object>(
  providedOptions: T,
): ArtboardPluginOptions<T> {
  let options: T = providedOptions
  function get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K] {
    const v = options ? options[key] : undefined
    if (v === undefined && defaultValue !== undefined) {
      return defaultValue
    }

    return v as T[K]
  }

  function getRequired<K extends keyof T>(key: K): T[K] {
    const value = get(key)
    if (value === undefined || value === null) {
      throw new Error(`Missing required plugin option "${String(key)}".`)
    }

    return value
  }

  function getElement<K extends keyof T>(
    key: K,
    fallbackSelector: string,
    parent: HTMLElement,
  ): HTMLElement {
    const value = get(key)
    if (value instanceof HTMLElement) {
      return value
    } else if (typeof value === 'string') {
      const possibleElement = parent.querySelector(value)

      if (possibleElement instanceof HTMLElement) {
        return possibleElement
      }
    } else {
      const possibleElement = parent.querySelector(fallbackSelector)

      if (possibleElement instanceof HTMLElement) {
        return possibleElement
      }
    }

    throw new Error(`Failed to locate element for "${String(key)} option."`)
  }

  function should<K extends keyof T>(key: K, defaultValue?: T[K]): boolean {
    const v = options ? options[key] : undefined
    if (v === undefined && defaultValue !== undefined) {
      return !!defaultValue
    }

    return !!v
  }

  function set<K extends keyof T>(key: K, value: T[K]): void {
    if (!options) {
      // @ts-ignore
      options = {}
    }
    options[key] = value
  }

  function setAll(newOptions: T) {
    options = newOptions
  }

  return {
    get,
    getRequired,
    getElement,
    should,
    set,
    setAll,
  }
}

export function defineArtboardPlugin<
  T extends object,
  V = object extends T ? true : false,
>(
  init: ArtboardPluginInit<T>,
): V extends true
  ? // No option properties are required.
    (options?: T) => ArtboardPluginDefinition<T>
  : // Some option properties are required, thus an object argument is required.
    (options: T) => ArtboardPluginDefinition<T> {
  return function (providedOptions?: T) {
    const options = pluginOptions(providedOptions as T)
    return {
      options,
      init,
    }
  }
}
