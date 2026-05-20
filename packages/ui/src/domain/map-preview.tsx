import * as React from "react";
import { MapPin } from "lucide-react";
import { cn } from "../lib/utils";

export interface MapPin {
  id: string;
  x: number; // 0–100 percentage
  y: number; // 0–100 percentage
  color?: "accent" | "success" | "warning" | "info" | "danger";
  label?: string;
}

interface MapPreviewProps {
  pins?: MapPin[];
  className?: string;
  label?: string;
}

const PIN_COLORS = {
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
  danger: "text-danger",
};

const DEFAULT_PINS: MapPin[] = [
  { id: "1", x: 22, y: 35, color: "success", label: "Watters Creek" },
  { id: "2", x: 55, y: 28, color: "accent", label: "Marriott Plano" },
  { id: "3", x: 68, y: 60, color: "warning", label: "Plano ISD" },
  { id: "4", x: 38, y: 72, color: "info", label: "Hilton Allen" },
  { id: "5", x: 80, y: 42, color: "success", label: "Legacy West" },
];

function MapPreview({ pins = DEFAULT_PINS, className, label }: MapPreviewProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md",
        className
      )}
      style={{
        background: "linear-gradient(135deg, #16314D 0%, #2A5780 40%, #C3551A 100%)",
      }}
      aria-label={label ?? "Map preview — jobs across DFW"}
    >
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Label */}
      <div className="absolute top-2 left-2 text-xs font-medium text-white/70 bg-primary/40 rounded px-1.5 py-0.5 backdrop-blur-sm">
        {label ?? "DFW Region"}
      </div>

      {/* Job pins */}
      {pins.map((pin) => (
        <div
          key={pin.id}
          className="absolute group"
          style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -50%)" }}
        >
          {/* Pulse ring */}
          <span
            className={cn(
              "absolute inline-flex h-5 w-5 rounded-full opacity-30 animate-ping",
              pin.color === "accent" ? "bg-accent" :
              pin.color === "success" ? "bg-success" :
              pin.color === "warning" ? "bg-warning" :
              pin.color === "info" ? "bg-info" :
              pin.color === "danger" ? "bg-danger" : "bg-white"
            )}
            style={{ top: "-2px", left: "-2px" }}
          />
          <div
            className={cn(
              "relative flex h-4 w-4 items-center justify-center rounded-full shadow-md",
              pin.color === "accent" ? "bg-accent" :
              pin.color === "success" ? "bg-success" :
              pin.color === "warning" ? "bg-warning" :
              pin.color === "info" ? "bg-info" :
              pin.color === "danger" ? "bg-danger" : "bg-white"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
          {/* Tooltip */}
          {pin.label && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
              <span className="whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-xs text-white shadow">
                {pin.label}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export { MapPreview };
