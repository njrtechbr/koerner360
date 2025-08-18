import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pacotes externos para o servidor (otimização de bundle)
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Configuração do ESLint
  eslint: {
    // Manter habilitado para detectar problemas durante o build
    ignoreDuringBuilds: false,
  },
  
  // Configuração do TypeScript
  typescript: {
    // Não ignorar erros de TypeScript durante o build
    ignoreBuildErrors: false,
  },
  
  // Configurações experimentais para otimização
  experimental: {
    // Habilitar debug de erros de runtime no terminal
    browserDebugInfoInTerminal: true,
    // Otimizar imports de pacotes específicos
    optimizePackageImports: [
      '@/components',
      '@/lib',
      'lucide-react',
      '@radix-ui/react-icons'
    ],
  },
  
  // Configurações de imagem para otimização
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
