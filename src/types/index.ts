export interface Vec2 { x: number; y: number }
export interface Ray { origin: Vec2; direction: Vec2 }
export interface Segment { p1: Vec2; p2: Vec2; normal: Vec2 }
export interface CircleGeom { cx: number; cy: number; radius: number }
export interface HitResult { t: number; point: Vec2; normal: Vec2 }

// Shapes — discriminated union
export interface RectShape  { id: string; type: 'rect';     cx: number; cy: number; width: number; height: number; rotation: number }
export interface TriShape   { id: string; type: 'triangle'; cx: number; cy: number; base: number; height: number; rotation: number }
export interface CircShape  { id: string; type: 'circle';   cx: number; cy: number; radius: number }
export type Shape = RectShape | TriShape | CircShape

export interface Board   { width: number; height: number }
export interface Target  { x: number; y: number; radius: number }
export type WallName = 'top' | 'bottom' | 'left' | 'right'

export interface Payload {
  version: number
  board: Board
  target: Target
  maxRicochets: number
  shapes: Shape[]
  allowedWalls: WallName[]
}

export type Outcome = 'win' | 'lose'
export interface SimResult { path: Vec2[]; outcome: Outcome; ricochetCount: number }
