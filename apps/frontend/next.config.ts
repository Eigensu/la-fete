import type { NextConfig } from 'next';
import path from 'path';

// In production API_URL must point at the deployed backend. A missing value
// (or one copied from .env, which points at localhost) bakes an unreachable
// URL into the build and surfaces much later as ECONNREFUSED 127.0.0.1:3001
// on every page that fetches products. Fail the build instead, while keeping
// the localhost default for local dev.
const LOOPBACK = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?(?:\/|$)/i;
const BACKEND_HINT =
  'Set it to the backend origin (e.g. https://backend-production-4c241.up.railway.app), ' +
  'with no trailing /api/v1, for the Production environment, then redeploy.';

if (process.env.NODE_ENV === 'production') {
  if (!process.env.API_URL) {
    throw new Error(`API_URL is not set. ${BACKEND_HINT}`);
  }
  if (LOOPBACK.test(process.env.API_URL)) {
    throw new Error(
      `API_URL is "${process.env.API_URL}", which is unreachable from a deployed ` +
        `server and will fail as ECONNREFUSED at request time. This is the value ` +
        `from .env, meant for local development only. ${BACKEND_HINT}`,
    );
  }
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
      {
        source: '/products/bakes/szn-special',
        destination: '/products/bakes/seasonal-special',
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