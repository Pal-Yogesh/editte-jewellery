import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  // Prevent bundling firebase-admin and its deps — fixes CJS/ESM conflict on Vercel
  serverExternalPackages: [
    "firebase-admin",
    "jwks-rsa",
    "jose",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
