"use client";

import { useEffect, useRef, useCallback } from "react";
import { ASSETS, PLACES } from "@/lib/data/gameData";
import {
  MAP_W, MAP_H, TILE_SIZE, SCALE, WORLD_PX_W, WORLD_PX_H,
  groundLayer, solid, triggers, monsterStart, playerStart,
  zoneLabels, decoSprites, isBarrier,
} from "@/lib/data/mapLayout";
import {
  drawGroundLayer, drawDecoSprites, drawBarriers,
  drawZoneLabels, drawTriggerIndicator, drawRoadArrows,
  preloadDecoImages, preloadFrameImage, preloadArrowImage, preloadHeartImage, preloadChoppedTree, type Camera,
} from "@/lib/render/tilemap";
import {
  initPlayerSprite, initMonsterSprite, drawPlayer, drawMonster,
  velocityToDirection,
} from "@/lib/render/sprite";
import { startBgmIfAllowed, playSfx } from "@/lib/audio/audio";
import { useGameStore } from "@/lib/store/useGameStore";
import { virtualKeys } from "@/lib/input/virtualKeys";

const PLAYER_SPEED = 180; // px/s in world units
const MONSTER_SPEED_DESKTOP = 50; // px/s
const MONSTER_SPEED_MOBILE = 30; // px/s - slower on mobile
const ANIM_FPS = 8;
const PLAYER_RADIUS = 5; // collision half-size in world px
const CATCH_DISTANCE = 14; // px distance for monster to catch player
const TIMER_DURATION = 60; // real seconds for 13:00 -> 21:00

interface GameState {
  px: number;
  py: number;
  vx: number;
  vy: number;
  dirRow: number;
  isWalking: boolean;
  animFrame: number;
  animTimer: number;
  firstGesture: boolean;
  // Monster
  mx: number;
  my: number;
  // Timer
  elapsedTime: number;
  lastTimeUpdate: number; // last second we synced to store
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState>({
    px: playerStart.x,
    py: playerStart.y,
    vx: 0,
    vy: 0,
    dirRow: 0,
    isWalking: false,
    animFrame: 0,
    animTimer: 0,
    firstGesture: false,
    mx: monsterStart.x,
    my: monsterStart.y,
    elapsedTime: 0,
    lastTimeUpdate: -1,
  });
  const keysRef = useRef(new Set<string>());
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const readyRef = useRef(false);
  const monsterSpeedRef = useRef(MONSTER_SPEED_DESKTOP);

  const store = useGameStore;

  // Check if a world position is solid (including barriers)
  const isSolid = useCallback((wx: number, wy: number): boolean => {
    const col = Math.floor(wx / TILE_SIZE);
    const row = Math.floor(wy / TILE_SIZE);
    if (col < 0 || col >= MAP_W || row < 0 || row >= MAP_H) return true;

    if (solid[row * MAP_W + col]) return true;

    const currentStep = store.getState().currentStep;
    if (isBarrier(col, row, currentStep)) return true;

    return false;
  }, [store]);

