"use client";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, User, Phone, Camera, Package } from "lucide-react";
import {
  Card,
  Pill,
  Checkbox,
  Button,
  useJob,
  useEquipment,
  useUpdateJob,
  useAddJobPhoto,
  useParts,
  uploadJobPhoto,
  mockLocations,
} from "@commfit/ui";

const PRE_SERVICE_CHECKS = [
  "PPE donned and safety briefing complete",
  "Work order reviewed and confirmed with property contact",
  "Equipment access confirmed and cleared",
  "Documentation and tools prepared",
];

interface StoredPhoto {
  url: string;
  equipmentId?: string;
}

interface StoredPart {
  partId: string;
  quantity: number;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params.id === "string" ? params.id : "";

  const { data: job, isLoading } = useJob(jobId);
  const { data: equipmentList = [] } = useEquipment(
    job ? { locationId: job.locationId } : undefined
  );
  const { data: allParts = [] } = useParts();
  const updateJob = useUpdateJob();
  const addPhoto = useAddJobPhoto();

  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploadingEquipmentId, setUploadingEquipmentId] = useState<string | null>(null);
  // Local photos for immediate thumbnail display while query refetches
  const [localPhotos, setLocalPhotos] = useState<StoredPhoto[]>([]);
  const seededChecks = useRef(false);

  const locMap = new Map(mockLocations.map((l) => [l.id, l]));
  const loc = job ? locMap.get(job.locationId) : null;

  // Seed checklist state from persisted metadata on first load
  useEffect(() => {
    if (job && !seededChecks.current) {
      const persisted = job.metadata?.checklist as Record<string, boolean> | undefined;
      if (persisted && Object.keys(persisted).length > 0) {
        seededChecks.current = true;
        setChecks(
          Object.fromEntries(
            Object.entries(persisted).map(([k, v]) => [Number(k), v])
          )
        );
      }
    }
  }, [job]);

  const persistedPhotos = (job?.metadata?.photos as StoredPhoto[] | undefined) ?? [];
  // Merge persisted + local, dedup by url
  const allPhotos = [
    ...persistedPhotos,
    ...localPhotos.filter((lp) => !persistedPhotos.some((pp) => pp.url === lp.url)),
  ];

  const partsUsed = (job?.metadata?.parts as StoredPart[] | undefined) ?? [];
  const partsMap = new Map(allParts.map((p) => [p.id, p]));
  const equipmentDone = (
    job?.metadata?.equipmentDone as Record<string, { doneAt: string }> | undefined
  ) ?? {};

  function toggleCheck(i: number) {
    const newVal = !checks[i];
    setChecks((prev) => ({ ...prev, [i]: newVal }));
    const meta = job?.metadata ?? {};
    updateJob.mutate({
      id: jobId,
      metadata: {
        ...meta,
        checklist: {
          ...(meta.checklist as Record<string, boolean> | undefined ?? {}),
          [i]: newVal,
        },
      },
    });
  }

  async function handlePhotoUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    equipmentId: string
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Photo must be under 5 MB");
      e.target.value = "";
      return;
    }
    setPhotoError(null);
    setUploadingEquipmentId(equipmentId);
    try {
      const { url } = await uploadJobPhoto(file, {
        jobId,
        accountId: job!.accountId,
      });
      setLocalPhotos((prev) => [...prev, { url, equipmentId }]);
      await addPhoto.mutateAsync({ id: jobId, url, equipmentId });
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setUploadingEquipmentId(null);
      e.target.value = "";
    }
  }

  function handleMarkDone(equipmentId: string) {
    const meta = job?.metadata ?? {};
    const existing = (meta.equipmentDone as Record<string, unknown> | undefined) ?? {};
    updateJob.mutate({
      id: jobId,
      metadata: {
        ...meta,
        equipmentDone: {
          ...existing,
          [equipmentId]: {
            doneAt: new Date().toISOString(),
            doneByUserId: "tech-001",
          },
        },
      },
    });
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

      <div className="px-4 py-4 pb-24 space-y-4">
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
          <p className="text-sm font-semibold text-text-primary mb-2">
            Equipment ({equipmentList.length} units)
          </p>
          {photoError && (
            <p className="text-xs text-danger mb-2">{photoError}</p>
          )}
          <div className="space-y-2">
            {equipmentList.slice(0, 5).map((eq) => {
              const isDone = !!equipmentDone[eq.id];
              const isUploading = uploadingEquipmentId === eq.id;
              const photosForEq = allPhotos.filter((p) => p.equipmentId === eq.id);
              return (
                <Card key={eq.id} padding="sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{eq.model ?? "Unknown"}</p>
                      <p className="text-xs text-text-muted font-mono">{eq.serialNumber ?? "—"}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isDone && <Pill color="success">Done</Pill>}
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
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        disabled={isUploading}
                        onChange={(e) => handlePhotoUpload(e, eq.id)}
                      />
                      <span className="flex items-center gap-1 px-2 py-1 rounded border border-border bg-bg hover:bg-border/50 transition-colors">
                        <Camera className="h-3 w-3" />
                        {isUploading ? "Uploading…" : `Photo${photosForEq.length > 0 ? ` (${photosForEq.length})` : ""}`}
                      </span>
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isDone || updateJob.isPending}
                      onClick={() => handleMarkDone(eq.id)}
                    >
                      {isDone ? "Done ✓" : "Mark Done"}
                    </Button>
                  </div>
                  {photosForEq.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {photosForEq.map((p, idx) => (
                        <img
                          key={idx}
                          src={p.url}
                          alt="equipment photo"
                          className="h-12 w-12 object-cover rounded border border-border"
                        />
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
            {equipmentList.length > 5 && (
              <p className="text-xs text-text-muted text-center">
                +{equipmentList.length - 5} more units
              </p>
            )}
          </div>
        </div>

        {/* Parts used */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-text-primary">Parts Used</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/parts-request?jobId=${job.id}`)}
            >
              <Package className="h-3.5 w-3.5" /> Add Part
            </Button>
          </div>
          {partsUsed.length === 0 ? (
            <p className="text-xs text-text-muted">No parts added yet.</p>
          ) : (
            <div className="space-y-1">
              {partsUsed.map((p, i) => {
                const part = partsMap.get(p.partId);
                return (
                  <p key={i} className="text-sm text-text-secondary">
                    {part?.name ?? p.partId} &times; {p.quantity}
                  </p>
                );
              })}
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
