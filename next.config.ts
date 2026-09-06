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
   * A server that carries only what it needs.
   *
   * The traced output is a few dozen megabytes against a few hundred for a
   * full install, which matters on a machine that also runs the database and
   * the object store.
   */
  output: "standalone",
  /**
   * The two OpenType faces are read from disk at request time rather than
   * imported, so nothing in the module graph points at them and the tracer
   * cannot see them. They are what the share images and the curriculum vitae
   * are set in, and a page that regenerates an hour after deployment would
   * otherwise fail on a missing file.
   */
  outputFileTracingIncludes: {
    "/*": ["src/fonts/og/**/*", "src/fonts/pdf/**/*"],
  },
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
