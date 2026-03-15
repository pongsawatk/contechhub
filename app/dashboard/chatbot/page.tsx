"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ChatbotPage() {
  const router = useRouter();

  return (
    <div>
      {/* Breadcrumb */}
      <p className="text-muted text-[13px] mb-6">
        <Link href="/dashboard" className="hover:text-white transition-colors">Contech Hub</Link>
        <span className="mx-1.5">›</span>
        <span>Chatbot</span>
      </p>

      {/* Placeholder card */}
      <div className="flex justify-center">
        <div className="glass p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4 opacity-20">💬</div>
          <h2 className="text-[22px] font-bold text-white mb-2">Chatbot</h2>
          <p className="text-secondary text-sm mb-6">
            กำลังพัฒนา — มาเร็วๆ นี้
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="glass-ghost px-6 py-2.5 text-sm font-medium"
          >
            กลับ Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
