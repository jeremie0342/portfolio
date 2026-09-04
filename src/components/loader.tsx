"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { wearSequence } from "@/lib/wear-fonts";

/**
 * The opening.
 *
 * Three movements, and the order carries the idea.
 *
 * First the wordmark wears. It starts in the face the pages are set in and
 * runs towards degree 100, which is not a degradation but an arrival: degree
 * 100 is the face of the logo, so by the last frame the mark has already
 * become the thing that lives in the masthead.
 *
 * Then it travels. Measured against the real logo and moved onto it, shrinking
 * as it goes. Nothing morphs, because nothing needs to: the two are the same
 * word in the same face at two sizes, so a transform is the entire animation.
 *
 * Then the page arrives around it, section by section, as if the light came up
 * after the writing had settled.
 *
 * It hides nothing. The document is rendered underneath in full, so a crawler
 * and a screen reader read a complete page whatever the animation is doing,
 * and the layer is out of the accessibility tree. Reduced motion is answered
 * entirely in CSS, including the part that holds the page back, so someone who
 * asks for it sees the finished page immediately and no script has to know.
 */

const STEP_MS = 190;
const RESOLVE_MS = STEP_MS * wearSequence.length;
const HOLD_MS = 320;
const TRAVEL_MS = 760;
/* How long the fonts are given beyond the sequence. A slow network shortens
   what follows rather than extending the wait. */
const CEILING_MS = 3000;

type Phase = "resolving" | "travelling" | "done";

/* Ease out cubic, so the count decelerates into its final value instead of
   stopping dead. */
function eased(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function Loader({ count }: { count: number }) {
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [phase, setPhase] = useState<Phase>("resolving");

  const mark = useRef<HTMLParagraphElement>(null);

  /*
   * The root carries the phase so CSS can hold the page back and release it,
   * without the loader having to know anything about the pages. Set before
   * paint, and only from here: with no script the attribute is absent and the
   * document is simply visible, which is the behaviour a crawler gets.
   */
  useLayoutEffect(() => {
    document.documentElement.dataset.opening = "playing";
  }, []);

  useEffect(() => {
    const started = performance.now();

    const ticking = setInterval(() => {
      setStep((current) => Math.min(current + 1, wearSequence.length - 1));
    }, STEP_MS);

    /* The counter runs on its own clock rather than on the wear steps: six
       jumps for twenty entries reads as a stutter, and the number is the part
       a reader watches. */
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min(1, (now - started) / RESOLVE_MS);
      setReached(Math.round(count * eased(progress)));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    });

    const ready = Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, CEILING_MS)),
    ]);

    let travel: ReturnType<typeof setTimeout>;
    let land: ReturnType<typeof setTimeout>;

    void ready.then(() => {
      const remaining = Math.max(
        0,
        RESOLVE_MS + HOLD_MS - (performance.now() - started),
      );

      travel = setTimeout(() => {
        /* Measured at the moment of departure rather than on mount: the
           masthead has had the whole sequence to settle, and reading the box
           now is what makes the landing exact instead of approximately
           right. */
        const target = document.querySelector<HTMLElement>("[data-logo]");
        const node = mark.current;

        if (target && node) {
          const from = node.getBoundingClientRect();
          const to = target.getBoundingClientRect();
          const scale = to.width / from.width;

          node.style.transform = [
            `translate(${to.left + to.width / 2 - (from.left + from.width / 2)}px,`,
            `${to.top + to.height / 2 - (from.top + from.height / 2)}px)`,
            `scale(${scale})`,
          ].join(" ");
        }

        setPhase("travelling");
        land = setTimeout(() => setPhase("done"), TRAVEL_MS);
      }, remaining);
    });

    return () => {
      clearInterval(ticking);
      cancelAnimationFrame(frame);
      clearTimeout(travel);
      clearTimeout(land);
    };
  }, [count]);

  useEffect(() => {
    if (phase === "done") {
      document.documentElement.dataset.opening = "done";
    }
  }, [phase]);

  if (phase === "done") {
    return null;
  }

  return (
    <div
      className="opening"
      data-phase={phase}
      aria-hidden="true"
      role="presentation"
    >
      <div className="opening-ground" />

      <div className="opening-stage">
        <p
          ref={mark}
          className="opening-mark"
          style={{ fontFamily: wearSequence[step] }}
        >
          ZARDONIS
        </p>

        <p className="opening-count t-meta">
          {new Date().getUTCFullYear()} / {String(reached).padStart(3, "0")}
        </p>
      </div>
    </div>
  );
}
