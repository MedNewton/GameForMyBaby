"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Music, Backpack } from "lucide-react";
import { toggleMute, toggleBgmEnabled, isMuted, isBgmEnabled } from "@/lib/audio/audio";
import { useGameStore } from "@/lib/store/useGameStore";
import { ITEMS, STEP_ORDER, type ItemId } from "@/lib/data/gameData";

const ALL_ITEMS: ItemId[] = ["heart_big", "kiss_bus_station", "millefeuille", "tshirt_kisses", "baby_ending"];

// Convert elapsed seconds (0-60) to game time string (13:00 - 21:00)
function formatGameTime(elapsed: number): string {
  const clamped = Math.min(elapsed, 60);
  const gameHour = 13 + (clamped / 60) * 8;
  const hours = Math.floor(gameHour);
  const minutes = Math.floor((gameHour % 1) * 60);
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

function getTimerColor(elapsed: number): string {
  if (elapsed >= 50) return "#ef4444";
  if (elapsed >= 40) return "#f97316";
  if (elapsed >= 30) return "#eab308";
  return "#10b981";
}

export default function HudOverlay() {
  const discoveredTriggers = useGameStore((s) => s.discoveredTriggers);
  const inventory = useGameStore((s) => s.inventory);
  const showInventory = useGameStore((s) => s.showInventory);
  const currentStep = useGameStore((s) => s.currentStep);
  const gameTime = useGameStore((s) => s.gameTime);
  const toggleInventoryStore = useGameStore((s) => s.toggleInventory);

  const [muted, setMuted] = useState(isMuted());
  const [bgm, setBgm] = useState(isBgmEnabled());

  const discoveredCount = Object.values(discoveredTriggers).filter(Boolean).length;

  function handleMute() {
    const val = toggleMute();
    setMuted(val);
  }

  function handleBgm() {
    const val = toggleBgmEnabled();
    setBgm(val);
  }

  const timerColor = getTimerColor(gameTime);
  const isUrgent = gameTime >= 50;

  return (
    <>
      {/* Timer display - prominent at top center */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div
          className={`bg-black/80 rounded-xl px-6 py-3 backdrop-blur-sm border-2 ${
            isUrgent ? "animate-pulse border-red-500" : "border-white/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="font-pixel text-white/60 text-sm">TIME</span>
            <span
              className="font-pixel text-4xl tabular-nums"
              style={{ color: timerColor, textShadow: `0 0 10px ${timerColor}40` }}
            >
              {formatGameTime(gameTime)}
            </span>
            <span className="font-pixel text-white/40 text-sm">/ 21:00</span>
          </div>
        </div>
      </div>

      {/* Top HUD bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 pointer-events-none">
        {/* Left: title + step info */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-white/85 rounded-lg px-4 py-2 backdrop-blur-sm">
            <h2
              className="font-pixel text-pink-700 text-base"
              style={{ textShadow: "1px 1px 0 #fff" }}
            >
              SafSaf Love Journey
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-pixel text-sm text-purple-600">
                {discoveredCount}/5
              </span>
              {currentStep >= 5 && (
                <span className="font-pixel text-xs text-green-600">
                  All done!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => toggleInventoryStore()}
            className="p-2 md:p-3 rounded-lg bg-white/85 hover:bg-white transition-colors backdrop-blur-sm"
            title="Inventory"
          >
            <Backpack size={20} className="text-pink-700 md:w-6 md:h-6" />
          </button>
          <button
            onClick={handleMute}
            className="p-2 md:p-3 rounded-lg bg-white/85 hover:bg-white transition-colors backdrop-blur-sm"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX size={20} className="text-gray-500 md:w-6 md:h-6" />
            ) : (
              <Volume2 size={20} className="text-pink-700 md:w-6 md:h-6" />
            )}
          </button>
          <button
            onClick={handleBgm}
            className="p-2 md:p-3 rounded-lg bg-white/85 hover:bg-white transition-colors backdrop-blur-sm"
            title={bgm ? "Music Off" : "Music On"}
          >
            <Music size={20} className={`md:w-6 md:h-6 ${bgm ? "text-purple-600" : "text-gray-400"}`} />
          </button>
        </div>
      </div>

      {/* Step progress bar */}
      <div className="fixed top-16 left-4 z-30 pointer-events-none">
        <div className="bg-white/85 rounded-lg px-4 py-2.5 backdrop-blur-sm pointer-events-auto">
          <div className="flex items-center gap-1.5">
            {STEP_ORDER.map((triggerId, i) => {
              const discovered = !!discoveredTriggers[triggerId];
              const isCurrent = i === currentStep;
              return (
                <div key={triggerId} className="flex items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all font-pixel ${
                      discovered
                        ? "bg-pink-500 border-pink-500 text-white"
                        : isCurrent
                          ? "bg-white border-pink-400 text-pink-500 animate-pulse"
                          : "bg-gray-200 border-gray-300 text-gray-400"
                    }`}
                  >
                    {discovered ? "\u2713" : i + 1}
                  </div>
                  {i < STEP_ORDER.length - 1 && (
                    <div className={`w-4 h-1 ${discovered ? "bg-pink-400" : "bg-gray-300"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls hint (desktop only) */}
      <div className="fixed bottom-4 left-4 z-30 pointer-events-none hidden md:block">
        <p className="text-sm text-white/80 font-pixel bg-black/30 px-3 py-1.5 rounded" style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.5)" }}>
          WASD move | ESC close
        </p>
      </div>

      {/* Inventory panel */}
      <AnimatePresence>
        {showInventory && (
          <motion.div
            className="fixed top-20 right-4 z-40 bg-white/95 rounded-lg shadow-lg border-2 border-pink-300 p-5 w-72 backdrop-blur-sm"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h3 className="font-pixel text-base text-pink-700 mb-4">Inventory</h3>
            <div className="flex flex-col gap-3">
              {ALL_ITEMS.map((id) => {
                const item = ITEMS[id];
                const collected = !!inventory[id];
                return (
                  <div
                    key={id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      collected ? "bg-pink-50 border border-pink-200" : "bg-gray-100 opacity-50"
                    }`}
                  >
                    <span className="text-2xl">
                      {item.icon.type === "emoji"
                        ? item.icon.emoji
                        : collected
                          ? "\u2764\uFE0F"
                          : "\u2753"}
                    </span>
                    <span className="text-base font-pixel">
                      {collected ? item.label : "???"}
                    </span>
                    {collected && <span className="ml-auto text-green-500 text-lg">{"\u2713"}</span>}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
