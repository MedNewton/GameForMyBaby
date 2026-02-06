/* ─── Linear road journey map layout ───
 *
 * Map: 100×20 tiles at 16px = 1600×320 world pixels.
 * A horizontal road runs through the center (rows 8-11).
 * 5 story zones branch off the road, alternating above/below.
 * Grass is NOT walkable; only road + zone plazas are.
 * Barriers block progress until the current step is completed.
 *
 * Ground tile IDs:
 *   0 = grass (solid, not walkable)
 *   1 = dirt road (walkable)
 *   2 = flowers (decorative grass variant, solid)
 *
 * Section layout (each ~20 cols wide):
 *   Section 0 (cols  0-19): eat_shawarma – plaza above road
 *   Section 1 (cols 20-39): first_kiss   – plaza below road
 *   Section 2 (cols 40-59): visited_tetouan – plaza above road
 *   Section 3 (cols 60-79): first_sleep_rabat – plaza below road
 *   Section 4 (cols 80-99): final_house – plaza above road
 */

import type { TriggerId } from "./gameData";
import { ASSETS } from "./gameData";

export const MAP_W = 100;
export const MAP_H = 20;
export const TILE_SIZE = 16;
export const SCALE = 3;

export const WORLD_PX_W = MAP_W * TILE_SIZE;
export const WORLD_PX_H = MAP_H * TILE_SIZE;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ── Ground colors ──
export const GRASS_COLOR = "#6EB849";
export const GRASS_COLOR_ALT = "#62A840";
export const DIRT_COLOR = "#C4A46C";
export const DIRT_COLOR_ALT = "#B8986A";
// flower base uses GRASS_COLOR

// ── Ground layer: 0=grass, 1=road, 2=flowers ──
export const groundLayer: number[] = (() => {
  const g = new Array(MAP_W * MAP_H).fill(0); // all grass

  // Main road: rows 8-11 across the full width
  for (let row = 8; row <= 11; row++) {
    for (let col = 0; col < MAP_W; col++) {
      g[row * MAP_W + col] = 1;
    }
  }

  // ── Zone 0 (eat_shawarma): Plaza above road, cols 7-13, rows 4-7 ──
  // Connecting path: cols 9-11, rows 7 (already road at row 8)
  for (let row = 4; row <= 7; row++) {
    for (let col = 7; col <= 13; col++) {
      g[row * MAP_W + col] = 1;
    }
  }
  // Flowers around zone 0
  for (let col = 5; col <= 6; col++) { g[4 * MAP_W + col] = 2; g[5 * MAP_W + col] = 2; }
  for (let col = 14; col <= 15; col++) { g[4 * MAP_W + col] = 2; g[5 * MAP_W + col] = 2; }

  // ── Zone 1 (first_kiss): Plaza below road, cols 27-33, rows 12-15 ──
  for (let row = 12; row <= 15; row++) {
    for (let col = 27; col <= 33; col++) {
      g[row * MAP_W + col] = 1;
    }
  }
  // Flowers around zone 1
  for (let col = 25; col <= 26; col++) { g[14 * MAP_W + col] = 2; g[15 * MAP_W + col] = 2; }
  for (let col = 34; col <= 35; col++) { g[14 * MAP_W + col] = 2; g[15 * MAP_W + col] = 2; }

  // ── Zone 2 (visited_tetouan): Plaza above road, cols 47-53, rows 4-7 ──
  for (let row = 4; row <= 7; row++) {
    for (let col = 47; col <= 53; col++) {
      g[row * MAP_W + col] = 1;
    }
  }
  // Flowers
  for (let col = 45; col <= 46; col++) { g[4 * MAP_W + col] = 2; g[5 * MAP_W + col] = 2; }
  for (let col = 54; col <= 55; col++) { g[4 * MAP_W + col] = 2; g[5 * MAP_W + col] = 2; }

  // ── Zone 3 (first_sleep_rabat): Plaza below road, cols 67-73, rows 12-15 ──
  for (let row = 12; row <= 15; row++) {
    for (let col = 67; col <= 73; col++) {
      g[row * MAP_W + col] = 1;
    }
  }
  // Flowers
  for (let col = 65; col <= 66; col++) { g[14 * MAP_W + col] = 2; g[15 * MAP_W + col] = 2; }
  for (let col = 74; col <= 75; col++) { g[14 * MAP_W + col] = 2; g[15 * MAP_W + col] = 2; }

  // ── Zone 4 (final_house): Plaza above road, cols 87-93, rows 4-7 ──
  for (let row = 4; row <= 7; row++) {
    for (let col = 87; col <= 93; col++) {
      g[row * MAP_W + col] = 1;
    }
  }
  // Flowers
  for (let col = 85; col <= 86; col++) { g[4 * MAP_W + col] = 2; g[5 * MAP_W + col] = 2; }
  for (let col = 94; col <= 95; col++) { g[4 * MAP_W + col] = 2; g[5 * MAP_W + col] = 2; }

  return g;
})();

