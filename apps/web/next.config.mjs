/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "i.ytimg.com", protocol: "https" },
      { hostname: "lh3.googleusercontent.com", protocol: "https" },
    ],
  },
  transpilePackages: ["@aurora/shared"],
};

export default nextConfig;
