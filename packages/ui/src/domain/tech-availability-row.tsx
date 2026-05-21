import * as React from "react";
import { cn } from "../lib/utils";
import { Pill } from "../components/pill";
import { StatusDot } from "../components/status-dot";
import { UserAvatar } from "../components/avatar";
import type { TechAvailabilityStatus, TechType } from "@commfit/shared-types";

export interface TechAvailabilityData {
  id: string;
  name: string;
  techType: TechType;
  region: string;
  availabilityStatus: TechAvailabilityStatus;
  currentJobRef?: string;
}

interface TechAvailabilityRowProps {
  tech: TechAvailabilityData;
  onClick?: (id: string) => void;
  className?: string;
}

const statusDotColor: Record<TechAvailabilityStatus, "success" | "warning" | "default"> = {
  available: "success",
  busy: "warning",
  offline: "default",
};

const statusLabel: Record<TechAvailabilityStatus, string> = {
  available: "Available",
  busy: "Busy",
  offline: "Offline",
};

function TechAvailabilityRow({ tech, onClick, className }: TechAvailabilityRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2 px-3 rounded hover:bg-bg/50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={() => onClick?.(tech.id)}
    >
      <UserAvatar name={tech.name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-text-primary truncate flex-1 min-w-0">{tech.name}</p>
          <Pill color={tech.techType === "in_house" ? "primary" : "default"} className="shrink-0">
            {tech.techType === "in_house" ? "In-House" : "3rd Party"}
          </Pill>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-text-muted truncate flex-1 min-w-0">{tech.region}</p>
          <div className="flex items-center gap-1 shrink-0">
            <StatusDot color={statusDotColor[tech.availabilityStatus]} pulse={tech.availabilityStatus === "busy"} />
            <span className="text-xs text-text-secondary">{statusLabel[tech.availabilityStatus]}</span>
          </div>
        </div>
      </div>
      {tech.currentJobRef && (
        <span className="text-xs text-text-muted hidden lg:block truncate max-w-[100px]">
          {tech.currentJobRef}
        </span>
      )}
    </div>
  );
}

export { TechAvailabilityRow };
