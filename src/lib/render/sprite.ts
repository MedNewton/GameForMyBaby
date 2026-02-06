/* --- Sprite rendering helpers --- */

import { loadImage } from "./tilemap";

export interface SrcRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

// -- Player spritesheet: 9 cols x 9 rows --
// Col 0 = idle, Cols 1-8 = walk frames
// Rows 0-7 = 8 directions, Row 8 = extra (unused)

let playerFrameW = 0;
let playerFrameH = 0;
let playerImg: HTMLImageElement | null = null;

export async function initPlayerSprite(url: string) {
  playerImg = await loadImage(url);
  playerFrameW = Math.floor(playerImg.width / 9);
  playerFrameH = Math.floor(playerImg.height / 9);
}

/**
 * Map a velocity vector to one of 8 direction rows.
 * Row order in the spritesheet:
 *   0=down, 1=down-left, 2=left, 3=up-left,
 *   4=up, 5=up-right, 6=right, 7=down-right
 */
export function velocityToDirection(vx: number, vy: number): number {
  if (vx === 0 && vy === 0) return -1;

  const angle = Math.atan2(vy, vx);
  const deg = ((angle * 180) / Math.PI + 360 + 90) % 360;
  const sector = Math.round(deg / 45) % 8;

  //                    up upR  R  dnR dn dnL  L  upL
  const sectorToRow = [4,  3,  2,  1,  0,  7,  6,  5];
  return sectorToRow[sector];
}

export function getPlayerFrame(dirRow: number, isWalking: boolean, animFrame: number): SrcRect {
  const col = isWalking ? 1 + (animFrame % 8) : 0;
  return {
    sx: col * playerFrameW,
    sy: dirRow * playerFrameH,
    sw: playerFrameW,
    sh: playerFrameH,
  };
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  dirRow: number,
  isWalking: boolean,
  animFrame: number,
  worldX: number,
  worldY: number,
  scale: number,
  cameraX: number,
  cameraY: number,
) {
  if (!playerImg) return;

  const frame = getPlayerFrame(dirRow, isWalking, animFrame);
  const screenX = worldX * scale - cameraX * scale;
  const screenY = worldY * scale - cameraY * scale;

  ctx.drawImage(
    playerImg,
    frame.sx, frame.sy, frame.sw, frame.sh,
    screenX - (playerFrameW * scale) / 2,
    screenY - (playerFrameH * scale) + 4 * scale,
    playerFrameW * scale,
    playerFrameH * scale,
  );
}

// -- Monster sprite (single character image) --
let monsterImg: HTMLImageElement | null = null;

export async function initMonsterSprite(url: string) {
  monsterImg = await loadImage(url);
}

export function drawMonster(
  ctx: CanvasRenderingContext2D,
  worldX: number,
  worldY: number,
  scale: number,
  cameraX: number,
  cameraY: number,
  elapsed: number,
) {
  if (!monsterImg) return;

  const screenX = worldX * scale - cameraX * scale;
  const screenY = worldY * scale - cameraY * scale;

  // Monster image is 90x64 - keep correct aspect ratio
  const drawH = 22 * scale;
  const drawW = drawH * (90 / 64); // ~31 * scale

  // Slight bobbing animation
  const bob = Math.sin(elapsed * 3) * 2 * scale;

  ctx.drawImage(
    monsterImg,
    screenX - drawW / 2,
    screenY - drawH + 4 * scale + bob,
    drawW,
    drawH,
  );

  // -- Speech bubble above monster --
  drawSpeechBubble(ctx, screenX, screenY - drawH - 6 * scale + bob, scale, elapsed);
}

function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  elapsed: number,
) {
  ctx.save();

  const line1 = "Mom calling:";
  const line2 = "“Where are you ?!”";
  const fontSize = Math.max(7 * scale, 10);
  ctx.font = `bold ${fontSize}px "Pixelify Sans", monospace`;
  ctx.textAlign = "center";

  const line1W = ctx.measureText(line1).width;
  const line2W = ctx.measureText(line2).width;
  const textWidth = Math.max(line1W, line2W);
  const lineGap = fontSize * 0.3;
  const padX = 8 * scale;
  const padY = 5 * scale;
  const bubbleW = textWidth + padX * 2;
  const bubbleH = fontSize * 2 + lineGap + padY * 2;
  const bubbleX = x - bubbleW / 2;
  const bubbleY = y - bubbleH;
  const tailSize = 4 * scale;

  // Pulse effect
  const pulse = 0.95 + Math.sin(elapsed * 4) * 0.05;

  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  ctx.translate(-x, -y);

  // Bubble background
  const radius = 4 * scale;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 2 * scale;

  ctx.beginPath();
  ctx.moveTo(bubbleX + radius, bubbleY);
  ctx.lineTo(bubbleX + bubbleW - radius, bubbleY);
  ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY, bubbleX + bubbleW, bubbleY + radius);
  ctx.lineTo(bubbleX + bubbleW, bubbleY + bubbleH - radius);
  ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY + bubbleH, bubbleX + bubbleW - radius, bubbleY + bubbleH);
  // Tail
  ctx.lineTo(x + tailSize, bubbleY + bubbleH);
  ctx.lineTo(x, bubbleY + bubbleH + tailSize);
  ctx.lineTo(x - tailSize, bubbleY + bubbleH);
  ctx.lineTo(bubbleX + radius, bubbleY + bubbleH);
  ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleH, bubbleX, bubbleY + bubbleH - radius);
  ctx.lineTo(bubbleX, bubbleY + radius);
  ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Line 1
  ctx.fillStyle = "#4a2040";
  ctx.fillText(line1, x, bubbleY + padY + fontSize * 0.85);
  // Line 2
  ctx.fillText(line2, x, bubbleY + padY + fontSize * 0.85 + fontSize + lineGap);

  ctx.restore();
}
