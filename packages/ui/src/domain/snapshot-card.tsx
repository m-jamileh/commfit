"use client";
import * as React from "react";
import { cn } from "../lib/utils";
import { Card } from "../components/card";

// Health Bar variant
interface HealthBarData {
  excellent: number; // count
  good: number;
  fair: number;
  poor: number;
}

interface HealthBarCardProps {
  data: HealthBarData;
  label?: string;
  className?: string;
}

function HealthBarCard({ data, label = "Equipment Health", className }: HealthBarCardProps) {
  const total = data.excellent + data.good + data.fair + data.poor;
  if (total === 0) return null;

  const segments = [
    { label: "Excellent", count: data.excellent, className: "bg-success" },
    { label: "Good", count: data.good, className: "bg-info" },
    { label: "Fair", count: data.fair, className: "bg-warning" },
    { label: "Poor", count: data.poor, className: "bg-danger" },
  ];

  return (
    <Card className={className}>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
        {label}
      </p>
      <div className="flex h-3 w-full rounded-full overflow-hidden gap-0.5">
        {segments.map((seg) =>
          seg.count > 0 ? (
            <div
              key={seg.label}
              className={cn("h-full rounded-full", seg.className)}
              style={{ width: `${(seg.count / total) * 100}%` }}
              title={`${seg.label}: ${seg.count}`}
            />
          ) : null
        )}
      </div>
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {segments.map((seg) =>
          seg.count > 0 ? (
            <div key={seg.label} className="flex items-center gap-1">
              <span className={cn("h-2 w-2 rounded-full", seg.className)} />
              <span className="text-xs text-text-secondary">{seg.count} {seg.label}</span>
            </div>
          ) : null
        )}
      </div>
    </Card>
  );
}

// Cycle Dots variant
interface CycleDotsCardProps {
  total: number;
  completed: number;
  label?: string;
  className?: string;
}

function CycleDotsCard({ total, completed, label = "PM Cycle", className }: CycleDotsCardProps) {
  return (
    <Card className={className}>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
        {label}
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-3 w-3 rounded-full border-2",
              i < completed
                ? "bg-success border-success"
                : "bg-transparent border-border"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-text-secondary mt-2">
        {completed} / {total} visits completed this cycle
      </p>
    </Card>
  );
}

// Spend Chart variant
interface SpendDataPoint {
  month: string; // "Jan", "Feb", etc.
  amount: number; // dollars
}

interface SpendChartCardProps {
  data: SpendDataPoint[];
  label?: string;
  className?: string;
}

function SpendChartCard({ data, label = "12-Month Spend", className }: SpendChartCardProps) {
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <Card className={className}>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
        {label}
      </p>
      <div className="flex items-end gap-1 h-20">
        {data.map((d, i) => {
          const height = Math.max((d.amount / max) * 100, 2);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
              <div
                className="w-full rounded-t bg-primary/20 group-hover:bg-accent/60 transition-colors relative"
                style={{ height: `${height}%` }}
                title={`${d.month}: $${d.amount.toLocaleString()}`}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t bg-primary/60 group-hover:bg-accent transition-colors"
                  style={{ height: "40%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-text-muted">{data[0]?.month}</span>
        <span className="text-xs text-text-muted">{data[data.length - 1]?.month}</span>
      </div>
      <p className="text-xs text-text-secondary mt-1">
        Total: $
        {data.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
      </p>
    </Card>
  );
}

export { HealthBarCard, CycleDotsCard, SpendChartCard };
