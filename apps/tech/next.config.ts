import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lint runs via `pnpm lint` (flat ESLint config); skip the redundant build-time check
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@commfit/ui', '@commfit/api-client', '@commfit/shared-types'],
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: 'commfit-tech',
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: false,
});
