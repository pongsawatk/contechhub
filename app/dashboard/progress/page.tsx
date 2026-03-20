import GlassCard from "@/components/GlassCard";

export default function ProgressPage() {
  // Mock data for placeholder
  const projects = [
    { name: "Website Redesign", progress: 75, status: "Active", color: "text-blue-400", emoji: "🌐" },
    { name: "Mobile App API", progress: 40, status: "In Progress", color: "text-amber-400", emoji: "📱" },
    { name: "Data Migration", progress: 100, status: "Completed", color: "text-green-400", emoji: "📦" },
    { name: "Security Audit", progress: 15, status: "Delayed", color: "text-rose-400", emoji: "🔒" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Project Progress</h1>
        <p className="text-blue-200/60 mt-2">ภาพรวมความคืบหน้าของโครงการและสถานะการดำเนินงาน</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 flex items-center space-x-4">
          <div className="text-2xl p-2 bg-blue-500/10 rounded-xl">📚</div>
          <div>
            <p className="text-sm text-blue-200/60">Total Tasks</p>
            <p className="text-2xl font-bold text-white">124</p>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6 flex items-center space-x-4">
          <div className="text-2xl p-2 bg-green-500/10 rounded-xl">✅</div>
          <div>
            <p className="text-sm text-blue-200/60">Completed</p>
            <p className="text-2xl font-bold text-white">82</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center space-x-4">
          <div className="text-2xl p-2 bg-amber-500/10 rounded-xl">⏳</div>
          <div>
            <p className="text-sm text-blue-200/60">In Progress</p>
            <p className="text-2xl font-bold text-white">36</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center space-x-4">
          <div className="text-2xl p-2 bg-rose-500/10 rounded-xl">⚠️</div>
          <div>
            <p className="text-sm text-blue-200/60">Blocked</p>
            <p className="text-2xl font-bold text-white">6</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            📊 Active Projects Status
          </h2>
          <span className="text-xs font-medium px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full">
            Updated just now
          </span>
        </div>

        <div className="space-y-8">
          {projects.map((project, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{project.emoji}</span>
                  <div>
                    <h3 className="text-white font-medium">{project.name}</h3>
                    <span className={`text-xs ${project.color}`}>{project.status}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-white">{project.progress}%</span>
              </div>
              <div className="h-2 w-full bg-blue-900/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            ✨ Performance Insights
          </h3>
          <p className="text-blue-100/70 text-sm leading-relaxed">
            ระบบกำลังรวบรวมข้อมูลประสิทธิภาพการทำงานรายสัปดาห์ คุณจะเห็นการวิเคราะห์แนวโน้ม (Trend Analysis) 
            และจุดคอขวดของกระบวนการหลังจากเริ่มดึงข้อมูลจริงจาก Notion
          </p>
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10 italic text-xs text-blue-200/40 text-center">
            Placeholder for future AI-driven insights
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-blue-600/5">
          <h3 className="text-lg font-semibold text-white mb-2">Next Steps</h3>
          <ul className="space-y-3 mt-4">
            <li className="flex items-start gap-3 text-sm text-blue-100/70">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] mt-0.5">1</div>
              Connect to Notion "Projects" and "Tasks" databases
            </li>
            <li className="flex items-start gap-3 text-sm text-blue-100/70">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] mt-0.5">2</div>
              Implement real-time progress calculations
            </li>
            <li className="flex items-start gap-3 text-sm text-blue-100/70">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] mt-0.5">3</div>
              Add interactive timeline and gantt view
            </li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
