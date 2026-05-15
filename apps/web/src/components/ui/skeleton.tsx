export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-white/8 bg-white/[0.04] p-3"
        >
          <div className="aspect-square animate-pulse rounded-md bg-white/10" />
          <div className="mt-3 h-4 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}
