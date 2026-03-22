import 'next-auth'
import { DefaultSession } from 'next-auth'
import { UserProfile } from './user'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      profile?: UserProfile
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    accessTokenExpires?: number
    refreshToken?: string
    tokenError?: string
    userProfile?: UserProfile
  }
}
