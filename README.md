# Ricochet

> Design ricochet puzzles with geometric obstacles, set a bounce limit, then challenge friends with a share link. No install needed.

![Ricochet logo](public/logo.png)

---

## What is it?

Ricochet is a browser-based physics puzzle game with two roles:

- **Creator** - places geometric obstacles (rectangles, triangles, circles) and a target on a board, sets a maximum ricochet count, restricts which walls the player may start from, then validates and shares the puzzle via URL.
- **Player** - loads the shared URL, picks a start position on the board wall, adjusts the launch angle, fires, and tries to hit the target within the ricochet limit.

No backend. No accounts. Game state is LZString-compressed JSON encoded in the URL query parameter `?g=`.

---

## Features

- **Shape tools** - place, resize, and rotate rectangles, triangles, and circles
- **Custom board size** - desktop (800 × 550) or mobile (390 × 720) presets, or custom W × H
- **Wall restrictions** - limit which walls the player can use as a starting position
- **Validation gate** - the share link unlocks only after the creator proves the puzzle is solvable
- **Remix** - players can open any shared level in the editor to build their own variant
- **Responsive** - works on desktop and mobile; all drag interactions use Pointer Events
- **No-install sharing** - one URL encodes the entire puzzle; no server needed

---

## Tech stack

| Concern | Choice |
|---|---|
| Language | TypeScript 6 (strict mode) |
| Framework | React 19 (functional components, hooks) |
| Build | Vite 8 |
| Rendering | SVG - vector math, no canvas |
| URL compression | [lz-string](https://github.com/pieroxy/lz-string) |
| Shape IDs | [uuid](https://github.com/uuidjs/uuid) |
| Physics | Custom ray-casting (no library) |
| Styling | Plain CSS - no UI framework |

---

## Physics

The ball is a ray. At each step the engine tests the ray against all shape edges, board walls, and the target circle:

- **Segments** - rectangles and triangles are decomposed into rotated edges with outward normals; walls have inward normals.
- **Circles** - quadratic formula gives the nearest positive intersection; normal = `normalize(hit − center)`.
- **Reflection** - `r = d − 2(d·n)n` applied to the incoming unit direction `d` and surface normal `n`.
- **Corner hits** - two intersections within `1e-4` units are averaged into one normal and count as a single ricochet.
- **Win condition** - the target is checked before bounce candidates each step, so a ball passing through the bullseye wins immediately.

---

## URL routing

| URL | View |
|---|---|
| `/` | Creator - empty board |
| `/?g=<encoded>` | Player - shared puzzle |
| `/?g=<encoded>&edit=1` | Creator - edit existing puzzle |

Routing is handled in `App.tsx` via `new URLSearchParams(window.location.search)` - no router library.

---

## Project structure

```
src/
├── App.tsx                      # URL routing + test-mode bridge
├── constants.ts                 # EPSILON, board presets, colours, …
├── vite-env.d.ts                # Vite client type declarations
│
├── types/
│   └── index.ts                 # Vec2, Ray, Segment, Shape (discriminated union), Payload, …
│
├── physics/
│   ├── vector.ts                # Vec2 primitives
│   ├── ray.ts                   # raySegmentIntersect, rayCircleIntersect
│   ├── shapes.ts                # shape→segment registry (OCP dispatch table)
│   ├── reflect.ts               # reflectDirection, nudgeOrigin, resolveCorner
│   └── simulate.ts              # main loop → SimResult { path, outcome, ricochetCount }
│
├── encoding/
│   ├── codec.ts                 # encode(payload) / decode(str)
│   └── schema.ts                # validatePayload with type guards
│
├── hooks/
│   ├── useCreatorState.ts       # reducer: shapes, target, board, undo history
│   ├── useCreatorKeyboard.ts    # keyboard shortcuts (Del, Ctrl+Z, Esc) — SRP extract
│   ├── usePlayerState.ts        # reducer: aiming / animating / result phases
│   ├── useSvgCoords.ts          # clientToSvg via getScreenCTM().inverse()
│   └── useAnimationLoop.ts      # rAF loop with stroke-dasharray path reveal
│
├── creator/
│   ├── CreatorPage.tsx
│   ├── Toolbar.tsx              # tools, board size presets, wall toggles
│   ├── BoardCanvas.tsx          # SVG board + shape/ghost/target interaction
│   ├── ShapeOverlay.tsx         # select, move, resize, rotate handles
│   ├── DragHandle.tsx           # generic SVG drag primitive (Pointer Events)
│   ├── GhostShape.tsx           # preview while drawing
│   └── TargetMarker.tsx         # draggable bullseye
│
├── player/
│   ├── PlayerPage.tsx
│   ├── PlayerBoard.tsx          # board + aiming interaction
│   ├── StartPointHandle.tsx     # draggable S handle clamped to allowed walls
│   ├── AngleIndicator.tsx       # draggable aim arrow
│   ├── BallPath.tsx             # animated trail + ball circle
│   └── ResultOverlay.tsx        # win/lose modal; share link; remix prompt
│
├── shared/
│   ├── Board.tsx                # SVG container with per-wall colour coding
│   ├── ShapeRenderer.tsx        # rect / triangle / circle SVG primitives
│   ├── Target.tsx               # bullseye rings
│   └── AboutModal.tsx           # game info overlay
│
└── styles/
    └── global.css
```

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

---

## Deployment

The app is a fully static site - deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, S3, …).

After deploying, add a `<link rel="canonical" href="https://yourdomain.com/" />` to `index.html` and replace the relative `/logo.png` paths in the Open Graph / Twitter Card meta tags with absolute URLs so social-media card previews work correctly.

---

## Keyboard shortcuts (Creator)

| Key | Action |
|---|---|
| `Del` / `Backspace` | Delete selected shape |
| `Ctrl + Z` | Undo |
| `Escape` | Deselect / cancel ghost |
