import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { getUserProfile } from "@/lib/notion"
import type { UserProfile } from "@/types/user"

const MICROSOFT_SCOPE = "openid profile email offline_access User.Read"

async function refreshMicrosoftAccessToken(token: {
  accessToken?: string
  accessTokenExpires?: number
  refreshToken?: string
  userProfile?: UserProfile
}) {
  if (!token.refreshToken) {
    return {
      ...token,
      accessToken: undefined,
      accessTokenExpires: 0,
      tokenError: "MissingRefreshToken",
    }
  }

  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.AZURE_AD_CLIENT_ID!,
          client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
          scope: MICROSOFT_SCOPE,
        }),
      }
    )

    const refreshed = await response.json()
    if (!response.ok) {
      throw refreshed
    }

    return {
      ...token,
      accessToken: refreshed.access_token as string,
      accessTokenExpires: Date.now() + Number(refreshed.expires_in ?? 3600) * 1000,
      refreshToken: (refreshed.refresh_token as string | undefined) ?? token.refreshToken,
      tokenError: undefined,
    }
  } catch (error) {
    console.error("refreshMicrosoftAccessToken error", error)
    return {
      ...token,
      accessToken: undefined,
      accessTokenExpires: 0,
      tokenError: "RefreshAccessTokenError",
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: MICROSOFT_SCOPE,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("NextAuth signIn callback triggered", { userEmail: user?.email, hasAccount: !!account, hasProfile: !!profile })
      try {
        const email = user?.email ?? ""
        if (!email.endsWith("@builk.com")) {
          console.log("Gate 1 failed: Not @builk.com")
          return false
        }

        const notionProfile = await getUserProfile(email)
        console.log("Notion profile retrieved:", notionProfile)
        if (!notionProfile || !notionProfile.active) {
          console.log("Gate 2 failed: Notion profile not found or inactive")
          return false
        }

        return true
      } catch (e) {
        console.error("signIn callback error", e)
        return false
      }
    },
    async jwt({ token, user, account, trigger }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token ?? token.refreshToken
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000
      }

      if ((trigger === "signIn" || !token.userProfile) && user?.email) {
        const profile = await getUserProfile(user.email)
        token.userProfile = profile ?? undefined
      }

      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number) - 60000) {
        return token
      }

      return refreshMicrosoftAccessToken(token)
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
