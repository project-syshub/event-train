import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // スマホ等から同一LANのIPアドレスで開発サーバーにアクセスするため
  allowedDevOrigins: ["172.26.9.89"],
};

export default nextConfig;
