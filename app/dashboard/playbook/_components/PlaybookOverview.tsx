import type { PlaybookOverview as PlaybookOverviewData } from "@/lib/playbook-data"

interface PlaybookOverviewProps {
  overview: PlaybookOverviewData
}

export default function PlaybookOverview({ overview }: PlaybookOverviewProps) {
  const cards = [
    {
      title: "เป้ารายได้",
      value: overview.revenueTarget,
      subtext: overview.revenueBreakdown,
      className: "border-l-4 border-green-500",
      valueClassName: "font-mono tabular-nums text-green-300",
    },
    {
      title: "กลุ่มลูกค้า",
      value: overview.segmentFocus,
      subtext: null,
      className: "border-l-4 border-teal-500",
      valueClassName: "text-white",
    },
    {
      title: "Corp Pipeline",
      value: overview.corpPipeline,
      subtext: null,
      className: "border-l-4 border-blue-500",
      valueClassName: "font-mono tabular-nums text-blue-300",
    },
    {
      title: "โฟกัสกลยุทธ์",
      value: overview.strategicFocus,
      subtext: null,
      className: "border-l-4 border-amber-500",
      valueClassName: "text-white",
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className={`glass-card p-5 ${card.className}`}>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">{card.title}</p>
          <p className={`mt-3 text-lg font-semibold leading-snug ${card.valueClassName}`}>
            {card.value}
          </p>
          {card.subtext && <p className="mt-2 text-sm text-white/50">{card.subtext}</p>}
        </div>
      ))}
    </section>
  )
}