// ── Solid (collision) grid ──
// Grass=solid, road=walkable. Trees/barriers checked separately.
export const solid: boolean[] = (() => {
  const s = new Array(MAP_W * MAP_H).fill(false);
  for (let i = 0; i < MAP_W * MAP_H; i++) {
    // Anything that is NOT road (1) is solid
    if (groundLayer[i] !== 1) s[i] = true;
  }
  return s;
})();

// ── Barrier positions ──
// Barriers block the road at section boundaries until step is completed.
// barrierCols[i] blocks until currentStep > i
export const barrierCols = [19, 39, 59, 79];
export const BARRIER_ROWS = [8, 9, 10, 11]; // road rows

/** Check if a tile is a barrier given currentStep */
export function isBarrier(col: number, row: number, currentStep: number): boolean {
  for (let i = 0; i < barrierCols.length; i++) {
    if (col === barrierCols[i] && BARRIER_ROWS.includes(row)) {
      if (currentStep <= i) return true;
    }
  }
  return false;
}

// ── Trigger zones (world pixel rects) ──
export interface TriggerZone {
  id: TriggerId;
  rect: Rect;
  stepIndex: number;
}

export const triggers: TriggerZone[] = [
  {
    id: "eat_shawarma",
    rect: { x: 8 * TILE_SIZE, y: 4 * TILE_SIZE, w: 4 * TILE_SIZE, h: 3 * TILE_SIZE },
    stepIndex: 0,
  },
  {
    id: "first_kiss",
    rect: { x: 28 * TILE_SIZE, y: 12 * TILE_SIZE, w: 4 * TILE_SIZE, h: 3 * TILE_SIZE },
    stepIndex: 1,
  },
  {
    id: "visited_tetouan",
    rect: { x: 48 * TILE_SIZE, y: 4 * TILE_SIZE, w: 4 * TILE_SIZE, h: 3 * TILE_SIZE },
    stepIndex: 2,
  },
  {
    id: "first_sleep_rabat",
    rect: { x: 68 * TILE_SIZE, y: 12 * TILE_SIZE, w: 4 * TILE_SIZE, h: 3 * TILE_SIZE },
    stepIndex: 3,
  },
  {
    id: "final_house",
    rect: { x: 88 * TILE_SIZE, y: 4 * TILE_SIZE, w: 4 * TILE_SIZE, h: 3 * TILE_SIZE },
    stepIndex: 4,
  },
];

// ── Monster (Mom) start position ──
// Starts behind the player on the road, will chase them
export const monsterStart = {
  x: 1 * TILE_SIZE,
  y: 10 * TILE_SIZE,
};

// ── Player spawn (on the road, left side) ──
export const playerStart = {
  x: 3 * TILE_SIZE,
  y: 10 * TILE_SIZE,
};

// ── Zone labels with dates ──
export const zoneLabels = [
  { text: "First Time We Meet", date: "26 Feb 2024", x: 10 * TILE_SIZE, y: 3 * TILE_SIZE, above: true },
  { text: "Bus Station Kiss", date: "26 Feb 2024", x: 30 * TILE_SIZE, y: 16 * TILE_SIZE, above: false },
  { text: "First Time in T\u00e9touan", date: "26 Apr 2024", x: 50 * TILE_SIZE, y: 3 * TILE_SIZE, above: true },
  { text: "First Sleepover", date: "25 May 2025", x: 70 * TILE_SIZE, y: 16 * TILE_SIZE, above: false },
  { text: "Happily Ever After", date: "", x: 90 * TILE_SIZE, y: 3 * TILE_SIZE, above: true },
];

// ── Tree/bush decoration positions (world pixel coords + asset key) ──
export interface DecoSprite {
  assetUrl: string;
  x: number;   // world pixel x (top-left of image)
  y: number;   // world pixel y (top-left of image)
  w: number;   // draw width in world pixels
  h: number;   // draw height in world pixels
}

