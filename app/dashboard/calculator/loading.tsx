function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />;
}

export default function CalculatorLoading() {
  return (
    <div className="max-w-7xl mx-auto">
      <SkeletonBlock className="h-4 w-40 mb-6" />

      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0">
          <div className="mb-6 space-y-3">
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="h-4 w-80" />
          </div>

          <div className="flex gap-2 mb-7 overflow-x-auto pb-1">
            <SkeletonBlock className="h-10 w-32 flex-shrink-0" />
            <SkeletonBlock className="h-10 w-32 flex-shrink-0" />
            <SkeletonBlock className="h-10 w-32 flex-shrink-0" />
            <SkeletonBlock className="h-10 w-28 flex-shrink-0" />
          </div>

          <div
            className="rounded-2xl p-6 mb-5 space-y-4"
            style={{
              background: "rgba(10, 30, 70, 0.45)",
              border: "1px solid rgba(100, 220, 255, 0.15)",
            }}
          >
            <SkeletonBlock className="h-6 w-40" />
            <SkeletonBlock className="h-4 w-64" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-24 w-full" />
          </div>

          <div className="flex justify-between">
            <SkeletonBlock className="h-11 w-28" />
            <SkeletonBlock className="h-11 w-32" />
          </div>
        </div>

        <div className="w-96 flex-shrink-0 space-y-4 hidden lg:block">
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: "rgba(10, 30, 70, 0.55)",
              border: "1px solid rgba(100, 220, 255, 0.18)",
            }}
          >
            <SkeletonBlock className="h-6 w-36" />
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-16 w-full" />
          </div>

          <div className="space-y-2.5">
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-11 w-full" />
            <SkeletonBlock className="h-11 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
