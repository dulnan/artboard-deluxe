import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createVelocityQueue, createDirectionQueue } from '~/helpers/queue'

let mockTime = 0

beforeEach(() => {
  mockTime = 0
  vi.spyOn(performance, 'now').mockImplementation(() => mockTime)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createVelocityQueue', () => {
  const defaultOptions = {
    maxTimeWindow: 400,
    minVelocity: 50,
    maxVelocity: 5000,
    multiplicator: 1,
  }

  it('returns zero velocity with no data', () => {
    const queue = createVelocityQueue(defaultOptions)
    expect(queue.getVelocity()).toEqual({ x: 0, y: 0 })
  })

  it('returns zero velocity with only one data point', () => {
    const queue = createVelocityQueue(defaultOptions)
    mockTime = 0
    queue.add({ x: 0, y: 0 })
    expect(queue.getVelocity()).toEqual({ x: 0, y: 0 })
  })

  it('calculates positive x velocity for rightward movement', () => {
    const queue = createVelocityQueue(defaultOptions)
    mockTime = 0
    queue.add({ x: 0, y: 0 })
    mockTime = 100
    queue.add({ x: 100, y: 0 })

    const velocity = queue.getVelocity()
    expect(velocity.x).toBeGreaterThan(0)
    expect(velocity.y).toBe(0)
  })

  it('calculates negative x velocity for leftward movement', () => {
    const queue = createVelocityQueue(defaultOptions)
    mockTime = 0
    queue.add({ x: 100, y: 0 })
    mockTime = 100
    queue.add({ x: 0, y: 0 })

    const velocity = queue.getVelocity()
    expect(velocity.x).toBeLessThan(0)
  })

  it('calculates velocity on both axes', () => {
    const queue = createVelocityQueue(defaultOptions)
    mockTime = 0
    queue.add({ x: 0, y: 0 })
    mockTime = 100
    queue.add({ x: 100, y: 200 })

    const velocity = queue.getVelocity()
    expect(velocity.x).toBeGreaterThan(0)
    expect(velocity.y).toBeGreaterThan(0)
  })

  it('clamps velocity to maxVelocity', () => {
    const queue = createVelocityQueue({
      ...defaultOptions,
      maxVelocity: 100,
    })
    mockTime = 0
    queue.add({ x: 0, y: 0 })
    mockTime = 1 // Very short time = very high velocity
    queue.add({ x: 10000, y: 0 })

    const velocity = queue.getVelocity()
    expect(Math.abs(velocity.x)).toBeLessThanOrEqual(100)
  })

  it('returns zero for velocity below minVelocity', () => {
    const queue = createVelocityQueue({
      ...defaultOptions,
      minVelocity: 1000,
    })
    mockTime = 0
    queue.add({ x: 0, y: 0 })
    mockTime = 100
    queue.add({ x: 1, y: 0 }) // Very slow movement

    const velocity = queue.getVelocity()
    expect(velocity.x).toBe(0)
  })

  it('applies multiplicator', () => {
    const queue1 = createVelocityQueue({ ...defaultOptions, multiplicator: 1 })
    const queue2 = createVelocityQueue({ ...defaultOptions, multiplicator: 2 })

    mockTime = 0
    queue1.add({ x: 0, y: 0 })
    queue2.add({ x: 0, y: 0 })
    mockTime = 100
    queue1.add({ x: 100, y: 0 })
    queue2.add({ x: 100, y: 0 })

    const v1 = queue1.getVelocity()
    const v2 = queue2.getVelocity()
    expect(v2.x).toBeCloseTo(v1.x * 2)
  })

  it('ignores data points outside maxTimeWindow', () => {
    const queue = createVelocityQueue({
      ...defaultOptions,
      maxTimeWindow: 200,
    })

    mockTime = 0
    queue.add({ x: 0, y: 0 })
    mockTime = 100
    queue.add({ x: 500, y: 0 }) // Fast early movement
    mockTime = 400
    queue.add({ x: 501, y: 0 }) // Slow recent movement

    const velocity = queue.getVelocity()
    // The first point is outside the 200ms window from the last point (400-0=400 > 200)
    // So velocity should be based only on the last two points
    expect(velocity.x).toBeLessThan(100)
  })

  it('init resets the queue and updates options', () => {
    const queue = createVelocityQueue(defaultOptions)
    mockTime = 0
    queue.add({ x: 0, y: 0 })
    mockTime = 100
    queue.add({ x: 100, y: 0 })

    queue.init({ maxVelocity: 50 })
    expect(queue.getVelocity()).toEqual({ x: 0, y: 0 })
  })

  it('returns zero velocity when all points have the same timestamp', () => {
    const queue = createVelocityQueue(defaultOptions)
    mockTime = 100
    queue.add({ x: 0, y: 0 })
    queue.add({ x: 100, y: 0 })

    const velocity = queue.getVelocity()
    expect(velocity).toEqual({ x: 0, y: 0 })
  })
})

describe('createDirectionQueue', () => {
  it('returns undefined with fewer than 2 points', () => {
    const queue = createDirectionQueue({ threshold: 30 })
    expect(queue.getDirection()).toBeUndefined()

    mockTime = 0
    queue.add({ x: 0, y: 0 })
    expect(queue.getDirection()).toBeUndefined()
  })

  it('returns undefined when time diff is too small and fewer than 6 points', () => {
    const queue = createDirectionQueue({ threshold: 30 })
    mockTime = 0
    queue.add({ x: 0, y: 0 })
    mockTime = 10 // Only 10ms apart, < 50ms threshold
    queue.add({ x: 100, y: 0 })

    expect(queue.getDirection()).toBeUndefined()
  })

  it('detects horizontal direction when forced', () => {
    const queue = createDirectionQueue({ threshold: 30 })
    mockTime = 0
    queue.add({ x: 0, y: 0 })
    mockTime = 10
    queue.add({ x: 100, y: 0 })

    expect(queue.getDirection(true)).toBe('horizontal')
  })

  it('detects vertical direction when forced', () => {
    const queue = createDirectionQueue({ threshold: 30 })
    mockTime = 0
    queue.add({ x: 0, y: 0 })
    mockTime = 10
    queue.add({ x: 0, y: 100 })

    expect(queue.getDirection(true)).toBe('vertical')
  })

  it('detects both direction for diagonal movement when forced', () => {
    const queue = createDirectionQueue({ threshold: 30 })
    mockTime = 0
    queue.add({ x: 0, y: 0 })
    mockTime = 10
    queue.add({ x: 100, y: 100 })

    expect(queue.getDirection(true)).toBe('both')
  })

  it('detects direction after enough time has passed', () => {
    const queue = createDirectionQueue({ threshold: 30 })
    mockTime = 0
    queue.add({ x: 0, y: 0 })
    mockTime = 60 // > 50ms threshold
    queue.add({ x: 100, y: 0 })

    expect(queue.getDirection()).toBe('horizontal')
  })

  it('detects direction when more than 5 points are added', () => {
    const queue = createDirectionQueue({ threshold: 30 })
    for (let i = 0; i < 6; i++) {
      mockTime = i * 5 // Small time increments
      queue.add({ x: i * 10, y: 0 })
    }

    expect(queue.getDirection()).toBe('horizontal')
  })

  it('reset clears all state', () => {
    const queue = createDirectionQueue({ threshold: 30 })
    mockTime = 0
    queue.add({ x: 0, y: 0 })
    mockTime = 60
    queue.add({ x: 100, y: 0 })

    queue.reset()
    expect(queue.getDirection()).toBeUndefined()
  })
})
