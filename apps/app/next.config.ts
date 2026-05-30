import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // @repo/secrets ships raw TypeScript, so Next must transpile it.
  transpilePackages: ["@repo/secrets"],
}

export default nextConfig
