import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Emits .next/standalone — a self-contained server bundle the Dockerfile copies, so the runtime
  // image does not need a full node_modules tree.
  output: 'standalone',
};

export default nextConfig;
