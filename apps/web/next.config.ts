import type { NextConfig } from "next";
import { getServerApiBase } from "@hari/web-config";

const backend = getServerApiBase();

const nextConfig: NextConfig = {
  transpilePackages: ["@hari/web-config"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
