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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
        ],
      },
    ];
  },
};

export default nextConfig;
