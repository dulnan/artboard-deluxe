import type { Direction } from '../types'
import { isMac } from './userAgent'

interface WheelEventData {
  deltaX: number
  deltaY: number
  timestamp: number
}

interface NormalizedWheelDelta {
  x: number
  y: number
  z: number
  direction: Direction
}

// Limit the amount that can be zoomed per event.
const MAX_ZOOM_STEP = 10

// Maximum events to keep in buffer.
const BUFFER_SIZE = 10

// Min events before direction can be detected.
const DETECTION_THRESHOLD = 3

// How long a detected direction should "persist" in milliseconds.
const DIRECTION_LOCK_DURATION = 500

// Number of events that differ from current direction needed before direction
// is switched.
const CONTRARY_EVENTS_THRESHOLD = 6

// Max age for collected events.
const EVENT_EXPIRY_TIME = 500

// Ratio to determine primary axis. Lower value => more likely to get "both" as
// the direction.
const AXIS_PRIMARY_RATIO = 2.5

// Minimum wheel delta to consider generally.
const MIN_DELTA_THRESHOLD = 0.5

// Minimum ratio for detecting "both" from 0 to 1. (e.g. 0.3 means the smaller
// axis must be at least 30% of the larger one).
const BOTH_AXIS_MIN_RATIO = 0.2

export class WheelNormalizer {
  private eventBuffer: WheelEventData[] = []
  private currentDirection: Direction = 'none'
  private directionLockTimestamp = 0
  private contraryEventCount = 0
  private isMac = isMac()

  /**
   * Process a wheel event and return normalized deltas.
   */
  onWheel(event: WheelEvent): NormalizedWheelDelta {
    let { deltaY, deltaX } = event
    let deltaZ = 0

    // Adapted from https://stackoverflow.com/a/13650579
    if (event.ctrlKey || event.altKey || event.metaKey) {
      deltaZ =
        (Math.abs(deltaY) > MAX_ZOOM_STEP
          ? MAX_ZOOM_STEP * Math.sign(deltaY)
          : deltaY) / 100
    } else {
      if (event.shiftKey && !this.isMac) {
        deltaX = deltaY
        deltaY = 0
        this.setDirection('horizontal', event.timeStamp)
      }
    }

    // Remove old events from buffer.
    this.eventBuffer = this.eventBuffer.filter(
      (e) => event.timeStamp - e.timestamp < EVENT_EXPIRY_TIME,
    )
    this.eventBuffer.push({
      deltaX: Math.abs(event.deltaX) > MIN_DELTA_THRESHOLD ? event.deltaX : 0,
      deltaY: Math.abs(event.deltaY) > MIN_DELTA_THRESHOLD ? event.deltaY : 0,
      timestamp: event.timeStamp,
    })

    if (this.eventBuffer.length > BUFFER_SIZE) {
      this.eventBuffer.shift()
    }

    // Check if direction lock has expired.
    if (
      this.currentDirection !== 'none' &&
      event.timeStamp - this.directionLockTimestamp > DIRECTION_LOCK_DURATION
    ) {
      this.resetDirection()
    }

    // Detect or validate direction.
    if (this.currentDirection === 'none') {
      this.detectDirection(event.timeStamp)
    } else {
      this.validateCurrentDirection(event, event.timeStamp)
    }

    return {
      x: this.currentDirection === 'vertical' ? 0 : deltaX,
      y: this.currentDirection === 'horizontal' ? 0 : deltaY,
      z: deltaZ,
      direction: this.currentDirection,
    }
  }

  /**
   * Detect scroll direction based on buffered events
   */
  private detectDirection(currentTime: number): void {
    if (this.eventBuffer.length < DETECTION_THRESHOLD) {
      return
    }

    // Calculate total deltas from recent events.
    const recentEvents = this.eventBuffer.slice(-DETECTION_THRESHOLD)
    let totalAbsX = 0
    let totalAbsY = 0

    for (const event of recentEvents) {
      totalAbsX += Math.abs(event.deltaX)
      totalAbsY += Math.abs(event.deltaY)
    }

    // Return if both are too small to determine direction.
    if (totalAbsX < MIN_DELTA_THRESHOLD && totalAbsY < MIN_DELTA_THRESHOLD) {
      return
    }

    const maxDelta = Math.max(totalAbsX, totalAbsY)
    const minDelta = Math.min(totalAbsX, totalAbsY)
    const ratio = maxDelta > 0 ? minDelta / maxDelta : 0

    if (ratio >= BOTH_AXIS_MIN_RATIO) {
      this.setDirection('both', currentTime)
    } else if (totalAbsX > totalAbsY) {
      this.setDirection('horizontal', currentTime)
    } else {
      this.setDirection('vertical', currentTime)
    }
  }

  /**
   * Validate if current direction is still correct or needs re-detection.
   */
  private validateCurrentDirection(
    event: WheelEvent,
    currentTime: number,
  ): void {
    const isContrary = this.isContraryEvent(event)

    if (isContrary) {
      this.contraryEventCount++

      if (this.contraryEventCount >= CONTRARY_EVENTS_THRESHOLD) {
        this.resetDirection()
        this.detectDirection(currentTime)
      }
    } else {
      this.contraryEventCount = 0
      this.directionLockTimestamp = currentTime
    }
  }

  /**
   * Check if event goes against current direction.
   */
  private isContraryEvent(event: WheelEvent): boolean {
    const absX = Math.abs(event.deltaX)
    const absY = Math.abs(event.deltaY)

    switch (this.currentDirection) {
      case 'horizontal':
        return absY > absX * AXIS_PRIMARY_RATIO && absY > MIN_DELTA_THRESHOLD

      case 'vertical':
        return absX > absY * AXIS_PRIMARY_RATIO && absX > MIN_DELTA_THRESHOLD
    }

    return false
  }

  /**
   * Set the current direction and lock timestamp.
   */
  private setDirection(direction: Direction, timestamp: number): void {
    this.currentDirection = direction
    this.directionLockTimestamp = timestamp
    this.contraryEventCount = 0
  }

  /**
   * Reset direction to none.
   */
  private resetDirection(): void {
    this.currentDirection = 'none'
    this.directionLockTimestamp = 0
    this.contraryEventCount = 0
  }

  /**
   * Reset to initial state.
   */
  reset(): void {
    this.eventBuffer = []
    this.resetDirection()
  }
}
