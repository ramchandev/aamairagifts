import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [{ source: "/track/:token", destination: "/order/:token", permanent: false }];
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lvyyhdxricbdamvqwnwe.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
