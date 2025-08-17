import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { logError } from "@/lib/error-utils"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const email = credentials.email as string;
          const password = credentials.password as string;

          const usuarios = await prisma.$queryRaw<Array<{
            id: string;
            nome: string;
            email: string;
            senha: string;
            tipoUsuario: string;
            ativo: boolean;
            supervisorId: string | null;
          }>>`
            SELECT id, nome, email, senha, "tipoUsuario", ativo, "supervisorId"
            FROM usuarios 
            WHERE email = ${email} AND ativo = true
            LIMIT 1
          `;

          if (!usuarios || usuarios.length === 0) {
            return null
          }

          const user = usuarios[0]

          if (!user) {
            return null
          }

          const senhaValida = await bcrypt.compare(
            password,
            user.senha
          )

          if (!senhaValida) {
            return null
          }

          return {
            id: user.id,
            name: user.nome,
            email: user.email,
            userType: user.tipoUsuario,
            supervisorId: user.supervisorId || null
          };
        } catch (error) {
          logError("Erro na autenticação", error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
    signOut: "/login"
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      try {
        if (user) {
          token.userType = user.userType
          token.supervisorId = user.supervisorId
        }
        return token
      } catch (error) {
        logError('Erro no callback JWT', error)
        // Retorna o token mesmo em caso de erro para manter a sessão
        return token
      }
    },
    session: async ({ session, token }) => {
      try {
        if (token) {
          session.user.id = token.sub as string
          session.user.userType = token.userType as string
          session.user.supervisorId = token.supervisorId as string | null
        }
        return session
      } catch (error) {
        logError('Erro no callback de sessão', error)
        // Retorna sessão vazia para forçar nova autenticação
        return {
          ...session,
          user: {
            ...session.user,
            userType: '',
            supervisorId: ''
          }
        }
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
    updateAge: 60 * 60, // 1 hora
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.AUTH_SECRET
})