// Generate scattered trees and bushes along the road
export const decoSprites: DecoSprite[] = (() => {
  const sprites: DecoSprite[] = [];
  const treeUrls = [ASSETS.trees.emerald1, ASSETS.trees.emerald2, ASSETS.trees.emerald3, ASSETS.trees.emerald4];
  const bushUrls = [ASSETS.bushes.emerald1, ASSETS.bushes.emerald2, ASSETS.bushes.emerald3, ASSETS.bushes.emerald5];

  // Seeded pseudo-random for deterministic placement
  let seed = 42;
  function rand() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  // Border trees (top rows 0-2)
  for (let col = 0; col < MAP_W; col += 3) {
    const treeUrl = treeUrls[Math.floor(rand() * treeUrls.length)];
    const treeW = 32 + Math.floor(rand() * 16);
    const treeH = 40 + Math.floor(rand() * 24);
    sprites.push({
      assetUrl: treeUrl,
      x: col * TILE_SIZE + Math.floor(rand() * 8),
      y: Math.floor(rand() * 2) * TILE_SIZE,
      w: treeW,
      h: treeH,
    });
  }

  // Border trees (bottom rows 17-19)
  for (let col = 0; col < MAP_W; col += 3) {
    const treeUrl = treeUrls[Math.floor(rand() * treeUrls.length)];
    const treeW = 32 + Math.floor(rand() * 16);
    const treeH = 40 + Math.floor(rand() * 24);
    sprites.push({
      assetUrl: treeUrl,
      x: col * TILE_SIZE + Math.floor(rand() * 8),
      y: (17 + Math.floor(rand() * 2)) * TILE_SIZE,
      w: treeW,
      h: treeH,
    });
  }

  // Trees along the road edges (above and below) - avoid zone plazas
  const zoneRanges = [
    { startCol: 5, endCol: 16 },   // zone 0 area
    { startCol: 25, endCol: 36 },   // zone 1 area
    { startCol: 45, endCol: 56 },   // zone 2 area
    { startCol: 65, endCol: 76 },   // zone 3 area
    { startCol: 85, endCol: 96 },   // zone 4 area
  ];

  function isNearZone(col: number): boolean {
    return zoneRanges.some(z => col >= z.startCol && col <= z.endCol);
  }

  // Scattered trees above road (rows 2-6)
  for (let col = 2; col < MAP_W - 2; col += 4) {
    if (isNearZone(col)) continue;
    if (rand() > 0.7) continue;
    const treeUrl = treeUrls[Math.floor(rand() * treeUrls.length)];
    sprites.push({
      assetUrl: treeUrl,
      x: col * TILE_SIZE + Math.floor(rand() * 16),
      y: (2 + Math.floor(rand() * 4)) * TILE_SIZE,
      w: 36 + Math.floor(rand() * 16),
      h: 44 + Math.floor(rand() * 20),
    });
  }

  // Scattered trees below road (rows 13-17)
  for (let col = 2; col < MAP_W - 2; col += 4) {
    if (isNearZone(col)) continue;
    if (rand() > 0.7) continue;
    const treeUrl = treeUrls[Math.floor(rand() * treeUrls.length)];
    sprites.push({
      assetUrl: treeUrl,
      x: col * TILE_SIZE + Math.floor(rand() * 16),
      y: (13 + Math.floor(rand() * 4)) * TILE_SIZE,
      w: 36 + Math.floor(rand() * 16),
      h: 44 + Math.floor(rand() * 20),
    });
  }

  // Bushes scattered near road edges
  for (let col = 1; col < MAP_W - 1; col += 2) {
    if (isNearZone(col)) continue;
    if (rand() > 0.5) continue;
    const bushUrl = bushUrls[Math.floor(rand() * bushUrls.length)];
    const aboveOrBelow = rand() > 0.5;
    sprites.push({
      assetUrl: bushUrl,
      x: col * TILE_SIZE + Math.floor(rand() * 8),
      y: aboveOrBelow
        ? (6 + Math.floor(rand() * 2)) * TILE_SIZE
        : (12 + Math.floor(rand() * 2)) * TILE_SIZE,
      w: 20 + Math.floor(rand() * 12),
      h: 14 + Math.floor(rand() * 8),
    });
  }

  // Bushes near zone plazas for decoration
  for (const zone of zoneRanges) {
    for (let i = 0; i < 4; i++) {
      const bushUrl = bushUrls[Math.floor(rand() * bushUrls.length)];
      const col = zone.startCol + Math.floor(rand() * (zone.endCol - zone.startCol));
      const isAbove = zone === zoneRanges[0] || zone === zoneRanges[2] || zone === zoneRanges[4];
      sprites.push({
        assetUrl: bushUrl,
        x: col * TILE_SIZE,
        y: isAbove
          ? (2 + Math.floor(rand() * 2)) * TILE_SIZE
          : (16 + Math.floor(rand() * 2)) * TILE_SIZE,
        w: 22 + Math.floor(rand() * 10),
        h: 14 + Math.floor(rand() * 8),
      });
    }
  }

  return sprites;
})();
