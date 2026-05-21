"use client";
import * as React from "react";
import { MapPin, User, Package, FileText } from "lucide-react";
import { cn } from "../lib/utils";

export interface PropertyHeroData {
  name: string;
  address: string;
  city: string;
  state: string;
  contactName?: string;
  equipmentCount: number;
  activeContractsCount: number;
}

interface PropertyHeroProps {
  property: PropertyHeroData;
  actions?: React.ReactNode;
  className?: string;
}

function PropertyHero({ property, actions, className }: PropertyHeroProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-5", className)}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-text-primary">
            {property.name}
          </h2>
          <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5 text-text-muted" />
            {property.address}, {property.city}, {property.state}
          </p>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        {property.contactName && (
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <User className="h-3.5 w-3.5 text-text-muted" />
            <span>{property.contactName}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
          <Package className="h-3.5 w-3.5 text-text-muted" />
          <span>
            <strong className="text-text-primary">{property.equipmentCount}</strong> equipment units
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
          <FileText className="h-3.5 w-3.5 text-text-muted" />
          <span>
            <strong className="text-text-primary">{property.activeContractsCount}</strong> active contracts
          </span>
        </div>
      </div>
    </div>
  );
}

export { PropertyHero };
