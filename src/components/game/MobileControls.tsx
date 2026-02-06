"use client";

import { useCallback, useRef } from "react";
import { virtualKeys } from "@/lib/input/virtualKeys";

const SPRITE = 16; // original sprite size

// Pink theme (row 2, y=32) arrow icons from UI_buttons16x16.png
const DIRS = [
  { key: "arrowup",    srcX: 64,  srcY: 32, col: 2, row: 1 },
  { key: "arrowleft",  srcX: 96,  srcY: 32, col: 1, row: 2 },
  { key: "arrowright", srcX: 112, srcY: 32, col: 3, row: 2 },
  { key: "arrowdown",  srcX: 80,  srcY: 32, col: 2, row: 3 },
] as const;

export default function MobileControls() {
  const gesturedRef = useRef(false);

  const down = useCallback((key: string) => {
    virtualKeys.add(key);
    if (!gesturedRef.current) {
      gesturedRef.current = true;
      window.dispatchEvent(new MouseEvent("click"));
    }
  }, []);

  const up = useCallback((key: string) => {
    virtualKeys.delete(key);
  }, []);

  // Responsive button size: 44px on small phones, up to 56px on larger phones
  const btn = typeof window !== "undefined"
    ? Math.max(44, Math.min(56, Math.floor(window.innerWidth * 0.13)))
    : 48;
  const scale = btn / SPRITE;
  const sheetW = 160 * scale;
  const sheetH = 96 * scale;

  return (
    <div
      className="fixed z-40 md:hidden select-none"
      style={{
        touchAction: "none",
        opacity: 0.85,
        bottom: "max(1rem, env(safe-area-inset-bottom, 0px) + 0.75rem)",
        left: "0.75rem",
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(3, ${btn}px)`,
          gridTemplateRows: `repeat(3, ${btn}px)`,
          gap: "2px",
        }}
      >
        {DIRS.map(({ key, srcX, srcY, col, row }) => (
          <button
            key={key}
            onPointerDown={(e) => { e.preventDefault(); down(key); }}
            onPointerUp={(e) => { e.preventDefault(); up(key); }}
            onPointerLeave={(e) => { e.preventDefault(); up(key); }}
            onPointerCancel={(e) => { e.preventDefault(); up(key); }}
            className="active:brightness-75 transition-all"
            style={{
              gridColumn: col,
              gridRow: row,
              width: btn,
              height: btn,
              backgroundImage: "url('/assets/keys/UI_buttons16x16.png')",
              backgroundSize: `${sheetW}px ${sheetH}px`,
              backgroundPosition: `-${srcX * scale}px -${srcY * scale}px`,
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
              touchAction: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
