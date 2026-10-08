import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 430, 640, 828, 1080, 1200, 1440, 1600, 1920],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
