"use client";
import { DollarSign, CheckCircle2 } from "lucide-react";
import { Card, Pill, useJobs, mockLocations } from "@commfit/ui";

const DEMO_TECH_ID = "tech-001";

function commissionForJob(totalCents: number): number {
  return Math.round(totalCents * 0.12);
}

// Estimated job value based on type
const JOB_VALUE: Record<string, number> = {
  pm: 128000,
  sr: 75000,
  disinfecting: 45000,
  install: 180000,
};

export default function HistoryPage() {
  const { data: allJobs = [], isLoading } = useJobs({ technicianId: DEMO_TECH_ID });
  const locMap = new Map(mockLocations.map((l) => [l.id, l]));

  const completed = allJobs
    .filter((j) => j.status === "completed")
    .sort((a, b) => new Date(b.completedAt ?? b.scheduledAt).getTime() - new Date(a.completedAt ?? a.scheduledAt).getTime());

  const totalEarned = completed.reduce((sum, j) => {
    const val = JOB_VALUE[j.jobType] ?? 80000;
    return sum + commissionForJob(val);
  }, 0);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 pt-10 pb-5">
        <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wide">Commission</p>
        <h1 className="font-display text-2xl font-semibold text-primary-foreground mt-0.5">History</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">{completed.length} completed jobs</p>
      </div>

      {/* Earnings summary */}
      <div className="px-4 py-4">
        <Card className="flex items-center gap-4 mb-4">
          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Total Commission Earned (shown)</p>
            <p className="text-xl font-semibold font-display text-text-primary">
              ${(totalEarned / 100).toFixed(2)}
            </p>
          </div>
        </Card>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-text-muted text-center py-4">Loading...</p>
          ) : completed.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">No completed jobs yet.</p>
          ) : completed.map((job) => {
            const loc = locMap.get(job.locationId);
            const jobVal = JOB_VALUE[job.jobType] ?? 80000;
            const commission = commissionForJob(jobVal);
            const completedDate = job.completedAt ?? job.scheduledAt;

            return (
              <Card key={job.id} padding="sm">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-medium text-text-primary text-sm">{loc?.name ?? job.locationId}</p>
                    <p className="text-xs text-text-muted">
                      {new Date(completedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-success">
                      +${(commission / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-text-muted">12% of ${(jobVal / 100).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill color="success"><CheckCircle2 className="h-3 w-3 inline mr-0.5" />Completed</Pill>
                  <span className="text-xs text-text-muted capitalize">{job.jobType.replace("_", " ")}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
