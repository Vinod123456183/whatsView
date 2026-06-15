// Shared icon wrapper — keeps icon usage consistent across the app
import React from "react";
import { IconType } from "react-icons";

interface IconProps {
  icon: IconType;
  size?: number;
  className?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ icon: I, size = 20, className = "", color }) => (
  <I size={size} className={className} color={color} />
);
