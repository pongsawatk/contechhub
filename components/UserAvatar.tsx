"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function UserAvatar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const profile = session?.user?.profile;
  const displayName = profile?.displayName ?? session?.user?.name ?? "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      {/* Avatar circle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
        style={{
          background: "linear-gradient(135deg, #0F6E56, #534AB7)",
        }}
        aria-label="User menu"
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 glass p-4 z-50">
          <p className="text-white font-bold text-sm">{displayName}</p>
          {profile && (
            <p className="text-secondary text-xs mt-0.5">
              {profile.team} · {profile.functionalRole}
            </p>
          )}

          <div className="divider border-t my-3" />

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="glass-ghost w-full px-3 py-2 text-sm font-medium flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}
