"use client";

import { useSession } from "next-auth/react";
import QuickActionCard from "@/components/QuickActionCard";
import { FEATURES } from "@/lib/features";
import type { FeatureKey } from "@/lib/features";
import type { UserProfile } from "@/types/user";

interface ActionItem {
  icon: string;
  title: string;
  subtitle: string;
  href: string;
  roles: Array<UserProfile["appRole"]>;
  feature: FeatureKey;
}

const actions: ActionItem[] = [
  {
    icon: "💰",
    title: "ดูราคา",
    subtitle: "ดูแพ็คเกจและราคาสินค้าทั้งหมด",
    href: "/dashboard/pricing",
    roles: ["admin", "bu_member", "internal_viewer"],
    feature: "pricing",
  },
  {
    icon: "💬",
    title: "ถามผม",
    subtitle: "สอบถามข้อมูลผ่าน AI Chatbot",
    href: "/dashboard/chatbot",
    roles: ["admin", "bu_member", "internal_viewer"],
    feature: "chatbot",
  },
  {
    icon: "🧮",
    title: "คิดราคา",
    subtitle: "คำนวณราคาเสนอลูกค้า",
    href: "/dashboard/calculator",
    roles: ["admin", "bu_member"],
    feature: "calculator",
  },
  {
    icon: "📊",
    title: "KPI ของฉัน",
    subtitle: "ติดตามผลการดำเนินงาน",
    href: "/dashboard/kpi",
    roles: ["admin", "bu_member"],
    feature: "kpi",
  },
  {
    icon: "💹",
    title: "Revenue",
    subtitle: "ดูรายได้และสถิติการขาย",
    href: "/dashboard/revenue",
    roles: ["admin", "bu_member"],
    feature: "revenue",
  },
];

function isFeatureVisible(feature: FeatureKey) {
  if (feature === "pricing" || feature === "calculator") {
    return true;
  }

  return FEATURES[feature];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const profile = session?.user?.profile;
  const appRole = profile?.appRole ?? "internal_viewer";
  const displayName = profile?.displayName ?? session?.user?.name ?? "User";

  const visibleActions = actions.filter(
    (action) => action.roles.includes(appRole) && isFeatureVisible(action.feature)
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-white mb-2">
          สวัสดี, {displayName}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {profile?.team && <span className="badge">{profile.team}</span>}
          {profile?.functionalRole && (
            <span className="text-secondary text-sm">
              {profile.functionalRole}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleActions.map((action) => (
          <QuickActionCard
            key={action.href}
            icon={action.icon}
            title={action.title}
            subtitle={action.subtitle}
            href={action.href}
          />
        ))}
      </div>
    </div>
  );
}
