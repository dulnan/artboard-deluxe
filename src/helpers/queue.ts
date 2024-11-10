import type { Direction } from '../types'
import type { Coord } from '../types/geometry'

/**
 * Options for the velocity queue used to determine the velocity for momentum
 * scrolling.
 */
export type VelocityQueueOptions = {
  /**
   * The time span to look at for calculating the velocity in milliseconds.
   *
   * A value of 400 means only positions registered in the last 400ms will
   * determine the velocity.
   */
  maxTimeWindow: number

  /**
   * The minimum velocity.
   */
  minVelocity: number

  /**
   * The maximum velocity to calculate before applying the multiplicator.
   */
  maxVelocity: number

  /**
   * The multiplicator to apply to the final velocity.
   */
  multiplicator: number
}

export function createQueue<T>() {
  const queue: T[] = []
  const timeQueue: number[] = []

  function reset() {
    queue.splice(0)
    timeQueue.splice(0)
  }

  function add(position: T) {
    queue.push(position)
    timeQueue.push(performance.now())
  }

  return {
    reset,
    add,
    queue,
    timeQueue,
  }
}

export type DirectionQueueOptions = {
  threshold: number
}

export function createDirectionQueue(options: DirectionQueueOptions) {
  const queue = createQueue<Coord>()

  function getDirection(force?: boolean): Direction | undefined {
    if (queue.queue.length < 2) {
      return undefined
    }

    const timeDiff =
      queue.timeQueue[queue.timeQueue.length - 1] - queue.timeQueue[0]
    if (timeDiff > 50 || queue.queue.length > 5 || force) {
      // Calculate cumulative x and y deltas across all points.
      let totalDeltaX = 0
      let totalDeltaY = 0

      for (let i = 1; i < queue.queue.length; i++) {
        totalDeltaX += queue.queue[i].x - queue.queue[i - 1].x
        totalDeltaY += queue.queue[i].y - queue.queue[i - 1].y
      }

      // Calculate average movement per each axis.
      const avgDeltaX = totalDeltaX / (queue.queue.length - 1)
      const avgDeltaY = totalDeltaY / (queue.queue.length - 1)

      const absAvgDeltaX = Math.abs(avgDeltaX)
      const absAvgDeltaY = Math.abs(avgDeltaY)
      const angle = (Math.atan2(absAvgDeltaY, absAvgDeltaX) * 180) / Math.PI

      const isHorizontal =
        (angle >= -options.threshold && angle <= options.threshold) ||
        angle >= 180 - options.threshold ||
        angle <= -180 + options.threshold

      const isVertical =
        (angle >= 90 - options.threshold && angle <= 90 + options.threshold) ||
        (angle >= -90 - options.threshold && angle <= -90 + options.threshold)

      if (isHorizontal && !isVertical) {
        return 'horizontal'
      } else if (!isHorizontal && isVertical) {
        return 'vertical'
      }

      return 'both'
    }

    return undefined
  }

  function add(v: Coord) {
    queue.add(v)
  }

  function reset() {
    queue.reset()
  }

  return {
    getDirection,
    add,
    reset,
  }
}

export function createVelocityQueue(initOptions: VelocityQueueOptions) {
  const queue = createQueue<Coord>()

  let maxTimeWindow = initOptions.maxTimeWindow
  let minVelocity = initOptions.minVelocity
  let maxVelocity = initOptions.maxVelocity
  let multiplicator = initOptions.multiplicator

  function getVelocity(): Coord {
    const length = queue.timeQueue.length

    // Not enough data to calculate velocity.
    if (length < 2) {
      return { x: 0, y: 0 }
    }

    const lastIndex = length - 1
    const lastPos = queue.queue[lastIndex]
    const lastTime = queue.timeQueue[lastIndex]
    let weightedVelocityX = 0
    let weightedVelocityY = 0
    let totalWeight = 0

    for (let i = lastIndex - 1; i >= 0; i--) {
      const timeDiff = lastTime - queue.timeQueue[i]
      if (timeDiff > maxTimeWindow) {
        break
      }

      const pos = queue.queue[i]
      const distanceX = lastPos.x - pos.x
      const distanceY = lastPos.y - pos.y
      const timeInSeconds = timeDiff / 1000
      if (timeInSeconds === 0) {
        continue
      }

      const weight = 1 - timeDiff / maxTimeWindow
      weightedVelocityX += (distanceX / timeInSeconds) * weight
      weightedVelocityY += (distanceY / timeInSeconds) * weight
      totalWeight += weight
    }

    if (totalWeight === 0) {
      return { x: 0, y: 0 }
    }

    const averageVelocity: Coord = {
      x: limit((weightedVelocityX / totalWeight) * multiplicator),
      y: limit((weightedVelocityY / totalWeight) * multiplicator),
    }

    return {
      x: Math.abs(averageVelocity.x) >= minVelocity ? averageVelocity.x : 0,
      y: Math.abs(averageVelocity.y) >= minVelocity ? averageVelocity.y : 0,
    }
  }

  function limit(v: number) {
    return Math.min(Math.max(v, -maxVelocity), maxVelocity)
  }

  function add(v: Coord) {
    queue.add(v)
  }

  function init(options: Partial<VelocityQueueOptions>) {
    if (options.maxVelocity) {
      maxVelocity = options.maxVelocity
    }

    if (options.maxTimeWindow) {
      maxTimeWindow = options.maxTimeWindow
    }

    if (options.minVelocity) {
      minVelocity = options.minVelocity
    }

    if (options.multiplicator) {
      multiplicator = options.multiplicator
    }

    queue.reset()
  }

  return {
    getVelocity,
    add,
    init,
  }
}
