import type { NextConfig } from "next";
import path from "node:path";

const repositoryRoot = path.resolve(process.cwd(), "../..");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingRoot: repositoryRoot,
  transpilePackages: ["@samadhan/database"],
  turbopack: {
    root: repositoryRoot
  },
  // Re-enable once every internal route in the nav exists.
  typedRoutes: false,
  // Hostinger's container over-reports its CPU count, which makes
  // `next build`'s static-generation phase spawn one OS process per
  // inferred worker and can trip the account's process ceiling.
  experimental: {
    cpus: 2
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
