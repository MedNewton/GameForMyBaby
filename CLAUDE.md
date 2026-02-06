# SafSaf Love Journey — Codex Build Context (Next.js + TypeScript)

This document is the single source of truth for building the game with Codex.

Goal: a cute, smooth, **top-down 2D** mini-game (canvas) where SafSaf explores a small world, talks to an NPC (Mom), collects story memories/items, and reaches the final “home” ending.

We WILL include **BGM** (background music) + SFX.

---

## 0) Tech Stack & Constraints

- Framework: **Next.js (App Router)** + **TypeScript**
- Rendering: **HTML5 Canvas** for the game world (tilemap + sprites)
- UI: React overlay (inventory, dialogs, modals), Tailwind
- State: **zustand**
- Animations: **framer-motion** for UI
- Audio: **howler** (SFX + BGM)
- Validation: **zod** (validate data objects)

Primary constraints:
- Must feel like a real 2D game: tile map, animated sprite, collisions, triggers.
- Must be performant: avoid React rerenders per frame; use `requestAnimationFrame` loop.
- Must be easy to expand: places/memories/items should be data-driven.

---

## 1) Narrative Content (User-provided)

Names:
- Player (girlfriend): **SafSaf**
- Player (you): **meedo**
Vibe: **kawaii**
Language: **English**

Story locations (5):
1) First eat together  
   - Date: **26 Feb 2024**
   - Place: **Chef Chem Shawarma restaurant, Tangier**
   - Reward: **Big Heart**
   - Text: `"I met my Beauty"`

2) First kiss  
   - Date: **26 Feb 2024**
   - Place: **Makondo café, Tangier**
   - Reward: **Kiss**
   - Name: `"Bus Station Kiss"`

3) First time she visited your city  
   - Date: **26 Apr 2024**
   - Place: **Riad Amélia, Tetouan**
   - Reward: **Millefeuille pastry**

4) First sleep together  
   - Date: **25 May 2025**
   - Place: **Rabat**
   - Reward: **White T-shirt with kisses**

5) Final location  
   - Place: **A nice house**
   - Reward: **Baby**
   - Text: `"Happily ever after"`
   - This is the final “chest” (ending screen). No real-life clue needed.

NPC:
- “Her mom” character: always calling and saying “come early”.

---

## 2) Asset Plan (Approved)

We are using:
1) **Sprout Lands** as the main tileset/world art (map + decor).
2) **Valentine Icons** for heart/kiss icons (inventory and pickups).
3) **Food icon pack (32×32)** for millefeuille (inventory and pickup).
4) **8-direction top-down character spritesheet**:
   - Idle: 1 frame (column 1)
   - Walk: 8 frames (columns 2–9)
   - Recommended: 8 fps
   - 8 directions = rows
5) **Audio**:
   - SFX (already present)
   - BGM (already added as `bgm.flac`)

Licensing note:
- Food pack free license is non-commercial; acceptable for a personal gift.
- Do not redistribute any packs.

---

## 3) IMPORTANT: Actual `/public` Asset Folder Layout (User’s Setup)

All assets are placed under `/public` in these folders:

- `/public/character`
- `/public/food`
- `/public/love`
- `/public/monster`
- `/public/sprites`
- `/public/tileset`
- `/public/images`
- `/public/sounds` ✅ (confirmed, includes SFX + BGM)

### How to reference them in code
Files under `/public/...` are served from the site root.
Example: `/public/sounds/coinpickup.wav` is loaded as `"/sounds/coinpickup.wav"`.

### Required logical assets (by purpose)
Codex should put real filenames into a single constants object `ASSETS` and never hardcode paths elsewhere.

1) Main tileset (Sprout Lands)
- Folder: `/public/tileset/`
- URL: `"/tileset/<sprout_tileset>.png"`

2) Player spritesheet (8-direction)
- Folder: `/public/character/` (preferred) or `/public/sprites/`
- URL: `"/character/<player_sheet>.png"`

