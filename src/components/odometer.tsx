"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A figure on reels.
 *
 * Each digit is its own column, spinning through several full cycles of zero to
 * nine before stopping on its value. The columns settle left to right, the way
 * a machine releases its reels one after another.
 *
 * The value is in the document as text, and the reels are hidden from
 * assistive technology. A screen reader announces five hundred and sixty one
 * rather than reading forty spans of digits, and a crawler sees the figure.
 *
 * Nothing runs until the block is on screen. These sit well below the fold on
 * most screens, and an animation that plays to an empty viewport has spent
 * itself for nobody. Reduced motion keeps the number and skips the spin.
 */

const CYCLES = 3;
const SPIN_MS = 1150;
const COLUMN_MS = 130;

type Phase = "idle" | "primed" | "spinning";

export function Odometer({ value, offset = 0 }: { value: number; offset?: number }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const frame = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = frame.current;

    if (!node) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let raf = 0;

    const watcher = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        watcher.disconnect();

        /* Two steps rather than one. The resting transform is the correct
           value, so that a page without JavaScript reads right; priming moves
           the reels back to their start with no transition, and only the next
           frame turns the transition on and lets them run forward. */
        setPhase("primed");
        raf = requestAnimationFrame(() => setPhase("spinning"));
      },
      { rootMargin: "0px 0px -20% 0px" },
    );

    watcher.observe(node);

    return () => {
      watcher.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const digits = String(value).split("");

  return (
    <span ref={frame} className="odometer">
      <span className="sr-only">{value}</span>

      {digits.map((digit, column) => {
        const target = Number(digit);
        const cells = CYCLES * 10 + target;

        return (
          <span key={column} className="odometer-slot" aria-hidden="true">
            <span
              className="odometer-strip"
              style={{
                transform:
                  phase === "primed"
                    ? "translateY(0)"
                    : `translateY(calc(var(--digit-height) * -${cells}))`,
                transitionProperty: phase === "spinning" ? "transform" : "none",
                transitionDuration: `${SPIN_MS}ms`,
                transitionDelay: `${offset + column * COLUMN_MS}ms`,
              }}
            >
              {Array.from({ length: cells + 1 }, (_, step) => (
                <span key={step} className="odometer-digit">
                  {step % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
