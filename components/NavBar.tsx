"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import UserAvatar from "@/components/UserAvatar";
import { FEATURES } from "@/lib/features";
import type { FeatureKey } from "@/lib/features";
import type { UserProfile } from "@/types/user";

interface NavLink {
  label: string;
  href: string;
  roles: Array<UserProfile["appRole"]>;
  feature: FeatureKey;
}

const navLinks: NavLink[] = [
  {
    label: "ราคา",
    href: "/dashboard/pricing",
    roles: ["admin", "bu_member", "internal_viewer"],
    feature: "pricing",
  },
  {
    label: "Chatbot",
    href: "/dashboard/chatbot",
    roles: ["admin", "bu_member", "internal_viewer"],
    feature: "chatbot",
  },
  {
    label: "คิดราคา",
    href: "/dashboard/calculator",
    roles: ["admin", "bu_member"],
    feature: "calculator",
  },
  {
    label: "KPI",
    href: "/dashboard/kpi",
    roles: ["admin", "bu_member"],
    feature: "kpi",
  },
  {
    label: "Revenue",
    href: "/dashboard/revenue",
    roles: ["admin", "bu_member"],
    feature: "revenue",
  },
  {
    label: "Pipeline",
    href: "/dashboard/pipeline",
    roles: ["admin", "bu_member"],
    feature: "pipeline",
  },
  {
    label: "Usage",
    href: "/dashboard/usage",
    roles: ["admin"],
    feature: "usage",
  },
  {
    label: "Progress",
    href: "/dashboard/progress",
    roles: ["admin"],
    feature: "progress",
  },
];

function isFeatureVisible(feature: FeatureKey) {
  if (feature === "pricing" || feature === "calculator") {
    return true;
  }

  return FEATURES[feature];
}

export default function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const profile = session?.user?.profile;
  const appRole = profile?.appRole ?? "internal_viewer";

  const visibleLinks = navLinks.filter(
    (link) => link.roles.includes(appRole) && isFeatureVisible(link.feature)
  );

  return (
    <nav className="glass-nav sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="text-lg font-bold shrink-0">
        <span className="text-white">Contech</span>
        <span className="text-[#38bdf8]">Hub</span>
      </Link>

      <div className="hidden md:flex items-center gap-1 mx-4">
        {visibleLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-pill ${isActive ? "nav-pill-active" : "nav-pill-inactive"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex md:hidden items-center gap-1 mx-4 overflow-x-auto scrollbar-none">
        {visibleLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-pill text-xs ${isActive ? "nav-pill-active" : "nav-pill-inactive"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <UserAvatar />
    </nav>
  );
}
