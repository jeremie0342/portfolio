import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  /**
   * Two build workers rather than one per core.
   *
   * Prerendering runs the share images through a renderer that holds a whole
   * bitmap in memory, and there are more than forty of them. Fifteen workers
   * doing that at once needs more memory than a working laptop has spare, and
   * the build does not fail politely when it runs out: the worker is killed and
   * the process reports a Windows exception code.
   *
   * Two is slower and finishes.
   */
  experimental: {
    cpus: 2,
  },
};

export default withNextIntl(nextConfig);
