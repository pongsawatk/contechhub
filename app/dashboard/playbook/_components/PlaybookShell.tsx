"use client"

import { useEffect, useMemo, useState } from "react"
import PlaybookOverview from "./PlaybookOverview"
import PlaybookWorkstream from "./PlaybookWorkstream"
import PlaybookTeam from "./PlaybookTeam"
import PlaybookMessages from "./PlaybookMessages"
import PlaybookRituals from "./PlaybookRituals"
import type { PlaybookQuarter, QuarterKey } from "@/lib/playbook-data"
import { QUARTER_ORDER } from "@/lib/playbook-data"

interface PlaybookShellProps {
  quarters: Record<QuarterKey, PlaybookQuarter>
  defaultQuarter: QuarterKey
}

type StaticSectionKey = "team" | "messages" | "rituals"
type SectionKey = string

function getDefaultSection(quarter: PlaybookQuarter): SectionKey {
  return quarter.workstreams[0]?.id ?? "team"
}

function getDotClass(id: string) {
  if (id === "ws1" || id === "ws2") return "bg-blue-400"
  if (id === "ws3" || id === "ws4" || id === "ws5" || id === "ws6") return "bg-green-400"
  if (id === "ws7") return "bg-amber-400"
  if (id === "ws8") return "bg-purple-400"
  return "bg-white/40"
}

function getSectionLabel(key: StaticSectionKey) {
  if (key === "team") return "ทีมงาน"
  if (key === "messages") return "Key Messages"
  return "ตารางประชุม"
}

export default function PlaybookShell({ quarters, defaultQuarter }: PlaybookShellProps) {
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterKey>(defaultQuarter)
  const [selectedSection, setSelectedSection] = useState<SectionKey>(() =>
    getDefaultSection(quarters[defaultQuarter])
  )

  const quarter = quarters[selectedQuarter]
  const hasWorkstreams = quarter.workstreams.length > 0

  useEffect(() => {
    setSelectedSection(getDefaultSection(quarter))
  }, [quarter])

  const salesItems = useMemo(
    () => quarter.workstreams.filter((workstream) => workstream.id === "ws1" || workstream.id === "ws2"),
    [quarter]
  )

  const deliveryItems = useMemo(
    () =>
      quarter.workstreams.filter((workstream) =>
        ["ws3", "ws4", "ws5", "ws6"].includes(workstream.id)
      ),
    [quarter]
  )

  const growthItems = useMemo(
    () => quarter.workstreams.filter((workstream) => workstream.id === "ws7" || workstream.id === "ws8"),
    [quarter]
  )

  const selectedWorkstream = quarter.workstreams.find((workstream) => workstream.id === selectedSection)

  return (
    <div className="space-y-6">
      <section className="glass-card px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/35">Quarterly Operational Playbook</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">BU Playbook</h1>
            <p className="mt-2 text-sm text-white/50">
              คู่มือปฏิบัติการรายไตรมาสสำหรับทีม Contech BU เพื่อทบทวนเป้าหมาย กระบวนการ และเจ้าของงาน
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUARTER_ORDER.map((quarterKey) => {
              const quarterData = quarters[quarterKey]
              const isSelected = selectedQuarter === quarterKey
              const isEmpty = quarterData.workstreams.length === 0

              return (
                <button
                  key={quarterKey}
                  type="button"
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border border-green-500/30 bg-green-500/20 text-green-400"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  } ${isEmpty ? "opacity-40" : ""}`}
                  onClick={() => setSelectedQuarter(quarterKey)}
                >
                  {quarterKey}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <PlaybookOverview overview={quarter.overview} />

      {!hasWorkstreams ? (
        <section className="glass-card flex min-h-[280px] items-center justify-center p-8 text-center">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-white/35">{selectedQuarter}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">รายละเอียดจะเพิ่มใน Quarter นี้</h2>
            <p className="mt-3 text-sm leading-7 text-white/55">
              ตอนนี้เปิดให้ดูภาพรวมเป้าหมายของ {selectedQuarter} ก่อน เมื่อเริ่มไตรมาสนี้แล้วจะเติม workstreams,
              บทบาททีม, และ cadence การทำงานเพิ่มในหน้านี้
            </p>
          </div>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[220px,minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass-card p-4">
              <div className="space-y-5">
                <div>
                  <p className="px-2 text-xs uppercase tracking-[0.2em] text-white/35">Sales</p>
                  <div className="mt-2 space-y-1">
                    {salesItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                          selectedSection === item.id
                            ? "bg-white/10 font-semibold text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white/80"
                        }`}
                        onClick={() => setSelectedSection(item.id)}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${getDotClass(item.id)}`} />
                        <span className="truncate">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="px-2 text-xs uppercase tracking-[0.2em] text-white/35">Delivery</p>
                  <div className="mt-2 space-y-1">
                    {deliveryItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                          selectedSection === item.id
                            ? "bg-white/10 font-semibold text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white/80"
                        }`}
                        onClick={() => setSelectedSection(item.id)}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${getDotClass(item.id)}`} />
                        <span className="truncate">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="px-2 text-xs uppercase tracking-[0.2em] text-white/35">Growth</p>
                  <div className="mt-2 space-y-1">
                    {growthItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                          selectedSection === item.id
                            ? "bg-white/10 font-semibold text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white/80"
                        }`}
                        onClick={() => setSelectedSection(item.id)}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${getDotClass(item.id)}`} />
                        <span className="truncate">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="px-2 text-xs uppercase tracking-[0.2em] text-white/35">Team</p>
                  <div className="mt-2 space-y-1">
                    {(["team", "messages", "rituals"] as StaticSectionKey[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                          selectedSection === key
                            ? "bg-white/10 font-semibold text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white/80"
                        }`}
                        onClick={() => setSelectedSection(key)}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${getDotClass(key)}`} />
                        <span className="truncate">{getSectionLabel(key)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div
            key={`${selectedQuarter}-${selectedSection}`}
            className="transition-opacity duration-200"
          >
            {selectedWorkstream ? (
              <PlaybookWorkstream workstream={selectedWorkstream} />
            ) : selectedSection === "team" ? (
              <PlaybookTeam members={quarter.team} />
            ) : selectedSection === "messages" ? (
              <PlaybookMessages messages={quarter.keyMessages} />
            ) : (
              <PlaybookRituals
                rituals={quarter.rituals}
                weeklyAgenda={quarter.weeklyAgenda}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
