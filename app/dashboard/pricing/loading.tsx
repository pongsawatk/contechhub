function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />;
}

export default function PricingLoading() {
  return (
    <div>
      <div className="mb-8">
        <SkeletonBlock className="h-4 w-44 mb-4" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <SkeletonBlock className="h-14 w-40" />
            <div className="space-y-3">
              <SkeletonBlock className="h-8 w-56" />
              <SkeletonBlock className="h-4 w-72" />
            </div>
          </div>
          <SkeletonBlock className="h-4 w-52" />
        </div>
      </div>

      <div
        className="sticky top-[64px] z-40 -mx-4 sm:-mx-6 mb-8 px-4 sm:px-6 py-2"
        style={{
          background: "rgba(10,22,40,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex gap-2 overflow-x-auto">
          <SkeletonBlock className="h-10 w-28 flex-shrink-0" />
          <SkeletonBlock className="h-10 w-28 flex-shrink-0" />
          <SkeletonBlock className="h-10 w-28 flex-shrink-0" />
          <SkeletonBlock className="h-10 w-32 flex-shrink-0" />
          <SkeletonBlock className="h-10 w-36 flex-shrink-0" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl p-5"
            style={{
              background: "rgba(10, 30, 70, 0.45)",
              border: "1px solid rgba(100, 220, 255, 0.12)",
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <SkeletonBlock className="h-6 w-40" />
                <SkeletonBlock className="h-5 w-16" />
              </div>
              <SkeletonBlock className="h-4 w-56" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-5/6" />
              <div className="pt-3">
                <SkeletonBlock className="h-11 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
