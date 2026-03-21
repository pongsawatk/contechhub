import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { getUserProfile } from "@/lib/notion"
import type { UserProfile } from "@/types/user"

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("NextAuth signIn callback triggered", { userEmail: user?.email, hasAccount: !!account, hasProfile: !!profile });
      try {
        const email = user?.email ?? ""
        // Gate 1: must be @builk.com
        if (!email.endsWith("@builk.com")) {
          console.log("Gate 1 failed: Not @builk.com");
          return false
        }
        // Gate 2: must exist in Notion Users DB and be Active
        const notionProfile = await getUserProfile(email)
        console.log("Notion profile retrieved:", notionProfile);
        if (!notionProfile || !notionProfile.active) {
          console.log("Gate 2 failed: Notion profile not found or inactive");
          return false
        }
        return true
      } catch(e) {
        console.error("signIn callback error", e);
        return false;
      }
    },
    async jwt({ token, user, account, trigger }) {
      // First sign-in — store token and expiry
      if (account) {
        token.accessToken = account.access_token
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000  // convert to ms
          : Date.now() + 3600 * 1000   // default 1 hour
      }

      // Attach profile on first sign in only
      if (trigger === "signIn" && user?.email) {
        const profile = await getUserProfile(user.email)
        token.userProfile = profile ?? undefined
      }

      // Return token if still valid (with 60s buffer)
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number) - 60000) {
        return token
      }

      // Token expired — return existing, Graph API will gracefully fail
      return token
    },
    async session({ session, token }) {
      if (token.userProfile) {
        session.user.profile = token.userProfile as UserProfile
      }
      session.accessToken = token.accessToken as string | undefined
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/unauthorized",
  },
})
