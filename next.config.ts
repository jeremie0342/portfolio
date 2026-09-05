import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/* The bucket's public origin, read once so a missing variable is a build that
   simply serves no remote images rather than one that throws. */
const media = process.env.MINIO_PUBLIC_URL
  ? new URL(process.env.MINIO_PUBLIC_URL)
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: media
      ? [
          {
            protocol: media.protocol.replace(":", "") as "http" | "https",
            hostname: media.hostname,
            port: media.port,
            pathname: "/**",
          },
        ]
      : [],
  },
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
