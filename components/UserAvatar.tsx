"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import type { UserProfile } from "@/types/user";

type AccessLevel = "full" | "limited" | "none";
type RoleColumn = "admin" | "buMember" | "internalViewer";

interface PermissionRow {
  module: string;
  admin: AccessLevel;
  buMember: AccessLevel;
  internalViewer: AccessLevel;
  note: string;
}

const permissionRows: PermissionRow[] = [
  {
    module: "Dashboard Home",
    admin: "full",
    buMember: "full",
    internalViewer: "full",
    note: "หน้าแรกแสดงเมนูตาม role ของผู้ใช้",
  },
  {
    module: "Pricing",
    admin: "full",
    buMember: "full",
    internalViewer: "limited",
    note: "Internal Only price เห็นเฉพาะผู้ใช้ที่อยู่ Contech BU",
  },
  {
    module: "Chatbot",
    admin: "full",
    buMember: "full",
    internalViewer: "none",
    note: "ใช้ถามข้อมูลขายและ pricing ผ่าน AI",
  },
  {
    module: "Calculator / Quote",
    admin: "full",
    buMember: "full",
    internalViewer: "none",
    note: "สร้างราคาและบันทึก quote ได้",
  },
  {
    module: "KPI",
    admin: "full",
    buMember: "limited",
    internalViewer: "none",
    note: "BU member แก้ได้เฉพาะ KPI ที่เป็น accountable ของตัวเอง",
  },
  {
    module: "Revenue",
    admin: "full",
    buMember: "full",
    internalViewer: "none",
    note: "แก้ไม่ได้เมื่อเดือนนั้นถูกล็อค",
  },
  {
    module: "Pipeline",
    admin: "full",
    buMember: "full",
    internalViewer: "none",
    note: "รวม Customer, Hot Quotation และ Sales Order",
  },
  {
    module: "BU Playbook",
    admin: "full",
    buMember: "full",
    internalViewer: "none",
    note: "ต้องเปิด feature playbook ในระบบ",
  },
  {
    module: "User Profile",
    admin: "full",
    buMember: "full",
    internalViewer: "full",
    note: "ดูข้อมูล profile ของตัวเองได้หลัง login",
  },
];

const roleLabels: Record<UserProfile["appRole"], string> = {
  admin: "Admin",
  bu_member: "BU Member",
  internal_viewer: "Internal Viewer",
};

const roleColumnByAppRole: Record<UserProfile["appRole"], RoleColumn> = {
  admin: "admin",
  bu_member: "buMember",
  internal_viewer: "internalViewer",
};

const accessMeta: Record<AccessLevel, { label: string; className: string }> = {
  full: {
    label: "ได้",
    className: "border-emerald-300/30 bg-emerald-400/12 text-emerald-100",
  },
  limited: {
    label: "จำกัด",
    className: "border-sky-300/30 bg-sky-400/12 text-sky-100",
  },
  none: {
    label: "ไม่ได้",
    className: "border-white/10 bg-white/[0.04] text-white/35",
  },
};

