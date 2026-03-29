import type { Callout, WorkstreamData } from "@/lib/playbook-data"

interface PlaybookWorkstreamProps {
  workstream: WorkstreamData
}

const CALLOUT_STYLES: Record<Callout["type"], string> = {
  danger: "border-l-[3px] border-red-500 bg-red-500/10",
  warning: "border-l-[3px] border-amber-500 bg-amber-500/10",
  info: "border-l-[3px] border-blue-500 bg-blue-500/10",
  success: "border-l-[3px] border-green-500 bg-green-500/10",
  tip: "border-l-[3px] border-teal-500 bg-teal-500/10",
}

function renderRichText(value: string) {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

  return escaped
    .replace(/&lt;strong&gt;/g, '<strong class="font-semibold text-white">')
    .replace(/&lt;\/strong&gt;/g, "</strong>")
}

export default function PlaybookWorkstream({ workstream }: PlaybookWorkstreamProps) {
  return (
    <div className="space-y-5">
      <section className="glass-card p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-3xl">
            {workstream.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-semibold text-white">{workstream.title}</h2>
            <p className="mt-2 text-sm text-white/55">{workstream.subtitle}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {workstream.owners.map((owner) => (
            <span
              key={owner}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65"
            >
              {owner}
            </span>
          ))}
        </div>
      </section>

      {workstream.sections.map((section) => (
        <section key={section.title} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white">{section.title}</h3>

          {section.steps && section.steps.length > 0 && (
            <div className="mt-4 space-y-3">
              {section.steps.map((step, index) => (
                <div
                  key={`${section.title}-step-${index + 1}`}
                  className="glass-card flex gap-4 p-4"
                >
                  <div className="pt-0.5 font-mono text-xs tabular-nums text-white/30">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div
                    className="text-sm leading-7 text-white/80"
                    dangerouslySetInnerHTML={{ __html: renderRichText(step.label) }}
                  />
                </div>
              ))}
            </div>
          )}

          {section.callouts && section.callouts.length > 0 && (
            <div className="mt-4 space-y-3">
              {section.callouts.map((callout) => (
                <div
                  key={`${section.title}-${callout.title}`}
                  className={`rounded-2xl p-4 ${CALLOUT_STYLES[callout.type]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl leading-none">{callout.icon}</div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-white/90">{callout.title}</h4>
                      <div
                        className="mt-2 text-sm leading-7 text-white/65"
                        dangerouslySetInnerHTML={{ __html: renderRichText(callout.body) }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
