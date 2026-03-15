interface WarningBannerProps {
  message: string
}

export default function WarningBanner({ message }: WarningBannerProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
      style={{
        background: 'rgba(234, 88, 12, 0.12)',
        border: '1px solid rgba(234, 88, 12, 0.4)',
      }}
    >
      <span className="text-base mt-0.5 flex-shrink-0">⚠️</span>
      <p className="text-orange-200 leading-relaxed">{message}</p>
    </div>
  )
}
