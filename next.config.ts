import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/* The bucket's public origin, read once so a missing variable is a build that
   simply serves no remote images rather than one that throws. */
const media = process.env.MINIO_PUBLIC_URL
  ? new URL(process.env.MINIO_PUBLIC_URL)
  : null;

/**
 * The content security policy.
 *
 * Written without a nonce, and that is the whole decision. A nonce has to be
 * minted per request and matched by the markup, which Next states plainly:
 * adding one requires dynamic rendering. Every page here is rendered once and
 * kept for an hour, so a nonce baked into that cached HTML would stop matching
 * the header sent with it on the second reader, and the site would block its
 * own scripts. The choice is between a strict policy and cached pages.
 *
 * What this one still refuses, which is most of what a policy is for on a site
 * with no user generated markup: a script from any other origin, this page
 * inside anyone's frame, a rewritten base address, a form posting anywhere but
 * here, plugins, and anything fetched over plain HTTP.
 *
 * What it does not refuse: an inline script, because Next writes its own into
 * every page. That gap is covered on this site by the thing that actually
 * prevents injection, which is that nothing here renders markup it did not
 * write. The one exception, the structured data block, is serialised from
 * values in the database rather than concatenated.
 *
 * The image list carries the object store, because a media file uploaded from
 * the console is fetched by the browser from its own origin.
 */
const mediaOrigin = media ? media.origin : "";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${mediaOrigin}`.trim(),
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

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
  /**
   * Headers the site was serving none of.
   *
   * Each one closes a specific hole rather than being here for a score.
   * Strict transport tells a browser never to try this host over plain HTTP
   * again, which removes the one request an interceptor on a public network
   * gets to answer. Nosniff stops a browser from deciding for itself that a
   * text file is a script. The referrer policy keeps the path of the page
   * someone came from off third party servers, which matters on a site whose
   * paths name the work. Framing is refused outright: nothing here is meant to
   * be embedded, and clickjacking needs an iframe. The permissions list turns
   * off hardware this site has no use for, so a future dependency cannot ask.
   *
   * The content security policy above joins them, with its own reasoning.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
