/** @type {import('next').NextConfig} */
const isMobileBuild = process.env.BUILD_TARGET === "mobile";

const nextConfig = {
  reactStrictMode: true,
  // Static export only for mobile builds
  ...(isMobileBuild && {
    output: "export",
    images: { unoptimized: true },
    // Trailing slash helps with file:// protocol in Capacitor
    trailingSlash: true,
  }),
};

module.exports = nextConfig;
