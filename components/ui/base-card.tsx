import { ReactNode } from "react";

type BaseCardProps = {
  children: ReactNode;
  className?: string;
};

export function BaseCard({ children, className }: BaseCardProps) {
  return (
    <article
      className={`rounded-2xl border border-white/10 bg-surface-container-low p-6 shadow-panel ${className ?? ""}`.trim()}
    >
      {children}
    </article>
  );
}
