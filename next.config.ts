import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js ships modern ESM that Next can bundle directly; transpiling keeps older targets happy.
  transpilePackages: ["three"],
};

export default nextConfig;
