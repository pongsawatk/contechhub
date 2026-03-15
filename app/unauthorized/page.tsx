"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass p-10 w-full max-w-sm text-center">
        {/* Shield Icon */}
        <div className="mb-6 flex justify-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-white mb-2">
          ไม่มีสิทธิ์เข้าถึง
        </h1>

        {/* Description */}
        <p className="text-secondary text-sm mb-8">
          กรุณาติดต่อทีม Contech BU เพื่อขอสิทธิ์
        </p>

        {/* Back to Login */}
        <button
          onClick={() => router.push("/login")}
          className="glass-ghost px-6 py-2.5 text-sm font-medium"
        >
          กลับหน้า Login
        </button>
      </div>
    </div>
  );
}
