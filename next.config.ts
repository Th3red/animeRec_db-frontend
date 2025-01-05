import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "s4.anilist.co",
      "cdn.myanimelist.net",
      "media.kitsu.io",
      "media.kitsu.app", // Add this domain
    ],
  },
  // Other configurations can go here
};

export default nextConfig;
