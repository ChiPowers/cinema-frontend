/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a self-contained .next/standalone build (server plus only the
  // node_modules it actually needs), which is what the Dockerfile's runner
  // stage copies. Not needed for `npm run dev` / `next start` outside Docker.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

module.exports = nextConfig;
