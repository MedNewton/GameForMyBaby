"use client";

import { AnimatePresence, motion } from "framer-motion";
import GameCanvas from "@/components/game/GameCanvas";
import HudOverlay from "@/components/game/HudOverlay";
import TriggerModal from "@/components/game/TriggerModal";
import NpcDialogModal from "@/components/game/NpcDialogModal";
import EndingModal from "@/components/game/EndingModal";
import MobileControls from "@/components/game/MobileControls";
import { useGameStore } from "@/lib/store/useGameStore";
import { stopBgm } from "@/lib/audio/audio";

export default function GamePage() {
  const activeModal = useGameStore((s) => s.activeModal);
  const gameOver = useGameStore((s) => s.gameOver);
  const gameOverReason = useGameStore((s) => s.gameOverReason);

  function handleTryAgain() {
    stopBgm();
    useGameStore.getState().reset();
    window.location.reload();
  }

  return (
    <div className="game-container" onContextMenu={(e) => e.preventDefault()}>
      <GameCanvas />
      {!gameOver && <HudOverlay />}
      {!gameOver && <MobileControls />}

      <AnimatePresence>
        {activeModal?.type === "trigger" && activeModal.id && (
          <TriggerModal key="trigger" triggerId={activeModal.id} />
        )}
        {activeModal?.type === "npc" && (
          <NpcDialogModal key="npc" />
        )}
        {activeModal?.type === "ending" && (
          <EndingModal key="ending" />
        )}
      </AnimatePresence>

      {/* Game Over overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Dark backdrop */}
            <div className="absolute inset-0 bg-black/70" />

            {/* Content */}
            <motion.div
              className="relative z-10 flex flex-col items-center gap-6 px-6 py-10 max-w-md w-[90vw] bg-gradient-to-b from-pink-50 to-purple-100 rounded-2xl border-4 border-pink-400 shadow-2xl"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            >
              {/* Icon */}
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <img
                  src={gameOverReason === "timeout" ? "/assets/emojis/E56.png" : "/assets/emojis/E71.png"}
                  alt=""
                  width={80}
                  height={80}
                  style={{ imageRendering: "pixelated" }}
                  draggable={false}
                />
              </motion.div>

              {/* Title */}
              <h2 className="font-pixel text-pink-700 text-2xl text-center">
                {gameOverReason === "timeout"
                  ? "Too Late!"
                  : "Mom Caught You!"}
              </h2>

              {/* Message */}
              <p className="font-pixel text-base text-gray-600 text-center leading-relaxed">
                {gameOverReason === "timeout"
                  ? "You didn't make it before 21:00... Mom is NOT happy!"
                  : "Mom caught up with you! You should have been faster!"}
              </p>

              {/* Try Again button */}
              <motion.button
                onClick={handleTryAgain}
                className="pixel-btn mt-2"
                style={{
                  background: "#ec4899",
                  color: "#fff",
                  fontSize: "1.1rem",
                  padding: "18px 48px",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>

              {/* Decorative pixel emojis */}
              <div className="flex gap-2">
                {["/assets/emojis/E7.png", "/assets/emojis/E71.png", "/assets/emojis/E7.png"].map((src, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                  >
                    <img src={src} alt="" width={24} height={24} style={{ imageRendering: "pixelated" }} draggable={false} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
