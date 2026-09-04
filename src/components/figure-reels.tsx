"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * The year figures, mounted on reels.
 *
 * All eight digits across the three numbers spin at once and stop one at a
 * time, in a random order drawn fresh on every visit. A left to right cascade
 * reads as a wipe; a machine releases its reels in whatever order its detents
 * catch, and that unpredictability is most of what makes it feel mechanical.
 *
 * The schedule has to be shared, which is why the three numbers are rendered
 * here rather than by three independent components: no reel can know when to
 * stop without knowing about the others.
 *
 * Every reel starts together and they differ in duration rather than in delay.
 * Staggering the start would leave half the digits sitting still while the
 * others ran. Distance grows with duration so the later reels do not visibly
 * slow down while they wait their turn.
 *
 * The values are in the document as text with the reels hidden from assistive
 * technology, so a screen reader announces the figure rather than reading a
 * hundred spans of digits, and nothing runs until the block is on screen.
 */

const BASE_CYCLES = 4;
const BASE_MS = 1500;
const STEP_MS = 260;

type Phase = "idle" | "primed" | "spinning";

function shuffled(length: number) {
  const order = Array.from({ length }, (_, index) => index);

  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  return order;
}

export function FigureReels({
  figures,
}: {
  figures: readonly (readonly [number, string])[];
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [order, setOrder] = useState<number[] | null>(null);
  const frame = useRef<HTMLDListElement>(null);

  /* Flattened so a digit can be addressed by one index across all three
     numbers, which is what the shared schedule needs. */
  const slots = useMemo(() => {
    let index = 0;

    return figures.map(([value]) =>
      String(value)
        .split("")
        .map((digit) => ({ digit: Number(digit), slot: index++ })),
    );
  }, [figures]);

  const total = slots.reduce((sum, digits) => sum + digits.length, 0);

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
        setOrder(shuffled(total));

        /* Two steps. The resting transform is the correct value so a page with
           no JavaScript reads right; priming moves the reels back to zero with
           no transition, and only the next frame turns the transition on. */
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
  }, [total]);

  return (
    <dl ref={frame} className="mt-8 flex flex-wrap gap-x-16 gap-y-8">
      {figures.map(([value, label], figure) => (
        <div key={label}>
          <dt className="t-display text-display-l">
            <span className="odometer">
              <span className="sr-only">{value}</span>

              {slots[figure].map(({ digit, slot }) => {
                const rank = order ? order[slot] : 0;
                const cycles = BASE_CYCLES + rank;
                const cells = cycles * 10 + digit;

                return (
                  <span key={slot} className="odometer-slot" aria-hidden="true">
                    <span
                      className="odometer-strip"
                      style={{
                        transform:
                          phase === "primed"
                            ? "translateY(0)"
                            : `translateY(calc(var(--digit-height) * -${cells}))`,
                        transitionProperty:
                          phase === "spinning" ? "transform" : "none",
                        transitionDuration: `${BASE_MS + rank * STEP_MS}ms`,
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
          </dt>

          <dd className="t-meta text-content-muted mt-2">{label}</dd>
        </div>
      ))}
    </dl>
  );
}
