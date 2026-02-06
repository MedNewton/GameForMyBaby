"use client";

import { useCallback, useRef } from "react";
import { virtualKeys } from "@/lib/input/virtualKeys";

const DIRS = [
  { key: "arrowup",    src: "/assets/keys/ARROWUP.png",    col: 2, row: 1 },
  { key: "arrowleft",  src: "/assets/keys/ARROWLEFT.png",  col: 1, row: 2 },
  { key: "arrowright", src: "/assets/keys/ARROWRIGHT.png",  col: 3, row: 2 },
  { key: "arrowdown",  src: "/assets/keys/ARROWDOWN.png",  col: 2, row: 3 },
] as const;

// Responsive button size: 56–72px based on viewport
function getBtnSize() {
  if (typeof window === "undefined") return 64;
  return Math.max(48, Math.min(64, Math.floor(window.innerWidth * 0.17)));
}

export default function MobileControls() {
  const gesturedRef = useRef(false);
  const btn = getBtnSize();

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
      className="fixed z-40 md:hidden select-none"
      style={{
        touchAction: "none",
        opacity: 0.9,
        bottom: "max(1rem, env(safe-area-inset-bottom, 0px) + 0.75rem)",
        right: "0.75rem",
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(3, ${btn}px)`,
          gridTemplateRows: `repeat(3, ${btn}px)`,
          gap: "3px",
        }}
      >
        {DIRS.map(({ key, src, col, row }) => (
          <button
            key={key}
            onPointerDown={(e) => { e.preventDefault(); down(key); }}
            onPointerUp={(e) => { e.preventDefault(); up(key); }}
            onPointerLeave={(e) => { e.preventDefault(); up(key); }}
            onPointerCancel={(e) => { e.preventDefault(); up(key); }}
            onContextMenu={(e) => e.preventDefault()}
            className="active:brightness-75 transition-all flex items-center justify-center"
            style={{
              gridColumn: col,
              gridRow: row,
              width: btn,
              height: btn,
              touchAction: "none",
              WebkitUserSelect: "none",
              userSelect: "none",
              WebkitTouchCallout: "none",
              border: "none",
              background: "none",
              padding: 0,
            }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                width: btn,
                height: btn - 4,
                imageRendering: "pixelated",
                /* Grey → pink: sepia adds color, then hue-rotate to pink */
                filter: "brightness(0.6) sepia(0.6) hue-rotate(300deg) saturate(4) brightness(1.6)",
                pointerEvents: "none",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
