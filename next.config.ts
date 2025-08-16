import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Configurações experimentais para otimização
  experimental: {
    optimizePackageImports: ['@/components'],
  },
};

export default nextConfig;
