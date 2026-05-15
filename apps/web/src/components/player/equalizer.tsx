export function Equalizer() {
  return (
    <span className="flex h-5 items-end gap-1" aria-hidden="true">
      {[0, 0.15, 0.3].map((delay) => (
        <span
          key={delay}
          className="h-5 w-1 origin-bottom animate-equalizer rounded-full bg-primary"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}
