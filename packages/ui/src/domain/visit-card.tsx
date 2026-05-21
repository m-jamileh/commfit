"use client";
import * as React from "react";
import { CheckCircle2, Clock, Package } from "lucide-react";
import { cn } from "../lib/utils";
import { Pill } from "../components/pill";
import { UserAvatar } from "../components/avatar";

export interface VisitCardData {
  id: string;
  date: string | Date;
  techName: string;
  serviceType: string;
  equipmentCount: number;
  notes?: string;
  signedOff: boolean;
}

interface VisitCardProps {
  visit: VisitCardData;
  compact?: boolean;
  className?: string;
}

function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function VisitCard({ visit, compact = false, className }: VisitCardProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 py-2", className)}>
        <div className="text-xs text-text-muted w-20 shrink-0">{formatDate(visit.date)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary truncate">{visit.serviceType}</p>
          <p className="text-xs text-text-muted">{visit.techName}</p>
        </div>
        {visit.signedOff ? (
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
        ) : (
          <Clock className="h-4 w-4 text-warning shrink-0" />
        )}
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border border-border bg-surface p-4", className)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{visit.serviceType}</p>
          <p className="text-xs text-text-muted mt-0.5">{formatDate(visit.date)}</p>
        </div>
        <Pill color={visit.signedOff ? "success" : "warning"}>
          {visit.signedOff ? "Signed Off" : "Pending"}
        </Pill>
      </div>

      <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
        <span className="flex items-center gap-1">
          <UserAvatar name={visit.techName} size="sm" />
          {visit.techName}
        </span>
        <span className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          {visit.equipmentCount} units
        </span>
      </div>

      {visit.notes && (
        <p className="text-xs text-text-secondary line-clamp-2 border-t border-border pt-2">
          {visit.notes}
        </p>
      )}
    </div>
  );
}

export { VisitCard };
