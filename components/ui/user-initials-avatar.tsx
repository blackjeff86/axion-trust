type UserInitialsAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses: Record<NonNullable<UserInitialsAvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

function getInitials(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function UserInitialsAvatar({ name, size = "md", className = "" }: UserInitialsAvatarProps) {
  return (
    <div
      aria-label={`Avatar de ${name}`}
      className={`flex ${sizeClasses[size]} items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-primary-container to-primary font-bold tracking-wide text-on-primary-container shadow-[0_10px_24px_rgba(15,23,35,0.18)] ring-1 ring-white/5 ${className}`.trim()}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
