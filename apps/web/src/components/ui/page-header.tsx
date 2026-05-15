export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      {eyebrow && (
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">
          {eyebrow}
        </p>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="max-w-4xl text-4xl font-black tracking-normal md:text-6xl">
          {title}
        </h1>
        {children}
      </div>
    </header>
  );
}
