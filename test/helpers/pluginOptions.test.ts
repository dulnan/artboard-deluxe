import { describe, it, expect } from 'vitest'
import { pluginOptions } from '~/helpers/pluginOptions'

type TestOptions = {
  name?: string
  count?: number
  enabled?: boolean
  element?: HTMLElement | string
}

describe('pluginOptions', () => {
  describe('get', () => {
    it('returns the option value', () => {
      const opts = pluginOptions<TestOptions>({ name: 'test', count: 5 })
      expect(opts.get('name')).toBe('test')
      expect(opts.get('count')).toBe(5)
    })

    it('returns undefined for unset option', () => {
      const opts = pluginOptions<TestOptions>({})
      expect(opts.get('name')).toBeUndefined()
    })

    it('returns default value when option is undefined', () => {
      const opts = pluginOptions<TestOptions>({})
      expect(opts.get('name', 'default')).toBe('default')
    })

    it('returns default value for NaN number option', () => {
      const opts = pluginOptions<TestOptions>({ count: NaN })
      expect(opts.get('count', 10)).toBe(10)
    })
  })

  describe('getRequired', () => {
    it('returns value when set', () => {
      const opts = pluginOptions<TestOptions>({ name: 'test' })
      expect(opts.getRequired('name')).toBe('test')
    })

    it('throws when value is undefined', () => {
      const opts = pluginOptions<TestOptions>({})
      expect(() => opts.getRequired('name')).toThrow(
        'Missing required plugin option "name"',
      )
    })

    it('throws when value is null', () => {
      const opts = pluginOptions<TestOptions>({
        name: null as unknown as string,
      })
      expect(() => opts.getRequired('name')).toThrow()
    })
  })

  describe('should', () => {
    it('returns true for truthy value', () => {
      const opts = pluginOptions<TestOptions>({ enabled: true })
      expect(opts.should('enabled')).toBe(true)
    })

    it('returns false for falsy value', () => {
      const opts = pluginOptions<TestOptions>({ enabled: false })
      expect(opts.should('enabled')).toBe(false)
    })

    it('uses default when value is undefined', () => {
      const opts = pluginOptions<TestOptions>({})
      expect(opts.should('enabled', true)).toBe(true)
      expect(opts.should('enabled', false)).toBe(false)
    })

    it('returns false when undefined and no default', () => {
      const opts = pluginOptions<TestOptions>({})
      expect(opts.should('enabled')).toBe(false)
    })
  })

  describe('set', () => {
    it('updates a single option', () => {
      const opts = pluginOptions<TestOptions>({ name: 'old' })
      opts.set('name', 'new')
      expect(opts.get('name')).toBe('new')
    })
  })

  describe('setAll', () => {
    it('replaces all options', () => {
      const opts = pluginOptions<TestOptions>({ name: 'old', count: 1 })
      opts.setAll({ name: 'new' })
      expect(opts.get('name')).toBe('new')
      expect(opts.get('count')).toBeUndefined()
    })
  })

  describe('setMultiple', () => {
    it('merges partial options', () => {
      const opts = pluginOptions<TestOptions>({ name: 'old', count: 1 })
      opts.setMultiple({ name: 'new' })
      expect(opts.get('name')).toBe('new')
      expect(opts.get('count')).toBe(1)
    })
  })

  describe('computed', () => {
    it('computes and caches a derived value', () => {
      const opts = pluginOptions<TestOptions>({ name: 'hello' })
      const derived = opts.computed((o) => (o.name ?? '').toUpperCase())
      expect(derived.value).toBe('HELLO')
    })

    it('returns the same cache object for the same callback', () => {
      const opts = pluginOptions<TestOptions>({ name: 'hello' })
      const cb = (o: TestOptions) => (o.name ?? '').toUpperCase()
      const a = opts.computed(cb)
      const b = opts.computed(cb)
      expect(a).toBe(b)
    })

    it('recomputes when options change via set', () => {
      const opts = pluginOptions<TestOptions>({ name: 'hello' })
      const derived = opts.computed((o) => (o.name ?? '').toUpperCase())
      expect(derived.value).toBe('HELLO')

      opts.set('name', 'world')
      expect(derived.value).toBe('WORLD')
    })

    it('recomputes when options change via setAll', () => {
      const opts = pluginOptions<TestOptions>({ name: 'hello' })
      const derived = opts.computed((o) => (o.name ?? '').toUpperCase())

      opts.setAll({ name: 'new' })
      expect(derived.value).toBe('NEW')
    })

    it('recomputes when options change via setMultiple', () => {
      const opts = pluginOptions<TestOptions>({ name: 'hello', count: 1 })
      const derived = opts.computed((o) => `${o.name}-${o.count}`)

      opts.setMultiple({ count: 42 })
      expect(derived.value).toBe('hello-42')
    })
  })
})
