"use client"

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass p-10 w-full max-w-sm text-center">
        {/* Logo */}
        <h1 className="text-[32px] font-bold mb-1">
          <span className="text-white">Contech</span>
          <span className="text-[#4ade80]">Hub</span>
        </h1>

        {/* Subtitle */}
        <p className="text-secondary text-sm mb-8">
          Internal Platform — Builk One Group
        </p>

        {/* Microsoft Login Button */}
        <button
          onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
          className="glass-btn w-full h-12 flex items-center justify-center gap-3 text-sm font-medium"
        >
          {/* Microsoft SVG Logo */}
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          เข้าสู่ระบบด้วย Microsoft
        </button>

        {/* Note */}
        <p className="text-muted text-xs mt-4">
          เฉพาะบัญชี @builk.com เท่านั้น
        </p>
      </div>
    </div>
  )
}
