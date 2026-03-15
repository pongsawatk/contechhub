import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { getUserProfile } from "@/lib/notion"
import type { UserProfile } from "@/types/user"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email ?? ""
      // Gate 1: must be @builk.com
      if (!email.endsWith("@builk.com")) return false
      // Gate 2: must exist in Notion Users DB and be Active
      const profile = await getUserProfile(email)
      if (!profile || !profile.active) return false
      return true
    },
    async jwt({ token, user, trigger }) {
      // Attach profile on first sign in only
      if (trigger === "signIn" && user?.email) {
        const profile = await getUserProfile(user.email)
        token.userProfile = profile ?? undefined
      }
      return token
    },
    async session({ session, token }) {
      if (token.userProfile) {
        session.user.profile = token.userProfile as UserProfile
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/unauthorized",
  },
})
