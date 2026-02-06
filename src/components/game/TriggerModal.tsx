"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store/useGameStore";
import { PLACES, ITEMS } from "@/lib/data/gameData";

export default function TriggerModal({ triggerId }: { triggerId: string }) {
  const closeModal = useGameStore((s) => s.closeModal);
  const place = PLACES.find((p) => p.id === triggerId);

  if (!place) return null;

  const reward = ITEMS[place.rewardItemId];

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <motion.div
        className="bg-white rounded-xl shadow-2xl border-2 border-pink-300 max-w-2xl w-[92vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Left: Photo */}
          {place.photo && (
            <div className="sm:w-1/2 w-full h-56 sm:h-auto sm:min-h-[320px] overflow-hidden flex-shrink-0">
              <img
                src={place.photo}
                alt={place.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Right: Content */}
          <div className="sm:w-1/2 w-full p-6 flex flex-col justify-center">
            {/* Date badge */}
            {place.date && (
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm mb-4 w-fit font-pixel">
                <span>{"\u{1F4C5}"}</span>
                <span className="font-semibold">{place.date}</span>
              </div>
            )}

            {/* Title */}
            <h2 className="font-pixel text-pink-700 text-xl mb-3">{place.title}</h2>

            {/* Location */}
            <p className="text-base text-gray-500 mb-4 flex items-center gap-1.5 font-pixel">
              <span>{"\u{1F4CD}"}</span>
              {place.location}
            </p>

            {/* Body */}
            <p className="text-base text-gray-700 leading-relaxed mb-5"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {place.body}
            </p>

            {/* Reward badge */}
            <div className="flex items-center gap-3 bg-pink-50 p-3 rounded-lg mb-5">
              <img src="/assets/emojis/E58.png" alt="" width={28} height={28} style={{ imageRendering: "pixelated" }} className="inline-block" draggable={false} />
              <span className="text-base text-pink-700 font-pixel">
                <strong>{reward.label}</strong> unlocked!
              </span>
            </div>

            <button
              onClick={closeModal}
              className="pixel-btn w-full"
              style={{ background: "#f9a8d4", color: "#4a2040", fontSize: "1rem", padding: "14px 24px" }}
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
