"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { initAudioOnce, startBgmIfAllowed } from "@/lib/audio/audio";
import { Volume2, VolumeX } from "lucide-react";

export default function IntroPage() {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(false);

  function handleEnableSound() {
    initAudioOnce();
    startBgmIfAllowed();
    setSoundEnabled(true);
  }

  function handleStart() {
    if (!soundEnabled) {
      initAudioOnce();
      startBgmIfAllowed();
    }
    router.push("/game");
  }

  return (
    <div className="relative w-screen h-dvh overflow-hidden flex items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/images/introBG2.webp')" }}
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-200/20 to-pink-300/40" />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Title */}
        <motion.h1
          className="text-white text-center leading-tight"
          style={{
            fontFamily: "var(--font-blum)",
            fontSize: "clamp(4rem, 12vw, 8rem)",
            textShadow: "0 3px 16px rgba(236,72,153,0.5), 0 1px 4px rgba(0,0,0,0.3)",
            letterSpacing: "0.04em",
          }}
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          Beauty<br />Adventure
        </motion.h1>

        {/* Buttons */}
        <motion.div
          className="flex flex-col items-center gap-4 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {/* Sound button */}
          <button
            onClick={handleEnableSound}
            className="pixel-btn flex items-center gap-2"
            style={{
              background: soundEnabled ? "#86efac" : "#f9a8d4",
              color: "#4a2040",
              fontSize: "1.2rem",
            }}
          >
            {soundEnabled ? (
              <>
                <Volume2 size={22} /> Sound On
              </>
            ) : (
              <>
                <VolumeX size={22} /> Enable Sound
              </>
            )}
          </button>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="pixel-btn"
            style={{
              background: "#c084fc",
              color: "#fff",
              fontSize: "1.6rem",
              padding: "18px 40px",
            }}
          >
            Start Adventure
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
