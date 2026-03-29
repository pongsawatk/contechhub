import type { Ritual } from "@/lib/playbook-data"

interface PlaybookRitualsProps {
  rituals: Ritual[]
  weeklyAgenda: string[]
}

export default function PlaybookRituals({ rituals, weeklyAgenda }: PlaybookRitualsProps) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-white">ตารางประชุมและจังหวะการทำงาน</h2>
        <p className="mt-2 text-sm text-white/50">
          รอบประชุมหลักของทีม พร้อม agenda สำหรับวงทบทวนรายสัปดาห์
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-white/5">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-white/40">
                <th className="px-4 py-3">Ritual</th>
                <th className="px-4 py-3">ชื่อไทย</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Participants</th>
                <th className="px-4 py-3">Goal</th>
              </tr>
            </thead>
            <tbody>
              {rituals.map((ritual) => (
                <tr key={ritual.name} className="border-t border-white/5 text-sm text-white/70 hover:bg-white/5">
                  <td className="px-4 py-4 font-medium text-white/85">{ritual.name}</td>
                  <td className="px-4 py-4">{ritual.nameTH}</td>
                  <td className="px-4 py-4 font-mono text-xs text-green-400">{ritual.frequency}</td>
                  <td className="px-4 py-4">{ritual.participants}</td>
                  <td className="px-4 py-4">{ritual.goal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-lg font-semibold text-white">Weekly Pipeline Review Agenda</h3>
        <div className="mt-4 space-y-3">
          {weeklyAgenda.map((item, index) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs font-mono tabular-nums text-white/30">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-2 text-sm leading-7 text-white/70">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
