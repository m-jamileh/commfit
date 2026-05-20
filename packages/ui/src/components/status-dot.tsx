import * as React from "react";
import { cn } from "../lib/utils";

type StatusColor = "default" | "primary" | "accent" | "success" | "warning" | "danger" | "info";

interface StatusDotProps {
  color?: StatusColor;
  label?: string;
  pulse?: boolean;
  className?: string;
}

const colorMap: Record<StatusColor, string> = {
  default: "bg-text-muted",
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

function StatusDot({ color = "default", label, pulse = false, className }: StatusDotProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              colorMap[color]
            )}
          />
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", colorMap[color])} />
      </span>
      {label && <span className="text-xs text-text-secondary">{label}</span>}
    </div>
  );
}

export { StatusDot };
