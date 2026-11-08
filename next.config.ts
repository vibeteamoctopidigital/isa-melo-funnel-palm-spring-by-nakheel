import { BASE_PATH } from "./lib/base-path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: BASE_PATH,
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
};

export default nextConfig;
