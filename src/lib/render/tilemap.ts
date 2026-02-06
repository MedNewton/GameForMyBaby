/* --- Tile & decoration rendering using real sprite assets --- */

import {
  GRASS_COLOR, GRASS_COLOR_ALT, DIRT_COLOR, DIRT_COLOR_ALT,
  barrierCols, BARRIER_ROWS,
  type DecoSprite,
} from "../data/mapLayout";
import { ASSETS } from "../data/gameData";

// -- Image cache --
const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(url: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(url);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function getCachedImage(url: string): HTMLImageElement | undefined {
  return imageCache.get(url);
}

export interface Camera {
  x: number;
  y: number;
  w: number;
  h: number;
}

// -- Preload all decoration images --
export async function preloadDecoImages(decos: DecoSprite[]) {
  const urls = new Set(decos.map(d => d.assetUrl));
  await Promise.all([...urls].map(url => loadImage(url)));
}

// -- Preload frame image --
let frameImg: HTMLImageElement | null = null;

export async function preloadFrameImage() {
  frameImg = await loadImage(ASSETS.framePinkGreen);
}

// -- Preload arrow image --
let arrowImg: HTMLImageElement | null = null;

export async function preloadArrowImage() {
  arrowImg = await loadImage(ASSETS.arrows);
}

// -- Preload heart emoji image --
let heartImg: HTMLImageElement | null = null;

export async function preloadHeartImage() {
  heartImg = await loadImage(ASSETS.heart);
}

// -- Preload chopped tree image --
let choppedTreeImg: HTMLImageElement | null = null;

export async function preloadChoppedTree() {
  choppedTreeImg = await loadImage(ASSETS.choppedTree);
}

// Arrow guide data per step (tile coordinates)
const stepArrowGuides: { roadArrows: number[][]; entrance: number[]; entranceDir: string }[] = [
  { roadArrows: [[5, 9.5], [7, 9.5]], entrance: [10, 7.5], entranceDir: "up" },
  { roadArrows: [[18, 9.5], [22, 9.5], [26, 9.5]], entrance: [30, 11.5], entranceDir: "down" },
  { roadArrows: [[38, 9.5], [42, 9.5], [46, 9.5]], entrance: [50, 7.5], entranceDir: "up" },
  { roadArrows: [[58, 9.5], [62, 9.5], [66, 9.5]], entrance: [70, 11.5], entranceDir: "down" },
  { roadArrows: [[78, 9.5], [82, 9.5], [86, 9.5]], entrance: [90, 7.5], entranceDir: "up" },
];

// Draw bouncing arrows on the road pointing toward the current goal
export function drawRoadArrows(
  ctx: CanvasRenderingContext2D,
  currentStep: number,
  tileSize: number,
  scale: number,
  camera: Camera,
  time: number,
) {
  if (!arrowImg || currentStep >= stepArrowGuides.length) return;

  const guide = stepArrowGuides[currentStep];
  const arrowSize = 12; // world pixels
  const drawSize = arrowSize * scale;
  // Red up arrow from spritesheet: row 2 (red section), col 0
  const srcX = 0;
  const srcY = 32;
  const srcW = 16;
  const srcH = 16;

  // Road arrows (pointing right = up arrow rotated 90deg CW)
  for (let i = 0; i < guide.roadArrows.length; i++) {
    const [col, row] = guide.roadArrows[i];
    const screenX = col * tileSize * scale - camera.x * scale;
    const screenY = row * tileSize * scale - camera.y * scale;
    const bounce = Math.sin(time * 3 + i * 1.5) * 4 * scale;
    const alpha = 0.6 + Math.sin(time * 2 + i) * 0.3;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(screenX + bounce, screenY);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(arrowImg, srcX, srcY, srcW, srcH, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.restore();
  }

  // Entrance arrow (pointing up or down)
  const [eCol, eRow] = guide.entrance;
  const eScreenX = eCol * tileSize * scale - camera.x * scale;
  const eScreenY = eRow * tileSize * scale - camera.y * scale;
  const eBounce = Math.sin(time * 3) * 4 * scale;
  const eAlpha = 0.7 + Math.sin(time * 2.5) * 0.3;

  ctx.save();
  ctx.globalAlpha = eAlpha;
  const rotation = guide.entranceDir === "down" ? Math.PI : 0;
  ctx.translate(eScreenX, eScreenY + (guide.entranceDir === "down" ? eBounce : -eBounce));
  ctx.rotate(rotation);
  ctx.drawImage(arrowImg, srcX, srcY, srcW, srcH, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
  ctx.restore();
}

// -- Draw ground layer with proper colors + subtle grid --
export function drawGroundLayer(
  ctx: CanvasRenderingContext2D,
  layer: number[],
  mapW: number,
  tileSize: number,
  scale: number,
  camera: Camera,
) {
  const scaledTile = tileSize * scale;

  const startCol = Math.max(0, Math.floor(camera.x / tileSize) - 1);
  const endCol = Math.min(mapW, Math.ceil((camera.x + camera.w / scale) / tileSize) + 1);
  const startRow = Math.max(0, Math.floor(camera.y / tileSize) - 1);
  const endRow = Math.min(layer.length / mapW, Math.ceil((camera.y + camera.h / scale) / tileSize) + 1);

  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const idx = layer[row * mapW + col];
      const screenX = col * scaledTile - camera.x * scale;
      const screenY = row * scaledTile - camera.y * scale;

      const isAlt = (row + col) % 2 === 0;

      switch (idx) {
        case 0: // grass
          ctx.fillStyle = isAlt ? GRASS_COLOR : GRASS_COLOR_ALT;
          ctx.fillRect(screenX, screenY, scaledTile + 1, scaledTile + 1);
          break;

        case 1: // dirt road
          ctx.fillStyle = isAlt ? DIRT_COLOR : DIRT_COLOR_ALT;
          ctx.fillRect(screenX, screenY, scaledTile + 1, scaledTile + 1);
          break;

        case 2: // flowers (grass base + flower details)
          ctx.fillStyle = isAlt ? GRASS_COLOR : GRASS_COLOR_ALT;
          ctx.fillRect(screenX, screenY, scaledTile + 1, scaledTile + 1);
          ctx.fillStyle = "#f472b6";
          const cx = screenX + scaledTile / 2;
          const cy = screenY + scaledTile / 2;
          const r = scaledTile * 0.12;
          ctx.beginPath();
          ctx.arc(cx - r * 1.5, cy - r, r, 0, Math.PI * 2);
          ctx.arc(cx + r * 1.5, cy + r, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
    }
  }

  drawRoadEdges(ctx, layer, mapW, tileSize, scale, camera, startCol, endCol, startRow, endRow);
}

// -- Road edge highlights --
function drawRoadEdges(
  ctx: CanvasRenderingContext2D,
  layer: number[],
  mapW: number,
  tileSize: number,
  scale: number,
  camera: Camera,
  startCol: number,
  endCol: number,
  startRow: number,
  endRow: number,
) {
  const scaledTile = tileSize * scale;
  ctx.strokeStyle = "rgba(139, 110, 65, 0.4)";
  ctx.lineWidth = scale;

  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const idx = layer[row * mapW + col];
      if (idx !== 1) continue;

      const sx = col * scaledTile - camera.x * scale;
      const sy = row * scaledTile - camera.y * scale;

      if (row > 0 && layer[(row - 1) * mapW + col] !== 1) {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + scaledTile, sy);
        ctx.stroke();
      }
      if (row < layer.length / mapW - 1 && layer[(row + 1) * mapW + col] !== 1) {
        ctx.beginPath();
        ctx.moveTo(sx, sy + scaledTile);
        ctx.lineTo(sx + scaledTile, sy + scaledTile);
        ctx.stroke();
      }
      if (col > 0 && layer[row * mapW + col - 1] !== 1) {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy + scaledTile);
        ctx.stroke();
      }
      if (col < mapW - 1 && layer[row * mapW + col + 1] !== 1) {
        ctx.beginPath();
        ctx.moveTo(sx + scaledTile, sy);
        ctx.lineTo(sx + scaledTile, sy + scaledTile);
        ctx.stroke();
      }
    }
  }
}

