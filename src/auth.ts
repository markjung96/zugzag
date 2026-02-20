import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcrypt"
import { authRateLimit } from "@/lib/rate-limit"
import { getEnv } from "@/lib/utils/get-env"

// Kakao OAuth Profile Type
interface KakaoProfile {
  id: number
  kakao_account?: {
    profile?: {
      nickname?: string
      profile_image_url?: string
    }
    email?: string
  }
}

// Kakao Provider (Custom)
const KakaoProvider = {
  id: "kakao",
  name: "Kakao",
  type: "oauth" as const,
  authorization: {
    url: "https://kauth.kakao.com/oauth/authorize",
    params: { scope: "profile_nickname profile_image account_email" },
  },
  token: "https://kauth.kakao.com/oauth/token",
  userinfo: "https://kapi.kakao.com/v2/user/me",
  profile(profile: KakaoProfile) {
    return {
      id: profile.id.toString(),
      name: profile.kakao_account?.profile?.nickname ?? "사용자",
      email: profile.kakao_account?.email ?? "",
      image: profile.kakao_account?.profile?.profile_image_url ?? null,
    }
  },
  clientId: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: getEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
    }),
    KakaoProvider,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        if (authRateLimit) {
          const { success } = await authRateLimit.limit(email)
          if (!success) return null
        }

        try {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1)

          if (user.length === 0 || !user[0].passwordHash) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user[0].passwordHash
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            image: user[0].image,
          }
        } catch (error) {
          console.error("Authorize error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      try {
        // DB에서 사용자 확인
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1)

        if (existingUser.length === 0) {
          // 새 사용자 생성
          await db.insert(users).values({
            email: user.email,
            name: user.name || "사용자",
            image: user.image,
            provider: account?.provider || "credentials",
            providerAccountId: account?.providerAccountId,
          })
        }

        return true
      } catch (error) {
        console.error("SignIn error:", error)
        return false
      }
    },
    async jwt({ token, user }) {
      // 최초 로그인 시 또는 DB ID가 없을 때 DB에서 사용자 조회
      if (token.email && !token.dbUserId) {
        const dbUser = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, token.email))
          .limit(1)

        if (dbUser.length > 0) {
          token.dbUserId = dbUser[0].id
        }
      }
      return token
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/signup")
      const isProtectedRoute =
        nextUrl.pathname.startsWith("/crews") ||
        nextUrl.pathname.startsWith("/crew") ||
        nextUrl.pathname.startsWith("/profile") ||
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/schedules")

      // 인증 페이지: 로그인한 사용자는 접근 불가
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/crews", nextUrl))
      }

      // 보호된 라우트: 로그인 필요
      if (isProtectedRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl))
      }

      return true
    },
    async session({ session, token }) {
      if (session.user) {
        // DB의 실제 사용자 ID 사용
        session.user.id = token.dbUserId as string
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
