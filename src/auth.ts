import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Usando Prisma com query raw para acessar a tabela real
          const usuarios = await prisma.$queryRaw<Array<{
            id: string;
            nome: string;
            email: string;
            senha: string;
            tipoUsuario: string;
            ativo: boolean;
            supervisorId?: string;
          }>>`
            SELECT id, nome, email, senha, "tipoUsuario", ativo, "supervisorId"
            FROM usuarios 
            WHERE email = ${credentials.email} AND ativo = true
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
            credentials.password,
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
          }
        } catch (error) {
          console.error("Erro na autenticação:", error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType
        token.supervisorId = user.supervisorId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.userType = token.userType as string
        session.user.supervisorId = token.supervisorId as string | null
      }
      return session
    }
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET
}