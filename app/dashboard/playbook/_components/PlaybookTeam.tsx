import type { TeamMember } from "@/lib/playbook-data"

interface PlaybookTeamProps {
  members: TeamMember[]
}

const ENGINE_STYLES: Record<TeamMember["engine"], { border: string; badge: string; label: string }> = {
  lead: {
    border: "border-t-2 border-orange-500",
    badge: "border-orange-500/30 bg-orange-500/15 text-orange-300",
    label: "Lead",
  },
  hunter: {
    border: "border-t-2 border-blue-500",
    badge: "border-blue-500/30 bg-blue-500/15 text-blue-300",
    label: "Hunter",
  },
  farmer: {
    border: "border-t-2 border-green-500",
    badge: "border-green-500/30 bg-green-500/15 text-green-300",
    label: "Farmer",
  },
  innovation: {
    border: "border-t-2 border-purple-500",
    badge: "border-purple-500/30 bg-purple-500/15 text-purple-300",
    label: "Innovation",
  },
}

export default function PlaybookTeam({ members }: PlaybookTeamProps) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-white">ทีมงาน</h2>
        <p className="mt-2 text-sm text-white/50">
          ภาพรวมหน้าที่หลักและสิ่งที่แต่ละคนต้องขับเคลื่อนในไตรมาสนี้
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => {
          const engineStyle = ENGINE_STYLES[member.engine]

          return (
            <article key={member.name} className={`glass-card p-5 ${engineStyle.border}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                  <p className="mt-1 text-sm text-white/55">{member.role}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${engineStyle.badge}`}
                >
                  {engineStyle.label}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-white/65">{member.action}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
