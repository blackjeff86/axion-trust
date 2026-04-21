import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  suffix?: ReactNode;
  trailing?: ReactNode;
  valueClassName?: string;
  className?: string;
};

export function MetricCard({
  label,
  value,
  suffix,
  trailing,
  valueClassName,
  className,
}: MetricCardProps) {
  return (
    <article
      className={`rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel ${className ?? ""}`.trim()}
    >
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
      <div className="flex items-end justify-between gap-4">
        <h3 className={`text-3xl font-extrabold text-white ${valueClassName ?? ""}`.trim()}>
          {value}
          {suffix ? <span className="text-sm font-normal text-on-surface-variant">{suffix}</span> : null}
        </h3>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </article>
  );
}
