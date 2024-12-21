type OnlyWritable<T> = {
  [P in keyof T as T[P] extends string
    ? P extends `set${string}` | `get${string}`
      ? never
      : P
    : never]: T[P]
}

type WritableStyleProperty = keyof OnlyWritable<CSSStyleDeclaration>

export type InlineStyleOverrider = {
  /**
   * Sets the given style property value on the element.
   *
   * @param  property - The style property to set.
   * @param  value - The value to set. If a number, the value is applied as pixels.
   */
  set(property: WritableStyleProperty, value: string | number): void

  /**
   * Sets the transform value.
   */
  setTransform(x: number, y: number, scale?: number, scaleY?: number): void

  /**
   * Applies the provided overrides on the element.
   */
  setMultiple(
    styles: Partial<Record<WritableStyleProperty, string | number>>,
  ): void

  /**
   * Restores the original style values.
   */
  restore(): void
}

/**
 * Override inline styles on an element and keep track of the original styles.
 */
export function inlineStyleOverrider(
  element: HTMLElement,
): InlineStyleOverrider {
  // The initial styles of the el
  const overridenStyles: Map<WritableStyleProperty, string> = new Map()
  const prevValues: Map<WritableStyleProperty, string | number> = new Map()

  function set(property: WritableStyleProperty, value: string | number) {
    const prev = prevValues.get(property)

    if (prev === value) {
      return
    }

    if (prev === undefined) {
      overridenStyles.set(property, element.style[property])
    }

    element.style[property] = typeof value === 'number' ? value + 'px' : value
    prevValues.set(property, value)
  }

  function setTransform(x: number, y: number, scale?: number, scaleY?: number) {
    let transform = `translate3d(${x}px, ${y}px, 0px)`
    if (scale) {
      if (scaleY) {
        transform += ` scale(${scale}, ${scaleY})`
      } else {
        transform += ` scale(${scale})`
      }
    }

    set('transform', transform)
  }

  function setMultiple(styles: Partial<Record<WritableStyleProperty, string>>) {
    Object.entries(styles).forEach(([property, value]) => {
      if (value !== undefined) {
        set(property as WritableStyleProperty, value)
      }
    })
  }

  function restore() {
    try {
      overridenStyles.entries().forEach(([property, value]) => {
        element.style[property] = value
      })
    } catch {}
  }

  return {
    set,
    setTransform,
    setMultiple,
    restore,
  }
}
