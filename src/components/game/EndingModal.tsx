"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store/useGameStore";
import { ENDING } from "@/lib/data/gameData";
import { stopBgm } from "@/lib/audio/audio";

export default function EndingModal() {
  function handleFinish() {
    stopBgm();
    useGameStore.getState().closeModal();
    useGameStore.getState().reset();
    window.location.href = "/";
  }

  return (
    <div className="modal-backdrop">
      <motion.div
        className="bg-gradient-to-b from-pink-50 to-purple-50 rounded-xl shadow-2xl border-2 border-pink-400 max-w-md w-[90vw] p-8 text-center"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Celebration emoji */}
        <motion.div
          className="mb-5"
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
        >
          <img src="/assets/emojis/E70.png" alt="" width={64} height={64} style={{ imageRendering: "pixelated" }} className="inline-block" draggable={false} />
        </motion.div>

        <h2 className="font-pixel text-pink-700 text-2xl mb-5">{ENDING.title}</h2>

        <p
          className="text-lg text-gray-700 leading-relaxed mb-5 whitespace-pre-line"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {ENDING.body}
        </p>

        {/* Baby reward */}
        <motion.div
          className="flex items-center justify-center gap-3 bg-pink-100 p-4 rounded-lg mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <img src="/assets/emojis/E48.png" alt="" width={36} height={36} style={{ imageRendering: "pixelated" }} className="inline-block" draggable={false} />
          <span className="font-pixel text-base text-pink-700">Baby Unlocked!</span>
        </motion.div>

        {/* Floating pixel emojis */}
        <div className="flex justify-center gap-3 mb-5">
          {["/assets/emojis/E11.png", "/assets/emojis/E48.png", "/assets/emojis/E70.png", "/assets/emojis/E48.png", "/assets/emojis/E11.png"].map((src, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.3 }}
            >
              <img src={src} alt="" width={24} height={24} style={{ imageRendering: "pixelated" }} draggable={false} />
            </motion.div>
          ))}
        </div>

        <button
          onClick={handleFinish}
          className="pixel-btn w-full"
          style={{ background: "#ec4899", color: "#fff", fontSize: "1.1rem", padding: "16px 24px" }}
        >
          Forever & Always
        </button>
      </motion.div>
    </div>
  );
}
