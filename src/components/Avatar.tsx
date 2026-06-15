// Shared avatar/initials component — reused in Header, SenderSelector, etc.
import React from "react";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };

export function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = "md", className = "" }) => (
  <div
    className={`rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold shrink-0 ${SIZE[size]} ${className}`}
  >
    {getInitials(name)}
  </div>
);
