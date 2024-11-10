import type { AnimationOptions } from '../../../src/helpers/animation'
import type { VelocityQueueOptions } from '../../../src/helpers/queue'

export type PluginOptionBoolean = {
  type: 'boolean'
  title: string
  description: string
  defaultValue: boolean
}

export type PluginOptionAnimation = {
  type: 'animation'
  title: string
  description: string
  defaultValue: Required<AnimationOptions>
}

export type PluginOptionVelocity = {
  type: 'velocity'
  title: string
  description: string
  defaultValue: Required<VelocityQueueOptions>
}

export type PluginOptionRange = {
  type: 'range'
  title: string
  description: string
  defaultValue: number
  min: number
  max: number
  step: number
  suffix?: string
}

export type PluginOption =
  | PluginOptionBoolean
  | PluginOptionRange
  | PluginOptionAnimation
  | PluginOptionVelocity

export function defineRangeOption(
  title: string,
  description: string,
  min: number,
  max: number,
  step: number,
  defaultValue: number,
  suffix?: string,
): PluginOptionRange {
  return {
    type: 'range',
    title,
    description,
    defaultValue,
    min,
    max,
    step,
    suffix,
  }
}

export function defineBooleanOption(
  title: string,
  description: string,
  defaultValue: boolean,
): PluginOptionBoolean {
  return {
    type: 'boolean',
    title,
    description,
    defaultValue,
  }
}

export function defineAnimationOption(
  title: string,
  description: string,
  defaultValue: Required<AnimationOptions>,
): PluginOptionAnimation {
  return {
    type: 'animation',
    title,
    description,
    defaultValue,
  }
}

export function defineVelocityOption(
  title: string,
  description: string,
  defaultValue: Required<VelocityQueueOptions>,
): PluginOptionVelocity {
  return {
    type: 'velocity',
    title,
    description,
    defaultValue,
  }
}
