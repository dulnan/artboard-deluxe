import type { Rectangle } from 'artboard-deluxe'

export function isInsideRect(x: number, y: number, rect: Rectangle): boolean {
  return (
    x > rect.x &&
    x < rect.x + rect.width &&
    y > rect.y &&
    y < rect.y + rect.height
  )
}
