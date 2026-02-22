# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Artboard Deluxe is a touch and mouse-friendly interactive artboard library for web applications. It provides panning, zooming, scrolling, and momentum physics for DOM elements or HTML canvas content via a plugin-based architecture.

## Commands

### Build & Development
- `npm run build` — Build library using unbuild (outputs CJS/ESM/types to `dist/`)
- `npm run dev` — Start Nuxt dev server (demo website)
- `npm run dev:prepare` — Prepare Nuxt setup (run before first `npm run dev`)

### Code Quality
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run prettier` / `npm run prettier:fix` — Prettier formatting
- `npm run typecheck:library` — TypeScript check for the library only
- `npm run typecheck` — TypeScript check for library + Nuxt website
- `npm run knip` — Detect unused exports/dependencies

### Documentation
- `npm run docs:dev` — VitePress dev server
- `npm run docs:build` — Build VitePress documentation

## Architecture

### Core (`src/artboard/`)
- **`createArtboard.ts`** — Main factory function (~1000 lines). Creates the artboard instance managing internal state (offset, scale, animation, momentum), ResizeObserver, and plugin lifecycle. Exposes 40+ public methods for interaction.
- **`options.ts`** — Options manager with defaults (minScale: 0.1, maxScale: 5, direction: 'both', etc.). Handles overscroll bounds parsing and blocking rects.

### Plugin System (`src/plugins/`)
- **`defineArtboardPlugin.ts`** — Generic factory helper for creating type-safe plugins with options and return types.
- **13 built-in plugins**: `mouse`, `touch`, `wheel`, `keyboard`, `dom`, `raf`, `clickZoom`, `doubleTapZoom`, `scrollbar`, `overview`, `sticky`, `cssProperties`, `scrollIntoView`. Each is in its own subdirectory.
- Plugins receive the artboard instance and return cleanup/API objects. They are added/removed via the artboard's plugin lifecycle.

### Helpers (`src/helpers/`)
- **`index.ts`** — Math/geometry utilities: dampening, lerp, clamp, center position calculation, direction detection
- **`momentum.ts`** — Physics for velocity decay and boundary dampening (pan + pinch)
- **`animation/`** — Animation loop with easing functions (easeOutCubic, easeInOutExpo, etc.)
- **`queue.ts`** — Velocity queue for tracking recent positions to compute momentum
- **`inlineStyleOverrider.ts`** — Safe inline style override/restore for DOM elements

### Types (`src/types/`)
- **`index.ts`** — Core type definitions (~1100 lines): Artboard, ArtboardOptions, ArtboardState, plugin types, interaction/momentum types
- **`geometry.ts`** — Geometric primitives: `Coord`, `Size`, `Rectangle`, `Boundaries`, `Edge`

### Key Design Patterns
- **Plugin architecture**: All interaction (mouse, touch, wheel, keyboard) is handled by composable plugins, not the core
- **Frame-based updates**: Animation and momentum use requestAnimationFrame with easing
- **Centralized state**: The artboard holds all state (offset, scale, momentum, interaction mode) and plugins read/write through it
- **Tree-shakeable**: `sideEffects: false` — unused plugins are excluded from bundles

## Build Configuration

- **unbuild** with Rollup: entry `src/index.ts` → `dist/index.cjs`, `dist/index.mjs`, `dist/index.d.ts`
- **TypeScript**: ES2022 target, strict mode, no unused locals/parameters
- **ESLint**: Nuxt ESLint config with Tailwind CSS plugin

## Project Layout

- `src/` — Library source code
- `website/` — Nuxt demo/showcase site
- `docs/` — VitePress documentation site
- `scripts/` — Build and asset management scripts