  // Axis-separated collision resolution
  const resolveCollision = useCallback((x: number, y: number, newX: number, newY: number): [number, number] => {
    const r = PLAYER_RADIUS;

    let rx = newX;
    if (
      isSolid(newX - r, y - r) || isSolid(newX + r, y - r) ||
      isSolid(newX - r, y + r) || isSolid(newX + r, y + r)
    ) {
      rx = x;
    }

    let ry = newY;
    if (
      isSolid(rx - r, newY - r) || isSolid(rx + r, newY - r) ||
      isSolid(rx - r, newY + r) || isSolid(rx + r, newY + r)
    ) {
      ry = y;
    }

    return [rx, ry];
  }, [isSolid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Detect mobile and set monster speed
    const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    monsterSpeedRef.current = isMobile ? MONSTER_SPEED_MOBILE : MONSTER_SPEED_DESKTOP;

    // Load all assets
    Promise.all([
      initPlayerSprite(ASSETS.player),
      initMonsterSprite(ASSETS.monster),
      preloadDecoImages(decoSprites),
      preloadFrameImage(),
      preloadArrowImage(),
      preloadHeartImage(),
      preloadChoppedTree(),
    ]).then(() => {
      readyRef.current = true;
    });

    // Input handlers
    function onKeyDown(e: KeyboardEvent) {
      keysRef.current.add(e.key.toLowerCase());

      if (!gameRef.current.firstGesture) {
        gameRef.current.firstGesture = true;
        startBgmIfAllowed();
      }

      if (e.key === "Escape") {
        store.getState().closeModal();
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key.toLowerCase());
    }

    function onClick() {
      if (!gameRef.current.firstGesture) {
        gameRef.current.firstGesture = true;
        startBgmIfAllowed();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("click", onClick);

    // Resize handler
    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    // -- Game loop --
    function loop(time: number) {
      rafRef.current = requestAnimationFrame(loop);

      if (!readyRef.current || !ctx || !canvas) return;

      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0.016;
      lastTimeRef.current = time;
      const clampedDt = Math.min(dt, 0.05);

      const g = gameRef.current;
      const storeState = store.getState();
      const modal = storeState.activeModal;
      const gameOver = storeState.gameOver;

      // -- Check virtual keys for first gesture --
      if (!g.firstGesture && virtualKeys.size > 0) {
        g.firstGesture = true;
        startBgmIfAllowed();
      }

      // -- Update timer (always ticks unless game over) --
      if (!gameOver && g.firstGesture) {
        g.elapsedTime += clampedDt;

        // Sync to store every ~0.5 seconds
        const currentHalf = Math.floor(g.elapsedTime * 2);
        if (currentHalf !== g.lastTimeUpdate) {
          g.lastTimeUpdate = currentHalf;
          storeState.setGameTime(g.elapsedTime);
        }

        // Check timeout
        if (g.elapsedTime >= TIMER_DURATION) {
          storeState.setGameOver("timeout");
        }
      }

      // -- Update player (skip if modal open or game over) --
      if (!modal && !gameOver) {
        const keys = keysRef.current;
        let mx = 0, my = 0;
        if (keys.has("w") || keys.has("arrowup") || virtualKeys.has("arrowup")) my -= 1;
        if (keys.has("s") || keys.has("arrowdown") || virtualKeys.has("arrowdown")) my += 1;
        if (keys.has("a") || keys.has("arrowleft") || virtualKeys.has("arrowleft")) mx -= 1;
        if (keys.has("d") || keys.has("arrowright") || virtualKeys.has("arrowright")) mx += 1;

        const len = Math.sqrt(mx * mx + my * my);
        if (len > 0) {
          mx /= len;
          my /= len;
        }

        g.vx = mx * PLAYER_SPEED;
        g.vy = my * PLAYER_SPEED;
        g.isWalking = len > 0;

        const newDir = velocityToDirection(mx, my);
        if (newDir !== -1) g.dirRow = newDir;

        if (g.isWalking) {
          g.animTimer += clampedDt;
          if (g.animTimer >= 1 / ANIM_FPS) {
            g.animTimer -= 1 / ANIM_FPS;
            g.animFrame = (g.animFrame + 1) % 8;
          }
        } else {
          g.animFrame = 0;
          g.animTimer = 0;
        }

        // Movement with collision
        const newX = g.px + g.vx * clampedDt;
        const newY = g.py + g.vy * clampedDt;
        const [rx, ry] = resolveCollision(g.px, g.py, newX, newY);

        g.px = Math.max(PLAYER_RADIUS, Math.min(WORLD_PX_W - PLAYER_RADIUS, rx));
        g.py = Math.max(PLAYER_RADIUS, Math.min(WORLD_PX_H - PLAYER_RADIUS, ry));

        // -- Trigger checks --
        const currentStep = storeState.currentStep;
        let currentTriggerId: string | null = null;

        for (const trigger of triggers) {
          if (trigger.stepIndex !== currentStep) continue;

          const r = trigger.rect;
          if (g.px >= r.x && g.px <= r.x + r.w && g.py >= r.y && g.py <= r.y + r.h) {
            currentTriggerId = trigger.id;

            if (!storeState.discoveredTriggers[trigger.id] && storeState.lastTriggerId !== trigger.id) {
              const place = PLACES.find(p => p.id === trigger.id);
              if (place) {
                storeState.discoverTrigger(trigger.id);
                storeState.collectItem(place.rewardItemId);
                storeState.setLastTriggerId(trigger.id);
                storeState.advanceStep();
                playSfx(place.sfx);

                if (trigger.id === "final_house") {
                  storeState.openModal({ type: "ending" });
                } else {
                  storeState.openModal({ type: "trigger", id: trigger.id });
                }
              }
            }
            break;
          }
        }

        if (!currentTriggerId) {
          storeState.setLastTriggerId(null);
        }
      }

      // -- Update monster (chases player, pauses when modal/gameover) --
      if (!modal && !gameOver && g.firstGesture) {
        const dx = g.px - g.mx;
        const dy = g.py - g.my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 2) {
          const ndx = dx / dist;
          const ndy = dy / dist;
          g.mx += ndx * monsterSpeedRef.current * clampedDt;
          g.my += ndy * monsterSpeedRef.current * clampedDt;

          // Clamp monster to world bounds
          g.mx = Math.max(0, Math.min(WORLD_PX_W, g.mx));
          g.my = Math.max(0, Math.min(WORLD_PX_H, g.my));
        }

        // Check if monster caught player
        if (dist < CATCH_DISTANCE) {
          storeState.setGameOver("caught");
        }
      }

      // -- Camera --
      const dpr = window.devicePixelRatio || 1;
      const canvasW = canvas.width / dpr;
      const canvasH = canvas.height / dpr;

      const cam: Camera = {
        x: g.px - canvasW / (2 * SCALE),
        y: g.py - canvasH / (2 * SCALE),
        w: canvasW,
        h: canvasH,
      };

      cam.x = Math.max(0, Math.min(WORLD_PX_W - canvasW / SCALE, cam.x));
      cam.y = Math.max(0, Math.min(WORLD_PX_H - canvasH / SCALE, cam.y));

      // -- Draw --
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      // Clear with grass color
      ctx.fillStyle = "#5A9A38";
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Ground
      drawGroundLayer(ctx, groundLayer, MAP_W, TILE_SIZE, SCALE, cam);

      // Decoration sprites (trees, bushes)
      drawDecoSprites(ctx, decoSprites, SCALE, cam);

      // Barriers
      const currentStep = store.getState().currentStep;
      const elapsed = time / 1000;
      drawBarriers(ctx, currentStep, TILE_SIZE, SCALE, cam, elapsed);

      // Road arrows pointing toward current goal
      drawRoadArrows(ctx, currentStep, TILE_SIZE, SCALE, cam, elapsed);

      // Trigger indicators
      const discoveredState = store.getState().discoveredTriggers;
      for (const trigger of triggers) {
        if (trigger.stepIndex > currentStep && !discoveredState[trigger.id]) continue;

        drawTriggerIndicator(
          ctx,
          trigger.rect.x, trigger.rect.y,
          trigger.rect.w, trigger.rect.h,
          SCALE, cam.x, cam.y, elapsed,
          !!discoveredState[trigger.id],
          trigger.stepIndex === currentStep,
        );
      }

      // Zone labels
      drawZoneLabels(ctx, zoneLabels, SCALE, cam, currentStep);

      // Monster
      drawMonster(ctx, g.mx, g.my, SCALE, cam.x, cam.y, elapsed);

      // Player
      drawPlayer(ctx, g.dirRow, g.isWalking, g.animFrame, g.px, g.py, SCALE, cam.x, cam.y);

      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, [resolveCollision, store]);

  return <canvas ref={canvasRef} className="game-canvas" style={{ touchAction: "none" }} />;
}
