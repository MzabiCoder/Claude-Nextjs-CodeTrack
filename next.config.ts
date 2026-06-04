import type { NextConfig } from "next";

const r2Hostname = process.env.R2_PUBLIC_URL
  ? new URL(process.env.R2_PUBLIC_URL).hostname
  : null;

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      ...(r2Hostname
        ? [{ protocol: "https" as const, hostname: r2Hostname }]
        : []),
    ],
  },
};

export default nextConfig;
