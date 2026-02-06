"use client";

import { useCallback, useRef } from "react";
import { virtualKeys } from "@/lib/input/virtualKeys";

const BTN = 56; // button size in px
const SPRITE = 16; // original sprite size
const SCALE = BTN / SPRITE; // 3.5x
// Full spritesheet: 10 cols x 6 rows = 160x96 original
const SHEET_W = 160 * SCALE; // 560
const SHEET_H = 96 * SCALE; // 336

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

  return (
    <div
      className="fixed bottom-6 left-6 z-40 md:hidden select-none"
      style={{ touchAction: "none", opacity: 0.85 }}
    >
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(3, ${BTN}px)`,
          gridTemplateRows: `repeat(3, ${BTN}px)`,
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
              width: BTN,
              height: BTN,
              backgroundImage: "url('/assets/keys/UI_buttons16x16.png')",
              backgroundSize: `${SHEET_W}px ${SHEET_H}px`,
              backgroundPosition: `-${srcX * SCALE}px -${srcY * SCALE}px`,
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
