"use client";
import * as React from "react";
import { cn } from "../lib/utils";
import { VisitCard, type VisitCardData } from "./visit-card";

interface VisitTimelineProps {
  visits: VisitCardData[];
  className?: string;
}

function VisitTimeline({ visits, className }: VisitTimelineProps) {
  const sorted = [...visits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const [featured, ...older] = sorted;

  if (visits.length === 0) {
    return (
      <div className={cn("py-8 text-center text-sm text-text-muted", className)}>
        No service visits recorded.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {featured && (
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
            Most Recent
          </p>
          <VisitCard visit={featured} />
        </div>
      )}

      {older.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
            Previous Visits
          </p>
          <div className="relative border-l-2 border-border ml-2 space-y-0">
            {older.map((visit, i) => (
              <div key={visit.id} className="relative pl-5">
                <span className="absolute -left-[5px] top-3 h-2.5 w-2.5 rounded-full border-2 border-border bg-surface" />
                <VisitCard
                  visit={visit}
                  compact
                  className={cn(i < older.length - 1 && "border-b border-border")}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { VisitTimeline };