// -- Draw decoration sprites (trees, bushes) --
export function drawDecoSprites(
  ctx: CanvasRenderingContext2D,
  decos: DecoSprite[],
  scale: number,
  camera: Camera,
) {
  for (const deco of decos) {
    const sx = deco.x * scale - camera.x * scale;
    const sy = deco.y * scale - camera.y * scale;
    const sw = deco.w * scale;
    const sh = deco.h * scale;

    if (sx + sw < 0 || sx > camera.w || sy + sh < 0 || sy > camera.h) continue;

    const img = getCachedImage(deco.assetUrl);
    if (!img) continue;

    ctx.drawImage(img, sx, sy, sw, sh);
  }
}

// -- Draw barriers (chopped tree stumps) --
export function drawBarriers(
  ctx: CanvasRenderingContext2D,
  currentStep: number,
  tileSize: number,
  scale: number,
  camera: Camera,
  _time: number,
) {
  const scaledTile = tileSize * scale;

  for (let i = 0; i < barrierCols.length; i++) {
    if (currentStep > i) continue;

    const col = barrierCols[i];

    for (const row of BARRIER_ROWS) {
      const sx = col * scaledTile - camera.x * scale;
      const sy = row * scaledTile - camera.y * scale;

      if (sx + scaledTile < 0 || sx > camera.w || sy + scaledTile < 0 || sy > camera.h) continue;

      if (choppedTreeImg) {
        // Draw a chopped tree stump centered in each barrier tile
        const stumpW = scaledTile * 0.85;
        const stumpH = scaledTile * 0.85;
        ctx.drawImage(
          choppedTreeImg,
          sx + (scaledTile - stumpW) / 2,
          sy + (scaledTile - stumpH) / 2,
          stumpW,
          stumpH,
        );
      } else {
        // Fallback: brown rectangle
        ctx.fillStyle = "#8B6914";
        ctx.fillRect(sx + scaledTile * 0.1, sy + scaledTile * 0.2, scaledTile * 0.8, scaledTile * 0.6);
      }
    }
  }
}

