"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * A word in the headline that gives way to the next in turn.
 *
 * Only the current word is in the document. Stacking all three and hiding two
 * would leave a crawler and a screen reader reading "products solutions worlds"
 * inside the sentence, which is not a sentence.
 *
 * The width is therefore measured rather than inherited from the widest child.
 * A hidden span is written to, read, and emptied again, so the measurement
 * costs one reflow at mount and leaves nothing behind. Without it the sentence
 * would either jump on every change or sit in a box padded to the longest word,
 * which shows as a gap before the comma.
 *
 * Nothing is clipped. At display size the ascenders and descenders of Redaction
 * run well outside the line box, so the words fade and shift a third of an em
 * rather than rolling behind a mask.
 */

const DWELL_MS = 3200;
const SWAP_MS = 520;

export function WordCycle({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [widths, setWidths] = useState<number[] | null>(null);

  const ruler = useRef<HTMLSpanElement>(null);

  /* Measured after the fonts have settled: a width taken while the fallback is
     still showing would size the box for the wrong typeface. */
  useLayoutEffect(() => {
    let cancelled = false;

    function measure() {
      const node = ruler.current;

      if (cancelled || !node) {
        return;
      }

      const measured = words.map((word) => {
        node.textContent = word;
        return node.getBoundingClientRect().width;
      });

      node.textContent = "";
      setWidths(measured);
    }

    measure();
    void document.fonts.ready.then(measure);

    return () => {
      cancelled = true;
    };
  }, [words]);

  useEffect(() => {
    /* Someone who asked for less motion is not asking for a headline that
       rewrites itself every three seconds. They keep the first word. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let settle: ReturnType<typeof setTimeout>;

    const turning = setInterval(() => {
      /* A hidden tab would otherwise queue up turns nobody watched and land on
         an arbitrary word when the reader comes back. */
      if (document.hidden) {
        return;
      }

      setLeaving(index);
      setIndex((current) => (current + 1) % words.length);
      settle = setTimeout(() => setLeaving(null), SWAP_MS);
    }, DWELL_MS);

    return () => {
      clearInterval(turning);
      clearTimeout(settle);
    };
  }, [index, words.length]);

  return (
    <span
      className="cycle"
      style={widths ? { width: `${widths[index]}px` } : undefined}
    >
      <span ref={ruler} className="cycle-ruler" aria-hidden="true" />

      {leaving !== null ? (
        <span key={`out-${leaving}`} className="cycle-word cycle-out" aria-hidden="true">
          {words[leaving]}
        </span>
      ) : null}

      <span key={`in-${index}`} className="cycle-word">
        {words[index]}
      </span>
    </span>
  );
}
