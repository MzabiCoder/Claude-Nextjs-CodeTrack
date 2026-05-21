import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: number;
  className?: string;
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

export function Avatar({ name, email, image, size = 28, className }: AvatarProps) {
  const initials = getInitials(name, email);

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? email ?? "User"}
        width={size}
        height={size}
        className={cn("rounded-full object-cover shrink-0", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold shrink-0 select-none",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials}
    </div>
  );
}
