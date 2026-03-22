'use client'

export default function PricingCardPanel() {
  return (
    <div className="glass-card flex h-full flex-col p-5">
      <p className="mb-3 text-sm font-medium text-white/70">Pricing View</p>
      <p className="mb-4 text-xs text-white/40">
        Recommended pricing references appear in the chat area, and this panel keeps a quick path
        to the full pricing browser.
      </p>
      <a
        href="/dashboard/pricing"
        className="mt-auto rounded-xl border border-white/15 px-4 py-2.5 text-center text-sm text-white/60 transition-all hover:bg-white/5"
      >
        Open pricing catalog
      </a>
    </div>
  )
}