3) NPC Mom sprite
- Folder: `/public/monster/` or `/public/sprites/` or `/public/character/`
- URL: `"/sprites/<mom>.png"` (or whichever folder you placed it)

4) Valentine icons sheet
- Folder: `/public/love/`
- URL: `"/love/<valentine_icons>.png"`

5) Food icons sheet (32×32)
- Folder: `/public/food/`
- URL: `"/food/<food_icons>.png"`

6) Story photos (optional; user adds later)
- Folder: `/public/images/`
- URL: `"/images/<photo>.jpg"` or `"/images/<photo>.webp"`

---

## 4) Audio (SFX + BGM)

### 4.1 Existing SFX (already in `/public/sounds`)
Confirmed files:
- `"/sounds/chime1.ogg"`
- `"/sounds/coinpickup.wav"`
- `"/sounds/kiss.wav"`
- `"/sounds/popping.wav"`
- `"/sounds/twinkle.mp3"`

Recommended mapping:
- Collect any item: `coinpickup.wav`
- Heart reward: `twinkle.mp3`
- Kiss reward: `kiss.wav`
- Final house / ending open: `chime1.ogg`
- UI pop (optional for opening inventory or modal): `popping.wav`

### 4.2 BGM (background music)
User has added:
- `"/sounds/bgm.flac"`

Notes:
- FLAC is large; may increase load time but will still work in many modern browsers.
- If any device has trouble with FLAC, convert to MP3 or OGG later.
- BGM must loop cleanly and start only after a user gesture (autoplay restrictions).

BGM requirements:
- loop = true
- volume low (0.15–0.35)
- must support mute toggle in UI
- start after first user gesture:
  - first movement keydown or first click/tap

### 4.3 Howler implementation (required)
Implement a tiny audio module that:
- lazily initializes Howl instances on client
- respects a global muted flag
- exposes functions `playSfx(name)` and `toggleBgmEnabled()` + `toggleMute()`
- starts BGM ONLY after first user gesture.

Minimal reference implementation:

