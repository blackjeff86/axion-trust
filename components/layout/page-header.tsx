type PageHeaderProps = {
  title: string;
  subtitle: string;
  badgeIcon?: string;
  badgeLabel?: string;
};

export function PageHeader({
  title,
  subtitle,
  badgeIcon = "verified",
  badgeLabel = "Sistema Seguro",
}: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant sm:text-base">{subtitle}</p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold tracking-wide text-primary">
        <span className="material-symbols-outlined text-base text-primary">{badgeIcon}</span>
        <span>{badgeLabel}</span>
      </div>
    </header>
  );
}
