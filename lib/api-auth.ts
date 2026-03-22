import type { Session } from "next-auth"

export function hasAuthenticatedUser(session: Session | null): session is Session & {
  user: NonNullable<Session["user"]> & { email: string }
} {
  return Boolean(session?.user?.email)
}

export function hasBuAccess(session: Session | null): boolean {
  if (!hasAuthenticatedUser(session)) {
    return false
  }

  const appRole = session.user.profile?.appRole
  return appRole === "admin" || appRole === "bu_member"
}

export function isAdmin(session: Session | null): boolean {
  return hasAuthenticatedUser(session) && session.user.profile?.appRole === "admin"
}
