import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Buscar usuário no banco de dados
          const usuario = await prisma.usuario.findUnique({
            where: { email: credentials.email as string }
          });

          if (!usuario) {
            return null;
          }

          const senhaValida = await bcrypt.compare(
            credentials.password as string,
            usuario.senha
          );

          if (!senhaValida) {
            return null;
          }

          return {
            id: usuario.id,
            email: usuario.email,
            name: usuario.nome,
            userType: usuario.tipoUsuario.toLowerCase(),
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.userType = token.userType as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Para compatibilidade com scripts de teste
export const authOptions = authConfig;