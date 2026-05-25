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
| `Ctrl + C` | Copy selected shape |
| `Ctrl + V` | Paste copied shape (offset by 20 px) |
| `Ctrl + Z` | Undo |
| `Escape` | Deselect / cancel ghost |

## Try this sample puzzle
Scan the QR Code for the puzzle or click [here](https://ricochet.jstrgames.com/?g=N4IgbgpgTgzglgewHYgFwEYA0IBGCCGUAJmqAO5xEAuAFmgBwAMj2NEcA5jVWgKy+MAvtiqEOEHqlAAPNABYAzAuwBPNACZ6ykFHxE4AVxgah2ALb5pAJTgBjBLbZVjqAdnwAbDwjIQiAdU8PFwBtECoEAAcQbDwqCLMYkA8IADMebChObhAAXWwYGnxIiFDQSjQQBXUATi11HFSAWnVbORwmuQgAdg6aolsiJvoILt58CHV1ADZGBSSqFRLKqiz8JA4UpNtZDDlp7Fs1VHVullx8GAg0dF45VnYuSXQZzIRRKkQUVBrTcpJUCBeNNBgpeP0mowILxup00owmvh1HJmu1uhAcLwlC8INcREtroDVnB1ps8SAdvItIdjup0FgLlcbncHtlnq8dO98J9kBoYQA6GFyRgw9AKOQw9S8YT-SqpXFS+jtJrTVKpWFyLoKJo1fC-Jq2KHqHr0dBzGq2BYElZrDZbQ67TQHCnHdD0XixS6EpTTfnTab0broGpyenobpyGqsp43DlQLk877h3j86qKumh+n0dQKGUgCqA7rTXH0fC8eiIojqzqpTVNHAoiBNVLTKs9Xi2XjqRipK3LIm2snbR3CmloBRFz1M1A+v0BoMhsMRqMgNhs2PO+MfL43RippWMbvz6bdsXTPMFkD+nD4eUveuMOqdRQVi2pBFmhREHBTU3oHA4H2hLhIO9oUrs+zOkc47+lOhK3Pcq6PDkGBxgmO4nPQ9D8swobTOgszgmKcgXgCuC2DUqTVCCTTdPg+AInI7rqDq9A4NMnSqtmqQ4OgqT4L0QE2iSdrkpSM4wmOmHdHBDAKPyLxzN0RaMGcSr0Cua4xq4KZYbwYohtMChMDm+xvNuvKYdhuEEQRIo1MRpGVI0ObdA0TYNNMHRdBA2o1A5sJ3N0IYQIMxYKJa+L9iBIlDg6aD4Su0EnEoskYCySHrqhm7oZZCi3E5gL0Kk6j4AoIIsRKgadP+Qy-N02qDJoR7+ma5KLNFxKkmB4kwlBxzCjJjLwRlWkoWa6D8tmShFpGjD0CeSrmdyGFmthiiRkx2a1FMh6FSA-HFjgjBtPWRBuZ0vAlTqvGwoe6LdEwx0TtMQkDrFPW7P66hSeKiE3tOWgKd2E4qWpTGachkj8FN7oGfsxmHuKOUWd8mjWYweF2UR4r7VCXlEMGvCdMFcg1vKwxQugBo1EZmJiqM-5vTooUZOB46Y1J+wrhQ1B0Kgka6UxCHTEGWgLdGKHdstiY3JNbn6YptwEQIWL7SVC1GcGLS2LMnTGR0OBELwHRfsK6C2KkWjQugzNQKzw4wUNyU1PJHogLztB8L8kuSNLnKo+OXb8pqAYKIeyI1Gcyl47xti2N0WJNH40xk1qFY4KWQzGRbMLxzg+VyHbDvxagbndIKUmaDUlce5QXsnOcY2SPsDJbitll-PmZHQje+DoPgHEzHonQUX0IrU5jN6ER2OA1OozO2HAUC2J9CWKFJYraLo+hGPINe-HNNQwn+-rnpgsqAvggadj0CIiiel2GjqRC000CgQCMuoD67RD4Ivy9V5iS+goJKA1aaZD0IYFwSgcJuldqAk8wY-yCFyIIIAA)

![Sample Puzzle](public/sample-game-puzzle.png)