"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * A word in the headline mounted on a reel.
 *
 * The words roll past a window rather than fading, and the page opens with a
 * spin that decelerates into the first one, the way a slot reel settles. After
 * that it turns slowly, at reading pace rather than at machine pace.
 *
 * Only the current word is in the document. Stacking all three and hiding two
 * would leave a crawler and a screen reader reading "products solutions worlds"
 * inside the sentence, which is not a sentence.
 *
 * The width is measured rather than inherited from the longest child. A hidden
 * span is written to, read and emptied again, so the cost is one reflow and
 * nothing is left behind. Without it the sentence would either jump on every
 * turn or sit in a box padded to the longest word, which shows as a gap before
 * the comma.
 */

/* Long enough to read the word twice over, since the reel is beside a headline
   rather than in it. */
const DWELL_MS = 4600;
const TURN_MS = 460;

/* The spin lands on the word it started from: a multiple of the word count, so
   the reel comes to rest where the sentence expects it. */
const SPIN_STEPS = 12;
const SPIN_FIRST_MS = 55;
const SPIN_LAST_MS = 340;

function spinDelay(step: number) {
  /* Quadratic, so the reel loses speed the way a weighted one does: barely at
     first, then all at once near the end. */
  const t = step / (SPIN_STEPS - 1);
  return SPIN_FIRST_MS + (SPIN_LAST_MS - SPIN_FIRST_MS) * t * t;
}

/* The reel should settle after the opening has handed the page over, not
   underneath it. With no opening the attribute is absent and it starts at
   once. */
function whenPageArrives(run: () => void) {
  const root = document.documentElement;

  if (root.dataset.opening !== "playing") {
    run();
    return () => {};
  }

  const observer = new MutationObserver(() => {
    if (root.dataset.opening === "done") {
      observer.disconnect();
      run();
    }
  });

  observer.observe(root, { attributes: true, attributeFilter: ["data-opening"] });

  return () => observer.disconnect();
}

export function WordCycle({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [turnMs, setTurnMs] = useState(TURN_MS);
  const [widths, setWidths] = useState<number[] | null>(null);
  const [settled, setSettled] = useState(false);

  const ruler = useRef<HTMLSpanElement>(null);

  /* The reel position is tracked in a ref as well as in state. A state
     updater has to be pure, and React calls it twice in development, so the
     previous word cannot be captured from inside one. */
  const at = useRef(0);

  const advance = useCallback(
    (duration: number) => {
      const from = at.current;
      const to = (from + 1) % words.length;

      at.current = to;
      setTurnMs(duration);
      setLeaving(from);
      setIndex(to);
    },
    [words.length],
  );

  /* Measured after the fonts settle: a width taken while the fallback is still
     showing would size the box for the wrong typeface. */
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

  /* The spin. */
  useEffect(() => {
    /* Someone who asked for less motion is not asking for a slot machine. The
       reel never starts, and the slow turn below refuses for the same
       reason. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    const stop = whenPageArrives(() => {
      let elapsed = 0;

      for (let step = 0; step < SPIN_STEPS; step += 1) {
        const delay = spinDelay(step);
        elapsed += delay;

        timers.push(
          setTimeout(() => advance(Math.round(delay * 0.8)), elapsed),
        );
      }

      timers.push(
        setTimeout(() => {
          setTurnMs(TURN_MS);
          setLeaving(null);
          setSettled(true);
        }, elapsed + SPIN_LAST_MS),
      );
    });

    return () => {
      stop();
      timers.forEach(clearTimeout);
    };
  }, [advance]);

  /* The slow turn, once the reel has come to rest. */
  useEffect(() => {
    if (!settled) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let clear: ReturnType<typeof setTimeout>;

    const turning = setInterval(() => {
      /* A hidden tab would otherwise queue turns nobody watched and land on an
         arbitrary word when the reader comes back. */
      if (document.hidden) {
        return;
      }

      advance(TURN_MS);
      clear = setTimeout(() => setLeaving(null), TURN_MS);
    }, DWELL_MS);

    return () => {
      clearInterval(turning);
      clearTimeout(clear);
    };
  }, [settled, advance]);

  return (
    <span
      className="reel"
      style={
        {
          "--reel-ms": `${turnMs}ms`,
          ...(widths ? { width: `${widths[index]}px` } : {}),
        } as React.CSSProperties
      }
    >
      <span ref={ruler} className="reel-ruler" aria-hidden="true" />

      {leaving !== null && leaving !== index ? (
        <span
          key={`out-${leaving}-${turnMs}`}
          className="reel-word reel-out"
          aria-hidden="true"
        >
          {words[leaving]}
        </span>
      ) : null}

      <span key={`in-${index}`} className="reel-word reel-in">
        {words[index]}
      </span>
    </span>
  );
}
