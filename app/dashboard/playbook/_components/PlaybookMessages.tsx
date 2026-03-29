"use client"

import { useEffect, useRef, useState } from "react"
import type { KeyMessage } from "@/lib/playbook-data"

interface PlaybookMessagesProps {
  messages: KeyMessage[]
}

type CopyState = "idle" | "success" | "error"

const ACCENT_STYLES: Record<KeyMessage["accentColor"], string> = {
  blue: "border-l-4 border-blue-500",
  green: "border-l-4 border-green-500",
  amber: "border-l-4 border-amber-500",
  purple: "border-l-4 border-purple-500",
  red: "border-l-4 border-red-500",
}

const BUTTON_LABELS: Record<CopyState, string> = {
  idle: "Copy",
  success: "Copied!",
  error: "Copy failed",
}

export default function PlaybookMessages({ messages }: PlaybookMessagesProps) {
  const [copyStates, setCopyStates] = useState<Record<string, CopyState>>({})
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    const timers = timersRef.current

    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer))
    }
  }, [])

  async function handleCopy(segment: string, message: string) {
    if (timersRef.current[segment]) {
      clearTimeout(timersRef.current[segment])
    }

    try {
      await navigator.clipboard.writeText(message)
      setCopyStates((prev) => ({ ...prev, [segment]: "success" }))
    } catch (error) {
      console.error("[PlaybookMessages] Copy failed:", error)
      setCopyStates((prev) => ({ ...prev, [segment]: "error" }))
    }

    timersRef.current[segment] = setTimeout(() => {
      setCopyStates((prev) => ({ ...prev, [segment]: "idle" }))
    }, 2000)
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-white">Key Messages</h2>
        <p className="mt-2 text-sm text-white/50">
          ประโยคหลักที่ทีมสามารถหยิบไปใช้ในการเล่า value ของแต่ละ segment ได้ทันที
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {messages.map((message) => {
          const copyState = copyStates[message.segment] ?? "idle"

          return (
            <article
              key={message.segment}
              className={`glass-card flex flex-col gap-4 p-5 ${ACCENT_STYLES[message.accentColor]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{message.segment}</h3>
                </div>
                <button
                  type="button"
                  className={`glass-ghost rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    copyState === "success"
                      ? "border border-green-500/30 bg-green-500/15 text-green-300"
                      : copyState === "error"
                      ? "border border-red-500/30 bg-red-500/15 text-red-200"
                      : ""
                  }`}
                  onClick={() => void handleCopy(message.segment, message.message)}
                >
                  {BUTTON_LABELS[copyState]}
                </button>
              </div>

              <p className="text-sm leading-7 text-white/75">{message.message}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
