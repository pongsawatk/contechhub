"use client";

import { useRouter } from "next/navigation";

interface QuickActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  href: string;
}

export default function QuickActionCard({
  icon,
  title,
  subtitle,
  href,
}: QuickActionCardProps) {
  const router = useRouter();

  return (
    <div
      className="glass-card p-5 flex items-start gap-4"
      onClick={() => router.push(href)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          router.push(href);
        }
      }}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>

      {/* Text */}
      <div>
        <p className="text-white font-bold text-base">{title}</p>
        <p className="text-secondary text-[13px] mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
