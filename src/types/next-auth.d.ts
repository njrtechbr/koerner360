import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      userType: string
      supervisorId?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    userType: string
    supervisorId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userType: string
    supervisorId?: string | null
  }
}