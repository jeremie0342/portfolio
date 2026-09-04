import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  /**
   * Deliberately not a catch-all matcher. Every matched request pays for a
   * proxy pass, and static assets such as the typefaces have no reason to.
   *
   * The console is excluded outright: it has no locale, and passing it through
   * the language router would redirect it to one.
   */
  matcher: [
    "/",
    "/(en|fr)/:path*",
    "/((?!api|console|_next|_vercel|.*\\..*).*)",
  ],
};
