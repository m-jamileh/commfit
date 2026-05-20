"use client";
import Link from "next/link";
import { Clock, Navigation, MapPin } from "lucide-react";
import {
  MapPreview,
  Card,
  Pill,
  useJobs,
  mockLocations,
  mockAccounts,
} from "@commfit/ui";

// Hard-coded tech ID for demo — would come from session in prod
const DEMO_TECH_ID = "tech-001";

const jobTypeLabels: Record<string, string> = {
  pm: "PM",
  sr: "Service Request",
  disinfecting: "Disinfecting",
  install: "Install",
};

function formatTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function TodayPage() {
  const { data: allJobs = [], isLoading } = useJobs({ technicianId: DEMO_TECH_ID });
  const locMap = new Map(mockLocations.map((l) => [l.id, l]));

  const todayJobs = allJobs
    .filter((j) => {
      const d = new Date(j.scheduledAt);
      const now = new Date();
      return d.toDateString() === now.toDateString() && j.status !== "cancelled";
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 pt-10 pb-5">
        <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wide">Today</p>
        <h1 className="font-display text-2xl font-semibold text-primary-foreground mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          {todayJobs.length} jobs assigned today
        </p>
      </div>

      {/* Map preview */}
      <MapPreview className="h-40 rounded-none" label="Today's Route" />

      {/* Jobs list */}
      <div className="px-4 py-4 space-y-3">
        <h2 className="font-semibold text-sm text-text-secondary uppercase tracking-wide">Assigned Jobs</h2>

        {isLoading ? (
          <p className="text-sm text-text-muted py-4 text-center">Loading your jobs...</p>
        ) : todayJobs.length === 0 ? (
          <Card>
            <p className="text-sm text-text-muted text-center py-4">No jobs assigned today.</p>
          </Card>
        ) : (
          todayJobs.map((job) => {
            const loc = locMap.get(job.locationId);
            const isActive = job.status === "on_site" || job.status === "en_route";
            return (
              <Link key={job.id} href={`/job/${job.id}`}>
                <Card
                  padding="md"
                  className={`active:scale-[0.98] transition-transform ${isActive ? "border-accent" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-text-primary">{loc?.name ?? job.locationId}</p>
                      <p className="text-xs text-text-muted">{loc?.address}</p>
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
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(job.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1 capitalize">
                      <MapPin className="h-3 w-3" />
                      {jobTypeLabels[job.jobType]}
                    </span>
                    {job.priority === "urgent" && (
                      <span className="text-danger font-medium">Urgent</span>
                    )}
                  </div>
                  {isActive && (
                    <div className="mt-3 flex gap-2">
                      <span className="flex items-center gap-1 text-xs text-accent font-medium">
                        <Navigation className="h-3 w-3" />
                        Active Job — Tap to continue
                      </span>
                    </div>
                  )}
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
