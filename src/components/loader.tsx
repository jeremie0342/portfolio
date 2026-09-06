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

/* What the sequence costs on a return visit, as a fraction of itself.
   The opening earns its length once: it is how the wordmark is introduced, and
   somebody meeting the site deserves to watch it arrive. The fourth time in
   ten minutes it is a door that sticks. Halved rather than dropped, because a
   page that appears with no transition at all reads as a different site. */
const RETURN_PACE = 0.5;

/* And what it costs on a phone.
   The sequence holds the page back while it plays, so it is the whole of the
   render delay in front of the largest element on the page, which is the name.
   Measured on a throttled connection that delay was 2.28 seconds out of a 3.2
   second paint, which puts the front page in the band Google calls "needs
   improvement" for a reason that is entirely self inflicted. At this pace the
   sequence lasts about 1.4 seconds and the paint lands back under the line,
   with the same movements in the same order.

   Small screens only. On a desktop the same measurement shows nine tenths of a
   second and nothing to gain. */
const NARROW_PACE = 0.63;
const NARROW = "(max-width: 48rem)";

const SEEN = "opening";

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

  /* Held in a ref rather than in state: the server renders this component into
     the document and has no way of knowing whether this tab has seen the
     opening before, so reading the answer during render would mean one markup
     on the server and another on the client. A layout effect runs before the
     first paint, which is early enough. */
  const pace = useRef(1);

  /*
   * The root carries the phase so CSS can hold the page back and release it,
   * without the loader having to know anything about the pages. Set before
   * paint, and only from here: with no script the attribute is absent and the
   * document is simply visible, which is the behaviour a crawler gets.
   */
  useLayoutEffect(() => {
    /* Session storage rather than local: a tab is the unit that matches what
       a reader experiences as one visit, and tomorrow they should see the
       opening again. Wrapped, because a browser set to refuse storage throws
       on the read rather than returning nothing. */
    if (window.matchMedia(NARROW).matches) {
      pace.current = NARROW_PACE;
    }

    try {
      if (sessionStorage.getItem(SEEN)) {
        /* The two compound rather than compete: a second arrival on a phone is
           the case with the least to gain from an introduction. */
        pace.current *= RETURN_PACE;
      }

      sessionStorage.setItem(SEEN, "1");
    } catch {
      /* No storage, no memory, full sequence every time. */
    }

    if (pace.current !== 1) {
      /* The travel is a CSS transition, so its duration lives in the variable
         the stylesheet reads rather than in this file. */
      document.documentElement.style.setProperty(
        "--opening-travel",
        `${Math.round(TRAVEL_MS * pace.current)}ms`,
      );
    }

    document.documentElement.dataset.opening = "playing";
  }, []);

  useEffect(() => {
    const started = performance.now();
    const rate = pace.current;
    const resolve = RESOLVE_MS * rate;

    const ticking = setInterval(() => {
      setStep((current) => Math.min(current + 1, wearSequence.length - 1));
    }, STEP_MS * rate);

    /* The counter runs on its own clock rather than on the wear steps: six
       jumps for twenty entries reads as a stutter, and the number is the part
       a reader watches. */
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min(1, (now - started) / resolve);
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
        resolve + HOLD_MS * rate - (performance.now() - started),
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
        land = setTimeout(() => setPhase("done"), TRAVEL_MS * rate);
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