```ts
// src/lib/audio/audio.ts
"use client";

import { Howl } from "howler";

type SfxName = "collect" | "heart" | "kiss" | "open" | "pop";

type AudioState = {
  muted: boolean;
  bgmEnabled: boolean;
  bgmStarted: boolean;
  bgm?: Howl;
  sfx: Record<SfxName, Howl>;
};

let state: AudioState | null = null;

function lsGetBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  const v = window.localStorage.getItem(key);
  if (v === null) return fallback;
  return v === "1";
}
function lsSetBool(key: string, v: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, v ? "1" : "0");
}

export function initAudioOnce() {
  if (state) return state;

  const muted = lsGetBool("safsafLoveJourney:audio:muted", false);
  const bgmEnabled = lsGetBool("safsafLoveJourney:audio:bgmEnabled", true);

  state = {
    muted,
    bgmEnabled,
    bgmStarted: false,
    sfx: {
      collect: new Howl({ src: ["/sounds/coinpickup.wav"], volume: 0.7 }),
      heart: new Howl({ src: ["/sounds/twinkle.mp3"], volume: 0.6 }),
      kiss: new Howl({ src: ["/sounds/kiss.wav"], volume: 0.7 }),
      open: new Howl({ src: ["/sounds/chime1.ogg"], volume: 0.7 }),
      pop: new Howl({ src: ["/sounds/popping.wav"], volume: 0.5 }),
    },
  };

  // apply mute to sfx
  Object.values(state.sfx).forEach((h) => h.mute(state!.muted));

  return state;
}

export function startBgmIfAllowed() {
  const st = initAudioOnce();
  if (st.muted || !st.bgmEnabled || st.bgmStarted) return;

  st.bgm = new Howl({
    src: ["/sounds/bgm.flac"],
    loop: true,
    volume: 0.25,
  });

  st.bgm.mute(st.muted);
  st.bgm.play();
  st.bgmStarted = true;
}

export function stopBgm() {
  const st = initAudioOnce();
  st.bgm?.stop();
  st.bgmStarted = false;
}

export function toggleMute() {
  const st = initAudioOnce();
  st.muted = !st.muted;
  lsSetBool("safsafLoveJourney:audio:muted", st.muted);

  // bgm
  st.bgm?.mute(st.muted);

  // sfx
  Object.values(st.sfx).forEach((h) => h.mute(st.muted));
}

export function toggleBgmEnabled() {
  const st = initAudioOnce();
  st.bgmEnabled = !st.bgmEnabled;
  lsSetBool("safsafLoveJourney:audio:bgmEnabled", st.bgmEnabled);

  if (!st.bgmEnabled) stopBgm();
}

export function playSfx(name: SfxName) {
  const st = initAudioOnce();
  if (st.muted) return;
  st.sfx[name].play();
}


How to use audio (required rules):

Call startBgmIfAllowed() after the FIRST user gesture:

first movement keydown OR first click.

Play SFX on events:

pickup → playSfx("collect")

heart reward → playSfx("heart")

kiss reward → playSfx("kiss")

ending open → playSfx("open")

optional UI opens → playSfx("pop")

HUD requirements:

Add two buttons:

Mute (toggles all audio)

Music On/Off (toggles only BGM)

Persist audio preferences:

localStorage:

safsafLoveJourney:audio:muted

safsafLoveJourney:audio:bgmEnabled

5) Suggested App File/Folder Layout

src/app/page.tsx (landing)

src/app/game/page.tsx (game route)

src/components/game/GameCanvas.tsx (canvas loop + drawing + collisions)

src/components/game/HudOverlay.tsx (HUD + inventory + mute/music toggles)

src/components/game/TriggerModal.tsx (story popups)

src/components/game/NpcDialogModal.tsx (mom dialog)

src/lib/store/useGameStore.ts (zustand store)

src/lib/data/gameData.ts (places, items, npc text, asset URLs, sound URLs)

src/lib/data/mapLayout.ts (tilemap arrays + collision grid)

src/lib/render/sprite.ts (sprite slicing helpers)

src/lib/render/tilemap.ts (tile drawing helpers)

src/lib/audio/audio.ts (howler audio module)

6) Game Design Requirements (MVP)
6.1 World & Camera

World is a tilemap with a fixed size, e.g. 80×45 tiles (or similar).

Tile size derived from Sprout tileset (16 or 32).

Camera follows player (centered with clamping to world bounds).

6.2 Movement

Keyboard: WASD + Arrow keys.

8-direction movement.

Speed: ~180–260 px/s depending on tile size.

Normalize diagonal.

Collision via boolean grid solid[y][x].

Collision resolution: axis-separated (x then y) for simplicity.

6.3 Player Animation (8-direction spritesheet)

Sprite sheet assumptions:

Directions (rows): 8

Columns: 9

col 1 idle frame

cols 2–9: walking frames (8 frames)

Walk animation FPS: 8 fps

Idle uses col 1

If frame size unknown:

frameW = imageWidth / 9

frameH = imageHeight / 8

Must be integers; if not, sheet may contain padding/extra rows; adjust or allow configuration.

Direction selection:

Convert (vx, vy) to angle, bucket into 8 sectors.

Keep last direction when idle.

6.4 Collectibles & Inventory

Item IDs (5):

heart_big

kiss_bus_station

millefeuille

tshirt_kisses (emoji placeholder or later icon)

baby_ending (emoji placeholder or later icon)

Rules:

Each story trigger grants its reward (if not already collected).

Optionally also place physical pickups on the map for extra game feel.

SFX mapping (required):

any pickup: playSfx("collect")

heart reward: playSfx("heart")

kiss reward: playSfx("kiss")

final/ending: playSfx("open")

6.5 Story Place Triggers (5)

Trigger IDs:

eat_shawarma

first_kiss

visited_tetouan

first_sleep_rabat

final_house

When player enters trigger:

open trigger modal with title/date/location/body

grant reward

mark discovered

play appropriate SFX

Final trigger:

show ending modal:

Title: “Happily ever after”

Cute closing text

Show baby reward

6.6 NPC: Mom Calling

NPC ID: mom_calling

Interaction:

Press E within radius (~1 tile) OR collision trigger.

Show dialog modal.

Dialog lines:

“SafSaf! Come home early okay? 😤💗”

“Where are you two? Don’t be late! 📞”

“Eat well! And be careful! 😳”

SFX:

optional: playSfx("pop") when opening NPC dialog.

7) Data-driven Implementation
7.1 src/lib/data/gameData.ts (must exist)

Codex should define all gameplay content in one place:

ASSETS: image/sound URLs

ITEMS: inventory metadata (labels + icon source)

PLACES: story triggers (title/date/location/body + reward item id + sfx)

NPCS: mom dialog lines

ENDING: ending title/text

Recommended shape:

ASSETS = { tilesetUrl, playerUrl, momUrl, valentineUrl, foodUrl, sounds: {...} }

ITEMS[itemId] = { label, kind, icon: { type: "sheet"|"emoji", ... } }

PLACES[] = { id, title, date, location, body, rewardItemId, sfx }

MOM = { id, name, lines, sfx }

7.2 src/lib/data/mapLayout.ts (must exist)

Define:

MAP_W, MAP_H, TILE_SIZE

groundLayer: number[] length = W*H

decorLayer: number[] length = W*H (optional)

solid: boolean[] length = W*H (collision)

triggers: { id, rect }[] (world pixel rects)

npc: { id, x, y, rect }

pickups: { itemId, x, y, rect }[] (optional)

Map requirement:

A handcrafted minimal map with 5 themed areas (Tangier café/food, kiss spot, Tetouan riad, Rabat night, final home).

8) Rendering Requirements (Canvas)

Use requestAnimationFrame.

No React state updates per frame.

Cull tiles: draw only visible tiles.

Disable smoothing for pixel art:

ctx.imageSmoothingEnabled = false;

Handle DPR scaling for crispness.

Draw order:

background

ground tiles

decor tiles/props

pickups

NPC

player

optional debug overlay

9) UI Overlay Requirements (React)

HUD:

Title: “SafSaf Love Journey”

discovered count

inventory button

reset button (optional)

audio controls:

mute toggle

music toggle (bgm enabled)

Modals:

trigger modal

NPC dialog modal

ending modal

Inventory panel:

show 5 items + collected status

use icon sheets for heart/kiss/millefeuille and emoji for tshirt/baby until sourced

10) State Management (zustand)

Store fields:

inventory: Record<ItemId, boolean>

discoveredTriggers: Record<TriggerId, boolean>

activeModal: null | { type: "trigger"|"npc"|"ending"; id?: string }

lastTriggerId?: string (avoid re-triggering every frame)

reset()

Persistence:

localStorage key: safsafLoveJourney:v1

Audio prefs:

safsafLoveJourney:audio:muted

safsafLoveJourney:audio:bgmEnabled

11) Input & Interaction

Movement: WASD + arrows

Interact: E near NPC

Close modals: Esc

Start BGM only after first user gesture:

first keydown or click; call startBgmIfAllowed().

12) Performance Targets

60 FPS desktop.

minimal draw calls with culling.

cache images and re-use.

do not store per-frame state in React.

13) Acceptance Criteria (Definition of Done)

MVP is done when:

Map renders using Sprout Lands tileset.

Player animates walking in 8 directions.

Collision works.

5 story triggers + rewards + modals.

Inventory shows collected rewards.

Mom NPC dialog works.

Final house triggers ending modal + SFX.

Audio works:

SFX trigger correctly

BGM (/sounds/bgm.flac) loops and starts after user gesture

mute/music toggles work and persist.

14) IDs Summary

Trigger IDs:

eat_shawarma

first_kiss

visited_tetouan

first_sleep_rabat

final_house

Item IDs:

heart_big

kiss_bus_station

millefeuille

tshirt_kisses

baby_ending

NPC IDs:

mom_calling