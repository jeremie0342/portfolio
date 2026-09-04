import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * These replace the primitives from next/navigation across the app. They
 * carry the active locale through transitions, which the native versions
 * know nothing about.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
