import { getUsageStats } from "@/lib/usage-stats";
import GlassCard from "@/components/GlassCard";

export default async function UsagePage() {
  const stats = await getUsageStats();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Usage Statistics</h1>
        <p className="text-gray-400">ภาพรวมการใช้งานระบบ Contech Hub</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Quotes Created</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{stats.totalQuotes}</span>
            <span className="text-sm text-gray-400">รายการ</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-l-4 border-l-[#38bdf8]">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Value (THB)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#38bdf8]">
              {stats.totalValue.toLocaleString()}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <p className="text-sm font-medium text-gray-400 mb-1">Average Quote Value</p>
          <div className="flex items-baseline gap-2 text-white">
            <span className="text-2xl font-bold">{Math.round(stats.averageValue).toLocaleString()}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <p className="text-sm font-medium text-gray-400 mb-1">Active (Last 7 Days)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-green-400">{stats.recentActivityCount}</span>
            <span className="text-sm text-gray-400">ใหม่</span>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <GlassCard className="p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity Highlights</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                📊
              </div>
              <div>
                <p className="text-white font-medium">Growth Trend</p>
                <p className="text-sm text-gray-400">ระบบมีการสร้าง Quote เพิ่มขึ้น {stats.recentActivityCount} รายการ ในสัปดาห์นี้</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
          <h2 className="text-xl font-semibold text-white mb-4">Admin Insights</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            ข้อมูลชุดนี้ดึงมาจาก database `Quote Sessions` ใน Notion โดยตรงเพื่อใช้ในการวิเคราะห์ประสิทธิภาพของทีมขายและการใช้งานระบบ 
            Contech Hub ในแต่ละ BU
          </p>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-xs text-gray-400 font-mono">
            Source: NOTION_QUOTES_DB_ID
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
