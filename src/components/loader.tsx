"use client";

import { useEffect, useState } from "react";
import { wearSequence } from "@/lib/wear-fonts";

/**
 * The opening.
 *
 * The wordmark arrives at the coarsest degree of Redaction's print wear and
 * resolves through five steps into the face the rest of the site is set in,
 * while the accession counter runs up to the size of the archive. A document
 * coming into focus, performed by the typeface's own system rather than by an
 * effect laid over it.
 *
 * The duration is an art direction decision, not a progress indicator. The
 * pages behind it are static and arrive in a fraction of the time this takes,
 * so the sequence is held deliberately: about two seconds of wear resolving,
 * then a short hold on the sharp wordmark before it lifts. Calling it a loader
 * would be a polite fiction; it is a title card.
 *
 * It plays on every full page load. Client-side navigation does not retrigger
 * it, since the layer lives in the root layout and Next keeps that mounted
 * across routes.
 *
 * It hides nothing. The page is rendered behind it in full, so a crawler and a
 * screen reader both read a complete document, and the layer is out of the
 * accessibility tree. Anyone asking for reduced motion never sees it, and that
 * is answered in CSS so there is no frame where it appears first.
 */

const STEP_MS = 240;
const HOLD_MS = 700;
const SEQUENCE_MS = STEP_MS * wearSequence.length;
const TOTAL_MS = SEQUENCE_MS + HOLD_MS;
/* How long the fonts are given beyond the sequence itself. A slow network
   shortens what follows rather than extending the wait. */
const CEILING_MS = 3000;
const FADE_MS = 500;

/* Ease out cubic. The count decelerates into its final value instead of
   stopping dead, which is the difference between a number arriving and a
   number simply ceasing to change. */
function eased(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function Loader({ count }: { count: number }) {
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const started = performance.now();

    const ticking = setInterval(() => {
      setStep((current) => Math.min(current + 1, wearSequence.length - 1));
    }, STEP_MS);

    /* The counter runs on its own clock rather than on the wear steps: six
       jumps for twenty entries reads as a stutter, and the number is the part
       a reader actually watches. */
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min(1, (now - started) / SEQUENCE_MS);
      setReached(Math.round(count * eased(progress)));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    });

    const ready = Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, CEILING_MS)),
    ]);

    let fade: ReturnType<typeof setTimeout>;
    let strip: ReturnType<typeof setTimeout>;

    void ready.then(() => {
      const remaining = Math.max(0, TOTAL_MS - (performance.now() - started));

      fade = setTimeout(() => {
        setResolved(true);
        strip = setTimeout(() => setRemoved(true), FADE_MS);
      }, remaining);
    });

    return () => {
      clearInterval(ticking);
      cancelAnimationFrame(frame);
      clearTimeout(fade);
      clearTimeout(strip);
    };
  }, [count]);

  if (removed) {
    return null;
  }

  return (
    <div
      className="opening"
      data-resolved={resolved ? "true" : "false"}
      aria-hidden="true"
      role="presentation"
    >
      <p className="opening-mark" style={{ fontFamily: wearSequence[step] }}>
        ZARDONIS
      </p>

      <p className="opening-count t-meta">
        {new Date().getUTCFullYear()} / {String(reached).padStart(3, "0")}
      </p>
    </div>
  );
}
