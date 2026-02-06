"use client";

import { Howl } from "howler";
import { ASSETS, type SfxName } from "../data/gameData";

interface AudioState {
  muted: boolean;
  bgmEnabled: boolean;
  bgmStarted: boolean;
  bgm?: Howl;
  sfx: Record<SfxName, Howl>;
}

let state: AudioState | null = null;

export function initAudioOnce(): AudioState {
  if (state) return state;

  state = {
    muted: false,
    bgmEnabled: true,
    bgmStarted: false,
    sfx: {
      collect: new Howl({ src: [ASSETS.sounds.collect], volume: 0.7 }),
      heart: new Howl({ src: [ASSETS.sounds.heart], volume: 0.6 }),
      kiss: new Howl({ src: [ASSETS.sounds.kiss], volume: 0.7 }),
      open: new Howl({ src: [ASSETS.sounds.open], volume: 0.7 }),
      pop: new Howl({ src: [ASSETS.sounds.pop], volume: 0.5 }),
    },
  };

  return state;
}

export function startBgmIfAllowed() {
  const st = initAudioOnce();
  if (st.muted || !st.bgmEnabled || st.bgmStarted) return;

  st.bgm = new Howl({
    src: [ASSETS.sounds.bgm],
    loop: true,
    volume: 0.25,
  });

  st.bgm.mute(st.muted);
  st.bgm.play();
  st.bgmStarted = true;
}

export function stopBgm() {
  if (!state) return;
  state.bgm?.stop();
  state.bgmStarted = false;
}

export function toggleMute(): boolean {
  const st = initAudioOnce();
  st.muted = !st.muted;
  st.bgm?.mute(st.muted);
  Object.values(st.sfx).forEach((h) => h.mute(st.muted));
  return st.muted;
}

export function toggleBgmEnabled(): boolean {
  const st = initAudioOnce();
  st.bgmEnabled = !st.bgmEnabled;
  if (!st.bgmEnabled) stopBgm();
  return st.bgmEnabled;
}

export function playSfx(name: SfxName) {
  const st = initAudioOnce();
  if (st.muted) return;
  st.sfx[name].play();
}

export function isMuted(): boolean {
  return state?.muted ?? false;
}

export function isBgmEnabled(): boolean {
  return state?.bgmEnabled ?? true;
}
