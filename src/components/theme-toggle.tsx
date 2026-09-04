"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

/*
 * The document element is the source of truth for the active theme: the
 * pre-paint script writes it there before React ever runs. Subscribing to the
 * attribute rather than mirroring it into component state keeps the two from
 * drifting, and leaves room for a second control elsewhere on the page.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/* On the server there is no resolved theme yet, and rendering a guess would
   only produce a label that flips on hydration. */
function readNothing(): null {
  return null;
}

export function ThemeToggle({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, readNothing);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="t-meta text-content-muted hover:text-accent transition-colors"
    >
      {theme === "light" ? "Light" : "Dark"}
    </button>
  );
}