function AccessBadge({ level }: { level: AccessLevel }) {
  const meta = accessMeta[level];

  return (
    <span className={`inline-flex min-w-16 justify-center rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function getRoleAccess(row: PermissionRow, role: UserProfile["appRole"]): AccessLevel {
  return row[roleColumnByAppRole[role]];
}

function getRoleColumnClass(
  column: RoleColumn,
  currentRole: UserProfile["appRole"] | undefined,
  rowIndex?: number
) {
  if (!currentRole || roleColumnByAppRole[currentRole] !== column) {
    return "";
  }

  const isFirst = rowIndex === undefined || rowIndex === 0;
  const isLast = rowIndex === permissionRows.length - 1;
  return [
    "bg-sky-400/[0.14]",
    "border-x border-sky-300/45",
    "shadow-[inset_0_0_0_1px_rgba(125,211,252,0.12)]",
    isFirst ? "border-t rounded-t-xl" : "",
    isLast ? "border-b rounded-b-xl" : "",
  ].join(" ");
}

function AccessPermissionsModal({
  currentRole,
  onClose,
}: {
  currentRole?: UserProfile["appRole"];
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const roleLabel = currentRole ? roleLabels[currentRole] : "User";
  const allowedRows = currentRole
    ? permissionRows.filter((row) => getRoleAccess(row, currentRole) !== "none")
    : [];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/85 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="access-permissions-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-sky-300/25 bg-[#071326] shadow-2xl shadow-slate-950/70 sm:max-h-[calc(100dvh-3rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-sky-300/15 bg-[#0a1b34] px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/70">
                Access Matrix
              </p>
              <h2 id="access-permissions-title" className="mt-2 text-xl font-bold text-white sm:text-2xl">
                สิทธิ์การเข้าถึง Module
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="badge">Role ปัจจุบัน: {roleLabel}</span>
                <span className="text-xs text-white/45">ข้อมูลอ้างอิงจาก code ล่าสุด</span>
              </div>
            </div>
            <button
              type="button"
              className="rounded-xl border border-sky-300/25 bg-sky-400/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400/18"
              onClick={onClose}
            >
              ปิด
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {currentRole && (
            <div className="mb-4 rounded-2xl border border-sky-300/25 bg-[#0b213f] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">สิทธิ์ของคุณ</p>
                  <p className="mt-1 text-xs text-white/50">
                    Module ที่ role {roleLabel} ใช้งานได้ในระบบตอนนี้
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-sky-300/35 bg-sky-400/12 px-3 py-1 text-xs font-semibold text-sky-100">
                  {allowedRows.length} modules
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {allowedRows.map((row) => (
                  <div
                    key={row.module}
                    className="rounded-xl border border-white/10 bg-[#081a32] px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-white">{row.module}</span>
                      <AccessBadge level={getRoleAccess(row, currentRole)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-sky-300/20 bg-[#09172c]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 bg-[#09172c] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.12em] text-white/60">
                  <th className="px-4 py-3 font-semibold">Module</th>
                  <th className={`px-4 py-3 text-center font-semibold ${getRoleColumnClass("admin", currentRole)}`}>
                    Admin
                  </th>
                  <th className={`px-4 py-3 text-center font-semibold ${getRoleColumnClass("buMember", currentRole)}`}>
                    BU Member
                  </th>
                  <th className={`px-4 py-3 text-center font-semibold ${getRoleColumnClass("internalViewer", currentRole)}`}>
                    Internal Viewer
                  </th>
                  <th className="px-4 py-3 font-semibold">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {permissionRows.map((row, index) => (
                  <tr key={row.module} className="group">
                    <td className="border-t border-white/[0.06] px-4 py-4 font-semibold text-white group-hover:bg-white/[0.03]">
                      {row.module}
                    </td>
                    <td className={`border-t border-white/[0.06] px-4 py-4 text-center group-hover:bg-white/[0.03] ${getRoleColumnClass("admin", currentRole, index)}`}>
                      <AccessBadge level={row.admin} />
                    </td>
                    <td className={`border-t border-white/[0.06] px-4 py-4 text-center group-hover:bg-white/[0.03] ${getRoleColumnClass("buMember", currentRole, index)}`}>
                      <AccessBadge level={row.buMember} />
                    </td>
                    <td className={`border-t border-white/[0.06] px-4 py-4 text-center group-hover:bg-white/[0.03] ${getRoleColumnClass("internalViewer", currentRole, index)}`}>
                      <AccessBadge level={row.internalViewer} />
                    </td>
                    <td className="border-t border-white/[0.06] px-4 py-4 text-white/55 group-hover:bg-white/[0.03]">
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAvatarColor(email: string): string {
  if (!email) return "linear-gradient(135deg, #0F6E56, #534AB7)";
  const colors = [
    '#4ade80', '#60a5fa', '#f472b6', '#fb923c',
    '#a78bfa', '#34d399', '#facc15', '#f87171',
  ]
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default function UserAvatar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const profile = session?.user?.profile;
  const displayName = profile?.displayName ?? session?.user?.name ?? "User";
  const email = profile?.email ?? session?.user?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const bgColor = getAvatarColor(email);
  const appRole = profile?.appRole;

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
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/20"
        style={{
          background: bgColor.startsWith('linear') ? bgColor : undefined,
          backgroundColor: !bgColor.startsWith('linear') ? bgColor : undefined,
        }}
        aria-label="User menu"
      >
        {/* Fallback initials */}
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {initials}
        </span>
        
        {/* Microsoft Profile Photo */}
        {!imgError && session ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/api/me/photo"
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover z-10"
            onError={() => setImgError(true)}
          />
        ) : null}
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
            onClick={() => {
              setOpen(false);
              setAccessModalOpen(true);
            }}
            className="glass-ghost mb-2 w-full px-3 py-2 text-sm font-medium flex items-center gap-2"
            type="button"
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
              aria-hidden="true"
            >
              <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            สิทธิ์การเข้าถึง
          </button>

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

      {accessModalOpen && (
        <AccessPermissionsModal
          currentRole={appRole}
          onClose={() => setAccessModalOpen(false)}
        />
      )}
    </div>
  );
}
