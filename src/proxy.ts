import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  /**
   * Deliberately not a catch-all matcher. Every matched request pays for a
   * proxy pass, and static assets such as the typefaces have no reason to.
   */
  matcher: ["/", "/(en|fr)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