// -- Draw zone labels with decorative frame border --
export function drawZoneLabels(
  ctx: CanvasRenderingContext2D,
  labels: { text: string; date: string; x: number; y: number; above: boolean }[],
  scale: number,
  camera: Camera,
  currentStep: number,
) {
  ctx.save();

  for (let i = 0; i < labels.length; i++) {
    if (i > currentStep) continue;

    const label = labels[i];
    const sx = label.x * scale - camera.x * scale;
    const sy = label.y * scale - camera.y * scale;

    // Measure text for box sizing
    ctx.font = `bold ${9 * scale}px "Pixelify Sans", monospace`;
    ctx.textAlign = "center";
    const titleMetrics = ctx.measureText(label.text);
    const pw = 10 * scale;
    const ph = 6 * scale;
    const totalH = label.date ? 28 * scale : 16 * scale;
    const boxW = Math.max(titleMetrics.width + pw * 2, 100 * scale);
    const boxX = sx - boxW / 2;
    const boxY = sy - ph;
    const boxH = totalH + ph * 2;

    // Draw frame image as border if available
    if (frameImg) {
      // Use the complete frame from the top-left of the spritesheet
      // The frame appears to be ~64x64 in the source, scaled to fit our box
      const framePad = 6 * scale;
      ctx.drawImage(
        frameImg,
        0, 0, 64, 64,
        boxX - framePad, boxY - framePad,
        boxW + framePad * 2, boxH + framePad * 2,
      );
    }

    // Background fill (semi-transparent to show frame behind)
    ctx.fillStyle = "rgba(255, 252, 245, 0.92)";
    roundRect(ctx, boxX, boxY, boxW, boxH, 4 * scale);
    ctx.fill();

    // Decorative border
    if (i === currentStep) {
      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = scale * 2;
    } else {
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = scale * 1.5;
    }
    roundRect(ctx, boxX, boxY, boxW, boxH, 4 * scale);
    ctx.stroke();

    // Inner decorative line
    ctx.strokeStyle = "rgba(192, 132, 252, 0.3)";
    ctx.lineWidth = scale;
    roundRect(ctx, boxX + 2 * scale, boxY + 2 * scale, boxW - 4 * scale, boxH - 4 * scale, 3 * scale);
    ctx.stroke();

    // Step indicator
    if (i === currentStep) {
      ctx.fillStyle = "#ec4899";
      ctx.font = `bold ${7 * scale}px "Pixelify Sans", monospace`;
      ctx.fillText(`Step ${i + 1}/5`, sx, sy + 8 * scale);
    }

    // Title
    ctx.fillStyle = "#4a2040";
    ctx.font = `bold ${9 * scale}px "Pixelify Sans", monospace`;
    ctx.fillText(label.text, sx, sy + (i === currentStep ? 20 : 10) * scale);

    // Date
    if (label.date) {
      ctx.fillStyle = "#9333ea";
      ctx.font = `${7 * scale}px "Pixelify Sans", monospace`;
      ctx.fillText(label.date, sx, sy + (i === currentStep ? 30 : 22) * scale);
    }
  }

  ctx.restore();
}

