"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

const query = "(prefers-color-scheme: light)";
const storageKey = "theme";

/**
 * Reflects and flips the active theme, and applies a stored override.
 *
 * The system preference is answered in CSS alone, so a visitor who never
 * touched this control gets the right ground on the first paint with no
 * JavaScript involved. What remains is the minority who chose a theme that
 * differs from their system, and that override is applied here on mount.
 *
 * Those visitors see one frame of their system theme before the override
 * lands. The alternatives were worse: an inline script that React refuses to
 * run on client navigation, a render-blocking request on the critical path for
 * every visitor, or reading a cookie on the server, which would opt every page
 * out of static rendering to serve a preference most people never set.
 *
 * The effective theme has two possible sources, an explicit attribute or the
 * system query, so both are read and both are subscribed to. Reading only the
 * attribute would label this control "Dark" while the page renders light.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

function readTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;

  if (chosen === "light" || chosen === "dark") {
    return chosen;
  }

  return window.matchMedia(query).matches ? "light" : "dark";
}

/* Nothing is resolved on the server, and rendering a guess would only produce
   a label that flips on hydration. */
function readNothing(): null {
  return null;
}

function readStored(): Theme | null {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    /* Private browsing and blocked storage both throw. The CSS default already
       renders correctly, so there is nothing to recover from. */
    return null;
  }
}

export function ThemeToggle({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, readNothing);

  useEffect(() => {
    const stored = readStored();

    if (stored) {
      document.documentElement.dataset.theme = stored;
    }
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;

    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* The theme still applies to this page view, it simply is not
         remembered. */
    }
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
