import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Configurações experimentais para otimização
  experimental: {
    optimizePackageImports: ['@/components'],
  },
  
  // Configurações do Turbopack para SVG
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
