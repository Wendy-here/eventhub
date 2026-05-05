import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://jkefwcttcszndeebgkch.supabase.co/**'),
    ],
  },
};

export default nextConfig;
