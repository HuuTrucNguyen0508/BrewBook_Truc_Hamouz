import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: { 
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" }, 
      { protocol: "https", hostname: "res.cloudinary.com" }
    ] 
  },
  experimental: { 
    serverActions: { bodySizeLimit: "1mb" } 
  },
};

export default nextConfig;
