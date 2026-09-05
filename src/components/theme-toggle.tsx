"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

const storageKey = "theme";

/**
 * Reflects and flips the active theme, and applies a stored choice.
 *
 * The site opens light and turns dark only when asked, so the document element
 * is the single source of truth: no attribute means light. The system
 * preference is not consulted here because the stylesheet does not consult it
 * either, and a control that disagreed with the page would be worse than no
 * control at all.
 *
 * A stored choice is applied on mount, so a reader who chose dark sees one
 * frame of light first. The alternatives were worse: an inline script React
 * refuses to run on client navigation, a render-blocking request on the
 * critical path for everyone, or reading a cookie on the server, which would
 * opt every page out of static rendering to serve a preference most people
 * never set.
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
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
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
    /* Private browsing and blocked storage both throw. The default already
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
    const next: Theme = theme === "dark" ? "light" : "dark";
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
