import * as React from "react";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { Card } from "./card";

export interface KpiProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  icon?: LucideIcon;
  className?: string;
}

function Kpi({ label, value, trend, trendLabel, icon: Icon, className }: KpiProps) {
  const trendConfig = {
    up: { icon: TrendingUp, className: "text-success" },
    down: { icon: TrendingDown, className: "text-danger" },
    flat: { icon: Minus, className: "text-text-muted" },
  };

  const TrendIcon = trend ? trendConfig[trend].icon : null;
  const trendClass = trend ? trendConfig[trend].className : "";

  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {label}
        </span>
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/8">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="font-display text-2xl font-semibold text-text-primary leading-none">
          {value}
        </span>
        {TrendIcon && trendLabel && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", trendClass)}>
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export { Kpi };
