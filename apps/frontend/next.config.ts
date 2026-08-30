import type { NextConfig } from 'next';
import path from 'path';

// In production API_URL must point at the deployed backend. Defaulting to
// localhost here bakes an unreachable URL into the build, which surfaces much
// later as ECONNREFUSED 127.0.0.1:3001 on every page that fetches products.
// Fail the build instead, while keeping the localhost default for local dev.
if (process.env.NODE_ENV === 'production' && !process.env.API_URL) {
  throw new Error(
    'API_URL is not set. Set it to the backend origin (e.g. ' +
      'https://backend-production-4c241.up.railway.app, with no trailing /api/v1) ' +
      'for the Production environment, then redeploy.',
  );
}

const API_URL = process.env.API_URL || 'http://localhost:3001';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@apollo/client'],
  },
  // Load env from root
  env: {
    API_URL,
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT || `${API_URL}/graphql`,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME,
    NEXT_PUBLIC_STORE_EMAIL: process.env.NEXT_PUBLIC_STORE_EMAIL,
    NEXT_PUBLIC_STORE_PHONE: process.env.NEXT_PUBLIC_STORE_PHONE,
  },
  async redirects() {
    return [
      {
        source: '/products/liquor-infused',
        destination: '/products/boozy-whole-wheat',
        permanent: true,
      },
      {
        source: '/products/liquor-infused/:slug',
        destination: '/products/boozy-whole-wheat/:slug',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;