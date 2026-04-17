type SecurePageHeaderProps = {
  title: string;
  subtitle: string;
};

export function SecurePageHeader({ title, subtitle }: SecurePageHeaderProps) {
  return (
    <div>
      <h2 className="mb-2 font-headline text-3xl font-extrabold uppercase tracking-tight text-white">{title}</h2>
      <p className="max-w-2xl font-body text-on-surface-variant">{subtitle}</p>
    </div>
  );
}
