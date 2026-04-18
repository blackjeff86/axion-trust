type SecurePageHeaderProps = {
  title: string;
  subtitle: string;
};

export function SecurePageHeader({ title, subtitle }: SecurePageHeaderProps) {
  return (
    <div className="max-w-3xl">
      <h2 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-white">{title}</h2>
      <p className="max-w-2xl text-[15px] font-medium leading-7 text-on-surface-variant">{subtitle}</p>
    </div>
  );
}