// Helper: draw a rounded rectangle path
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// -- Trigger indicator --
export function drawTriggerIndicator(
  ctx: CanvasRenderingContext2D,
  worldX: number,
  worldY: number,
  worldW: number,
  worldH: number,
  scale: number,
  cameraX: number,
  cameraY: number,
  time: number,
  discovered: boolean,
  isCurrentStep: boolean,
) {
  const sx = worldX * scale - cameraX * scale;
  const sy = worldY * scale - cameraY * scale;
  const sw = worldW * scale;
  const sh = worldH * scale;

  if (discovered) {
    ctx.fillStyle = `rgba(100, 200, 100, 0.1)`;
    roundRect(ctx, sx, sy, sw, sh, 6 * scale);
    ctx.fill();
    return;
  }

  if (!isCurrentStep) return;

  // Pulsing pink glow for current step (rounded)
  const alpha = 0.15 + Math.sin(time * 3) * 0.1;
  ctx.fillStyle = `rgba(244, 114, 182, ${alpha})`;
  roundRect(ctx, sx - 15, sy, sw + 30, sh, 6 * scale);
  ctx.fill();

  // Rounded pink border
  ctx.strokeStyle = `rgba(244, 114, 182, ${alpha + 0.05})`;
  ctx.lineWidth = 2 * scale;
  roundRect(ctx, sx - 15, sy, sw + 30, sh, 6 * scale);
  ctx.stroke();

  // Floating heart particles
  if (heartImg) {
    for (let i = 0; i < 4; i++) {
      const phase = time * 2 + (i * Math.PI * 2) / 4;
      const px = sx + sw / 2 + Math.cos(phase) * sw * 0.35;
      const py = sy + sh / 2 + Math.sin(phase * 1.3) * sh * 0.35;
      const heartSize = (6 + Math.sin(phase * 2) * 2) * scale;
      const heartAlpha = 0.6 + Math.sin(phase * 2) * 0.4;
      ctx.save();
      ctx.globalAlpha = heartAlpha;
      ctx.drawImage(heartImg, px - heartSize / 2, py - heartSize / 2, heartSize, heartSize);
      ctx.restore();
    }
  }

  // "!" indicator bouncing
  ctx.save();
  ctx.font = `bold ${14 * scale}px "Pixelify Sans", monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#ec4899";
  ctx.fillText("!", sx + sw / 2, sy - 4 * scale + Math.sin(time * 4) * 3 * scale);
  ctx.restore();

  // Arrow pointing to trigger
  const arrowY = sy - 12 * scale + Math.sin(time * 3) * 4 * scale;
  ctx.fillStyle = "#ec4899";
  ctx.beginPath();
  ctx.moveTo(sx + sw / 2, arrowY + 8 * scale);
  ctx.lineTo(sx + sw / 2 - 4 * scale, arrowY);
  ctx.lineTo(sx + sw / 2 + 4 * scale, arrowY);
  ctx.closePath();
  ctx.fill();
}
