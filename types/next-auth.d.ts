import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      userType: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE' | 'CONSULTOR'
      supervisorId?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    userType: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE' | 'CONSULTOR'
    supervisorId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userType: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE' | 'CONSULTOR'
    supervisorId?: string | null
  }
}