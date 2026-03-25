import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Google One Tap / FedCM 자동 주입 버튼 차단
          {
            key: 'Permissions-Policy',
            value: 'identity-credentials-get=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
