/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Recommended for the `pages` directory, default in `app`.
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.ZITADEL_API_URL.replace("https://", ""),
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
