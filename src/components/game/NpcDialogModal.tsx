"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store/useGameStore";
import { MOM_NPC } from "@/lib/data/gameData";

export default function NpcDialogModal() {
  const closeModal = useGameStore((s) => s.closeModal);

  const line = useMemo(() => {
    return MOM_NPC.lines[Math.floor(Math.random() * MOM_NPC.lines.length)];
  }, []);

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <motion.div
        className="bg-white rounded-xl shadow-2xl border-2 border-purple-300 max-w-sm w-[85vw] p-5"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* NPC Name */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{"\u{1F430}"}</span>
          <h3 className="font-pixel text-purple-700 text-xs">{MOM_NPC.name}</h3>
        </div>

        {/* Speech bubble */}
        <div className="relative bg-purple-50 rounded-lg p-4 mb-4">
          <div className="absolute -top-2 left-6 w-4 h-4 bg-purple-50 rotate-45" />
          <p className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            {line}
          </p>
        </div>

        <button
          onClick={closeModal}
          className="pixel-btn w-full"
          style={{ background: "#c084fc", color: "#fff" }}
        >
          OK
        </button>
      </motion.div>
    </div>
  );
}
