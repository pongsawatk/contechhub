import type { HintItem } from '@/types/calculator'

interface HintBannerProps {
  hint: HintItem
  onAction?: (hint: HintItem) => void
}

export default function HintBanner({ hint, onAction }: HintBannerProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
      style={{
        background: 'rgba(15, 110, 86, 0.12)',
        border: '1px solid rgba(15, 110, 86, 0.35)',
      }}
    >
      <span className="text-base mt-0.5 flex-shrink-0">🎁</span>
      <div className="flex-1 min-w-0">
        <p className="text-white/85 leading-relaxed">{hint.message}</p>
        {hint.action && onAction && (
          <button
            onClick={() => onAction(hint)}
            className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{
              background: 'rgba(15, 110, 86, 0.3)',
              border: '1px solid rgba(15, 110, 86, 0.5)',
              color: '#6ee7b7',
            }}
          >
            {hint.action} →
          </button>
        )}
      </div>
    </div>
  )
}
