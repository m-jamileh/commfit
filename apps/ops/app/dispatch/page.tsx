"use client";
import { Briefcase, Navigation, MapPin, CheckCircle2, RefreshCw } from "lucide-react";
import {
  Kpi,
  JobsBoard,
  TechAvailabilityRow,
  ActivityFeed,
  MapPreview,
  PageHeader,
  Card,
  AccentRail,
  useJobs,
  useTechnicians,
  mockTechnicians,
  mockLocations,
  type JobCardData,
  type TechAvailabilityData,
  type ActivityEvent,
} from "@commfit/ui";

function buildActivityFeed(): ActivityEvent[] {
  return [
    { id: "ae-01", timestamp: new Date(Date.now() - 3 * 60000), actor: "Jorge Ramirez", action: "started on-site at", entity: "Lofts at Watters Creek", entityType: "job" },
    { id: "ae-02", timestamp: new Date(Date.now() - 8 * 60000), actor: "Aisha Johnson", action: "marked en route to", entity: "Marriott Plano Legacy", entityType: "job" },
    { id: "ae-03", timestamp: new Date(Date.now() - 22 * 60000), actor: "System", action: "auto-scheduled PM for", entity: "Plano ISD — Rice MS", entityType: "job" },
    { id: "ae-04", timestamp: new Date(Date.now() - 35 * 60000), actor: "Maria Torres", action: "completed job at", entity: "Plano Senior High", entityType: "job" },
    { id: "ae-05", timestamp: new Date(Date.now() - 41 * 60000), actor: "Carlos Mendoza", action: "signed off customer at", entity: "Ascend at Heritage", entityType: "sign-off" },
    { id: "ae-06", timestamp: new Date(Date.now() - 58 * 60000), actor: "Dispatcher", action: "created invoice", entity: "INV-2025-0142", entityType: "invoice" },
    { id: "ae-07", timestamp: new Date(Date.now() - 75 * 60000), actor: "Devon Park", action: "accepted job", entity: "Hilton Allen SR", entityType: "job" },
    { id: "ae-08", timestamp: new Date(Date.now() - 92 * 60000), actor: "System", action: "flagged overdue invoice", entity: "INV-2025-0139", entityType: "invoice" },
    { id: "ae-09", timestamp: new Date(Date.now() - 110 * 60000), actor: "Aisha Johnson", action: "completed job at", entity: "Courtyard Frisco", entityType: "job" },
    { id: "ae-10", timestamp: new Date(Date.now() - 135 * 60000), actor: "System", action: "sent quote to", entity: "Plano ISD", entityType: "quote" },
  ];
}

export default function DispatchPage() {
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const { data: techs = [], isLoading: techsLoading } = useTechnicians();

  const activeJobs = jobs.filter((j) => j.status !== "completed" && j.status !== "cancelled");
  const enRoute = jobs.filter((j) => j.status === "en_route");
  const onSite = jobs.filter((j) => j.status === "on_site");
  const completedToday = jobs.filter((j) => {
    if (j.status !== "completed") return false;
    const d = new Date(j.completedAt ?? j.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const locationMap = new Map(mockLocations.map((l) => [l.id, l]));
  const techMap = new Map(mockTechnicians.map((t) => [t.id, t]));

  const jobCards: JobCardData[] = jobs.map((j) => ({
    id: j.id,
    jobType: j.jobType,
    status: j.status,
    propertyName: locationMap.get(j.locationId)?.name ?? j.locationId,
    techName: j.technicianId
      ? (() => {
          const t = techMap.get(j.technicianId);
          return t ? `${t.firstName} ${t.lastName}` : undefined;
        })()
      : undefined,
    scheduledAt: j.scheduledAt,
    priority: j.priority,
    accountName: undefined,
  }));

  const techRows: TechAvailabilityData[] = techs.map((t) => {
    const currentJob = jobs.find(
      (j) => j.technicianId === t.id && (j.status === "on_site" || j.status === "en_route")
    );
    return {
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      techType: t.techType,
      region: t.region,
      availabilityStatus: t.availabilityStatus,
      currentJobRef: currentJob
        ? `${currentJob.jobType.toUpperCase()} — ${locationMap.get(currentJob.locationId)?.name ?? "Unknown"}`
        : undefined,
    };
  });

  const activity = buildActivityFeed();

  return (
    <div className="flex flex-col gap-5 h-full">
      <PageHeader
        title="Dispatch"
        breadcrumbs={[{ label: "Operations" }, { label: "Dispatch" }]}
        actions={
          <button className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        <Kpi
          label="Active Jobs"
          value={activeJobs.length}
          icon={Briefcase}
          trend="up"
          trendLabel="+2 vs yesterday"
        />
        <Kpi
          label="En Route"
          value={enRoute.length}
          icon={Navigation}
          trend="flat"
          trendLabel="same as avg"
        />
        <Kpi
          label="On Site"
          value={onSite.length}
          icon={MapPin}
          trend="up"
          trendLabel="+1"
        />
        <Kpi
          label="Completed Today"
          value={completedToday.length}
          icon={CheckCircle2}
          trend="up"
          trendLabel="+3 ahead of pace"
        />
      </div>

      {/* Main content */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: Jobs board */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <AccentRail label="Job Board" />
          {jobsLoading ? (
            <div className="text-sm text-text-muted py-4">Loading jobs...</div>
          ) : (
            <JobsBoard jobs={jobCards} className="flex-1" />
          )}
          {/* Map preview */}
          <MapPreview className="h-[280px]" />
        </div>

        {/* Right panel */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          <Card padding="sm">
            <AccentRail label="Technician Status" className="mb-3" />
            {techsLoading ? (
              <div className="text-sm text-text-muted py-2">Loading...</div>
            ) : (
              <div className="divide-y divide-border">
                {techRows.map((tech) => (
                  <TechAvailabilityRow key={tech.id} tech={tech} />
                ))}
              </div>
            )}
          </Card>

          <Card padding="sm" className="flex-1 overflow-hidden flex flex-col">
            <AccentRail label="Activity Feed" className="mb-3" />
            <div className="flex-1 overflow-y-auto">
              <ActivityFeed events={activity} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
