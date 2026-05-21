"use client";
import * as React from "react";
import { MoreHorizontal, Wrench, Archive } from "lucide-react";
import { cn } from "../lib/utils";
import { Pill } from "../components/pill";
import type { EquipmentCondition } from "@commfit/shared-types";

export interface EquipmentRowData {
  id: string;
  serialNumber?: string;
  model?: string;
  supplier?: string;
  equipmentClass: string;
  condition: EquipmentCondition;
  lastServiceDate?: string | Date | null;
  status: "active" | "archived";
}

interface EquipmentRowProps {
  equipment: EquipmentRowData;
  onService?: (id: string) => void;
  onArchive?: (id: string) => void;
  className?: string;
}

const conditionColors: Record<EquipmentCondition, "success" | "info" | "warning" | "danger"> = {
  excellent: "success",
  good: "info",
  fair: "warning",
  poor: "danger",
};

const conditionLabels: Record<EquipmentCondition, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

function formatDate(date?: string | Date | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function EquipmentRow({ equipment, onService, onArchive, className }: EquipmentRowProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <tr className={cn("border-b border-border hover:bg-bg/50 transition-colors", className)}>
      <td className="py-2.5 px-3 text-sm font-mono text-text-secondary">
        {equipment.serialNumber ?? "—"}
      </td>
      <td className="py-2.5 px-3 text-sm text-text-primary">
        <div>
          <p className="font-medium">{equipment.model ?? "Unknown Model"}</p>
          <p className="text-xs text-text-muted capitalize">{equipment.equipmentClass}</p>
        </div>
      </td>
      <td className="py-2.5 px-3 text-sm text-text-secondary">
        {equipment.supplier ?? "—"}
      </td>
      <td className="py-2.5 px-3">
        <Pill color={conditionColors[equipment.condition]}>
          {conditionLabels[equipment.condition]}
        </Pill>
      </td>
      <td className="py-2.5 px-3 text-sm text-text-secondary">
        {formatDate(equipment.lastServiceDate)}
      </td>
      <td className="py-2.5 px-3">
        <div className="relative flex items-center justify-end">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded hover:bg-border/50 text-text-muted hover:text-text-primary transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-10 min-w-[140px] rounded border border-border bg-surface shadow-md py-1">
              {onService && (
                <button
                  onClick={() => { onService(equipment.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-text-primary hover:bg-bg"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  Schedule Service
                </button>
              )}
              {onArchive && (
                <button
                  onClick={() => { onArchive(equipment.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-danger hover:bg-bg"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export { EquipmentRow };
