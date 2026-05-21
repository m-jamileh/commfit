"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, User, Phone, Camera, Package } from "lucide-react";
import {
  Card,
  Pill,
  Checkbox,
  Button,
  useJob,
  useEquipment,
  mockLocations,
} from "@commfit/ui";

const PRE_SERVICE_CHECKS = [
  "PPE donned and safety briefing complete",
  "Work order reviewed and confirmed with property contact",
  "Equipment access confirmed and cleared",
  "Documentation and tools prepared",
];

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params.id === "string" ? params.id : "";

  const { data: job, isLoading } = useJob(jobId);
  const { data: equipmentList = [] } = useEquipment(
    job ? { locationId: job.locationId } : undefined
  );

  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [partsUsed] = useState<string[]>([]);

  const locMap = new Map(mockLocations.map((l) => [l.id, l]));
  const loc = job ? locMap.get(job.locationId) : null;

  function toggleCheck(i: number) {
    setChecks((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-text-muted">Loading job...</div>;
  }

  if (!job) {
    return <div className="p-6 text-sm text-danger">Job not found.</div>;
  }

  const allChecked = PRE_SERVICE_CHECKS.every((_, i) => checks[i]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 pt-10 pb-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-primary-foreground/70 text-sm mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-primary-foreground/70 text-xs uppercase tracking-wide">
              {job.jobType.replace("_", " ").toUpperCase()}
            </p>
            <h1 className="font-display text-xl font-semibold text-primary-foreground mt-0.5">
              {loc?.name ?? job.locationId}
            </h1>
            <p className="text-primary-foreground/60 text-sm">{loc?.address}</p>
          </div>
          <Pill
            color={
              job.status === "completed" ? "success" :
              job.status === "on_site" ? "accent" :
              job.status === "en_route" ? "warning" : "info"
            }
          >
            {job.status.replace("_", " ")}
          </Pill>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Route info */}
        <Card padding="sm">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Location</p>
          <p className="text-sm text-text-primary flex items-start gap-1">
            <MapPin className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
            {loc?.address}, {loc?.city}, {loc?.state} {loc?.zip}
          </p>
        </Card>

        {/* Customer contact */}
        {loc?.contactName && (
          <Card padding="sm">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Property Contact</p>
            <p className="text-sm text-text-primary flex items-center gap-1">
              <User className="h-4 w-4 text-text-muted" /> {loc.contactName}
            </p>
            {loc.contactPhone && (
              <a
                href={`tel:${loc.contactPhone}`}
                className="text-sm text-info flex items-center gap-1 mt-1"
              >
                <Phone className="h-4 w-4" /> {loc.contactPhone}
              </a>
            )}
          </Card>
        )}

        {/* Pre-service checklist */}
        <Card>
          <p className="text-sm font-semibold text-text-primary mb-3">Pre-Service Checklist</p>
          <div className="space-y-2.5">
            {PRE_SERVICE_CHECKS.map((item, i) => (
              <Checkbox
                key={i}
                label={item}
                checked={!!checks[i]}
                onCheckedChange={() => toggleCheck(i)}
              />
            ))}
          </div>
        </Card>

        {/* Equipment tasks */}
        <div>
          <p className="text-sm font-semibold text-text-primary mb-2">Equipment ({equipmentList.length} units)</p>
          <div className="space-y-2">
            {equipmentList.slice(0, 5).map((eq) => (
              <Card key={eq.id} padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{eq.model ?? "Unknown"}</p>
                    <p className="text-xs text-text-muted font-mono">{eq.serialNumber ?? "—"}</p>
                  </div>
                  <Pill
                    color={
                      eq.condition === "excellent" ? "success" :
                      eq.condition === "good" ? "info" :
                      eq.condition === "fair" ? "warning" : "danger"
                    }
                  >
                    {eq.condition}
                  </Pill>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer flex-1">
                    <input type="file" accept="image/*" capture="environment" className="sr-only" />
                    <span className="flex items-center gap-1 px-2 py-1 rounded border border-border bg-bg hover:bg-border/50 transition-colors">
                      <Camera className="h-3 w-3" />
                      Photo
                    </span>
                  </label>
                  <Button variant="ghost" size="sm">Mark Done</Button>
                </div>
              </Card>
            ))}
            {equipmentList.length > 5 && (
              <p className="text-xs text-text-muted text-center">+{equipmentList.length - 5} more units</p>
            )}
          </div>
        </div>

        {/* Parts used */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-text-primary">Parts Used</p>
            <Button variant="ghost" size="sm">
              <Package className="h-3.5 w-3.5" /> Add Part
            </Button>
          </div>
          {partsUsed.length === 0 ? (
            <p className="text-xs text-text-muted">No parts added yet.</p>
          ) : (
            <div className="space-y-1">
              {partsUsed.map((p, i) => (
                <p key={i} className="text-sm text-text-secondary">{p}</p>
              ))}
            </div>
          )}
        </Card>

        {/* Notes */}
        {job.notes && (
          <Card padding="sm">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Job Notes</p>
            <p className="text-sm text-text-secondary">{job.notes}</p>
          </Card>
        )}
      </div>

      {/* Sticky sign-off CTA */}
      <div className="sticky bottom-16 px-4 pb-4 pt-2 bg-bg/95 backdrop-blur-sm border-t border-border">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!allChecked}
          onClick={() => router.push(`/sign-off/${job.id}`)}
        >
          {allChecked ? "Customer Sign-Off →" : "Complete checklist first"}
        </Button>
      </div>
    </div>
  );
}
