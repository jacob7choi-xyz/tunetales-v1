import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ONLY data/public/ may ever be traced into the deployment: the
  // directory is the classification boundary and raw research/pipeline
  // artifacts must never ship (see data/public/README.md). The tracer's
  // static analysis over-approximates dynamic fs paths in app/lib/data.ts
  // to all of data/, so data/ is excluded wholesale for every route and
  // the public namespace is added back explicitly where server code
  // reads it at request time.
  outputFileTracingExcludes: {
    "*": ["./data/**"],
  },
  outputFileTracingIncludes: {
    "/api/**": ["./data/public/**"],
    "/artists/**": ["./data/public/**"],
  },
  images: {
    // Server-side fetch origins for the next/image optimizer (browser
    // requests stay same-origin through /_next/image). Unsplash pruned:
    // no longer referenced anywhere.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "**.spotifycdn.com",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // REPORT-ONLY observation stage (Phase 5a): derived from an
          // empirical main-frame origin inventory of the production
          // build. Our document loads every resource type same-origin
          // (remote art proxies through /_next/image, fonts are
          // self-hosted); the only cross-origin surface is the Spotify
          // embed frame. script/style 'unsafe-inline' is the pragmatic
          // floor for Next without nonce infrastructure; nonces remain
          // future hardening, and this policy is origin/resource
          // restriction, not script-injection elimination. Enforcement
          // (5c) only after production observation shows zero violations.
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-src https://open.spotify.com",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
