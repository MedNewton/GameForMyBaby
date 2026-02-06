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
        className="bg-white rounded-xl shadow-2xl border-2 border-pink-300 max-w-2xl w-[92vw] h-[92dvh] sm:h-auto sm:max-h-[90dvh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex flex-col sm:flex-row h-full">
          {/* Left: Photo — contained so full image is always visible */}
          {place.photo && (
            <div className="sm:w-1/2 w-full flex-1 sm:flex-initial sm:min-h-[320px] overflow-hidden rounded-t-xl sm:rounded-t-none sm:rounded-l-xl">
              <img
                src={place.photo}
                alt={place.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Right: Content */}
          <div className="sm:w-1/2 w-full px-4 py-3 sm:p-6 flex flex-col justify-center shrink-0">
            {/* Date badge */}
            {place.date && (
              <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs sm:text-sm mb-2 sm:mb-4 w-fit font-pixel">
                <span>{"\u{1F4C5}"}</span>
                <span className="font-semibold">{place.date}</span>
              </div>
            )}

            {/* Title */}
            <h2 className="font-pixel text-pink-700 text-base sm:text-xl mb-1.5 sm:mb-3">{place.title}</h2>

            {/* Location */}
            <p className="text-xs sm:text-base text-gray-500 mb-2 sm:mb-4 flex items-center gap-1.5 font-pixel">
              <span>{"\u{1F4CD}"}</span>
              {place.location}
            </p>

            {/* Body */}
            <p className="text-xs sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-5"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {place.body}
            </p>

            {/* Reward badge */}
            <div className="flex items-center gap-2 sm:gap-3 bg-pink-50 p-2 sm:p-3 rounded-lg mb-3 sm:mb-5">
              <img src="/assets/emojis/E58.png" alt="" width={24} height={24} style={{ imageRendering: "pixelated" }} className="inline-block" draggable={false} />
              <span className="text-xs sm:text-base text-pink-700 font-pixel">
                <strong>{reward.label}</strong> unlocked!
              </span>
            </div>

            <button
              onClick={closeModal}
              className="pixel-btn w-full"
              style={{ background: "#f9a8d4", color: "#4a2040", fontSize: "0.875rem", padding: "10px 20px" }}
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
