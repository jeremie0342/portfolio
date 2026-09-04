"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { wearSequence } from "@/lib/wear-fonts";

/**
 * The opening.
 *
 * The wordmark arrives at the coarsest degree of Redaction's print wear and
 * resolves through five steps into the face the rest of the site is set in,
 * while the accession counter runs up to the size of the archive. A document
 * coming into focus, using the typeface's own system rather than an effect
 * borrowed from somewhere else.
 *
 * Three rules govern it, and they matter more than the animation.
 *
 * It does not invent latency. The sequence has a short floor so it is
 * perceptible at all, then holds only until the fonts are actually ready, and
 * a ceiling ensures a slow network cannot turn it into a wait.
 *
 * It runs once per session. Someone returning to the front page after reading
 * an entry has already seen it.
 *
 * It hides nothing. The page is rendered behind it in full, so a crawler and a
 * screen reader both read a complete document, and the layer is removed from
 * the accessibility tree. Anyone asking for reduced motion never sees it, and
 * that is answered in CSS so there is no frame where it appears first.
 */

const STEP_MS = 110;
const FLOOR_MS = STEP_MS * wearSequence.length;
const CEILING_MS = 1800;
const FADE_MS = 500;
const sessionKey = "opening-seen";

export function Loader({ count }: { count: number }) {
  const [step, setStep] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [removed, setRemoved] = useState(false);

  const layer = useRef<HTMLDivElement>(null);
  const seen = useRef(false);

  /*
   * Read before the browser paints. A repeat visit within the session must not
   * show even one frame of an opening that has already played, and an effect
   * running after paint would show exactly that.
   *
   * The layer is hidden by touching the DOM rather than by setting state,
   * which is what an effect is for: React state would only be a detour to
   * reach the same attribute one render later. Storage cannot be read during
   * render either, since the server has none and the two passes would then
   * disagree.
   */
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(sessionKey)) {
        seen.current = true;
        layer.current?.setAttribute("hidden", "");
      }
    } catch {
      /* Blocked storage only means the opening plays again. */
    }
  }, []);

  useEffect(() => {
    if (seen.current) {
      return;
    }

    const started = Date.now();

    const ticking = setInterval(() => {
      setStep((current) => Math.min(current + 1, wearSequence.length - 1));
    }, STEP_MS);

    /* The floor makes the sequence readable, the fonts decide the rest, and
       the ceiling means a slow network shortens the wait rather than
       extending it. */
    const ready = Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, CEILING_MS)),
    ]);

    let fade: ReturnType<typeof setTimeout>;
    let strip: ReturnType<typeof setTimeout>;

    void ready.then(() => {
      const remaining = Math.max(0, FLOOR_MS - (Date.now() - started));

      fade = setTimeout(() => {
        setResolved(true);

        try {
          sessionStorage.setItem(sessionKey, "1");
        } catch {
          /* Nothing to recover from. */
        }

        strip = setTimeout(() => setRemoved(true), FADE_MS);
      }, remaining);
    });

    return () => {
      clearInterval(ticking);
      clearTimeout(fade);
      clearTimeout(strip);
    };
  }, []);

  if (removed) {
    return null;
  }

  const progress = (step + 1) / wearSequence.length;
  const reached = Math.round(count * progress);

  return (
    <div
      ref={layer}
      className="opening"
      data-resolved={resolved ? "true" : "false"}
      aria-hidden="true"
      role="presentation"
    >
      <p className="opening-mark" style={{ fontFamily: wearSequence[step] }}>
        FLEMART
      </p>

      <p className="opening-count t-meta">
        {new Date().getUTCFullYear()} / {String(reached).padStart(3, "0")}
      </p>
    </div>
  );
}
