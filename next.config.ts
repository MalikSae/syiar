import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*.localhost',
    'localhost:3000',
    '192.168.1.31.nip.io',
    '*.192.168.1.31.nip.io',
  ],
};

export default nextConfig;
