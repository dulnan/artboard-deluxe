// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { isMac } from '~/helpers/userAgent'

describe('isMac', () => {
  function withUserAgent(ua: string, fn: () => void) {
    const original = navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      value: ua,
      configurable: true,
    })
    try {
      fn()
    } finally {
      Object.defineProperty(navigator, 'userAgent', {
        value: original,
        configurable: true,
      })
    }
  }

  it('returns true for Mac user agent', () => {
    withUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      () => {
        expect(isMac()).toBe(true)
      },
    )
  })

  it('returns true for iPhone user agent', () => {
    withUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      () => {
        expect(isMac()).toBe(true)
      },
    )
  })

  it('returns true for iPad user agent', () => {
    withUserAgent('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)', () => {
      expect(isMac()).toBe(true)
    })
  })

  it('returns true for iPod user agent', () => {
    withUserAgent('Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0)', () => {
      expect(isMac()).toBe(true)
    })
  })

  it('returns false for Windows user agent', () => {
    withUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      () => {
        expect(isMac()).toBe(false)
      },
    )
  })

  it('returns false for Linux user agent', () => {
    withUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', () => {
      expect(isMac()).toBe(false)
    })
  })

  it('returns false for Android user agent', () => {
    withUserAgent('Mozilla/5.0 (Linux; Android 11; Pixel 5)', () => {
      expect(isMac()).toBe(false)
    })
  })
})
