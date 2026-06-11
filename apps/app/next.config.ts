import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // @repo/secrets ships raw TypeScript, so Next must transpile it.
  transpilePackages: ["@repo/secrets"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/blog/:slug.md",
          destination: "/blog-twin/:slug.md",
        },
      ],
    };
  },
}

export default nextConfig
