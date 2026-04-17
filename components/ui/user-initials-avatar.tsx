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
      className={`flex ${sizeClasses[size]} items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container-high font-bold text-primary ${className}`.trim()}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
