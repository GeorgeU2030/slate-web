export function TitleGridSkeleton({ count = 6 }: { count?: number }) {
    return (
      <div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        role="status"
        aria-busy="true"
        aria-label="Loading titles"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-2/3 w-full rounded-2xl bg-paper-dim" />
            <div className="skeleton mt-2.5 h-3.5 w-3/4 rounded bg-paper-dim" />
            <div className="skeleton mt-1.5 h-3 w-1/2 rounded bg-paper-dim" />
          </div>
        ))}
      </div>
    )
  }