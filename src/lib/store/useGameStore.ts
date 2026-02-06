"use client";

import { create } from "zustand";
import type { ItemId, TriggerId } from "../data/gameData";

export interface ModalState {
  type: "trigger" | "npc" | "ending";
  id?: string;
}

interface GameState {
  inventory: Record<string, boolean>;
  discoveredTriggers: Record<string, boolean>;
  currentStep: number;
  activeModal: ModalState | null;
  showInventory: boolean;
  lastTriggerId: string | null;
  gameOver: boolean;
  gameOverReason: "timeout" | "caught" | null;
  gameTime: number; // elapsed real seconds (0-60)

  collectItem: (id: ItemId) => void;
  discoverTrigger: (id: TriggerId) => void;
  advanceStep: () => void;
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
  toggleInventory: () => void;
  setLastTriggerId: (id: string | null) => void;
  setGameOver: (reason: "timeout" | "caught") => void;
  setGameTime: (t: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  inventory: {},
  discoveredTriggers: {},
  currentStep: 0,
  activeModal: null,
  showInventory: false,
  lastTriggerId: null,
  gameOver: false,
  gameOverReason: null,
  gameTime: 0,

  collectItem: (id) => {
    set({ inventory: { ...get().inventory, [id]: true } });
  },

  discoverTrigger: (id) => {
    set({ discoveredTriggers: { ...get().discoveredTriggers, [id]: true } });
  },

  advanceStep: () => {
    set({ currentStep: get().currentStep + 1 });
  },

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  toggleInventory: () => set((s) => ({ showInventory: !s.showInventory })),
  setLastTriggerId: (id) => set({ lastTriggerId: id }),

  setGameOver: (reason) => set({ gameOver: true, gameOverReason: reason }),
  setGameTime: (t) => set({ gameTime: t }),

  reset: () => {
    set({
      inventory: {},
      discoveredTriggers: {},
      currentStep: 0,
      activeModal: null,
      showInventory: false,
      lastTriggerId: null,
      gameOver: false,
      gameOverReason: null,
      gameTime: 0,
    });
  },
}));
