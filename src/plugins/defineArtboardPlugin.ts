import type {
  ArtboardPluginDefinition,
  ArtboardPluginInit,
  ArtboardPluginOptions,
} from './../types'

function pluginOptions<T extends object>(
  providedOptions: T,
): ArtboardPluginOptions<T> {
  let options: T = providedOptions

  // Caches computed results by callback reference
  const computedCache = new Map<(opts: T) => unknown, { value: unknown }>()

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

  function recompute() {
    computedCache.forEach((cacheEntry, callback) => {
      cacheEntry.value = callback(options)
    })
  }

  function set<K extends keyof T>(key: K, value: T[K]): void {
    if (!options) {
      // @ts-ignore
      options = {}
    }
    options[key] = value
    recompute()
  }

  function setAll(newOptions: T) {
    options = newOptions
    recompute()
  }

  function computed<R>(callback: (opts: T) => R): { value: R } {
    if (computedCache.has(callback)) {
      return computedCache.get(callback) as { value: R }
    }

    const initialValue = callback(options)
    const cacheEntry = { value: initialValue }
    computedCache.set(callback, cacheEntry)
    return cacheEntry
  }

  return {
    get,
    getRequired,
    getElement,
    should,
    set,
    setAll,
    computed,
  }
}

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
