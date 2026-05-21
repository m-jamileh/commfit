import * as React from "react";
import { cn } from "../lib/utils";
import { JobCard, type JobCardData } from "./job-card";
import { Pill } from "../components/pill";

type BoardStatus = "scheduled" | "en_route" | "on_site" | "completed";

interface Column {
  status: BoardStatus;
  label: string;
  color: "info" | "warning" | "accent" | "success";
}

const COLUMNS: Column[] = [
  { status: "scheduled", label: "Scheduled", color: "info" },
  { status: "en_route", label: "En Route", color: "warning" },
  { status: "on_site", label: "On Site", color: "accent" },
  { status: "completed", label: "Completed", color: "success" },
];

interface JobsBoardProps {
  jobs: JobCardData[];
  onJobClick?: (id: string) => void;
  className?: string;
}

function JobsBoard({ jobs, onJobClick, className }: JobsBoardProps) {
  const byStatus = React.useMemo(() => {
    const map = new Map<BoardStatus, JobCardData[]>();
    COLUMNS.forEach((c) => map.set(c.status, []));
    jobs.forEach((job) => {
      const s = job.status as BoardStatus;
      if (map.has(s)) {
        map.get(s)!.push(job);
      }
    });
    return map;
  }, [jobs]);

  return (
    <div className={cn("grid grid-cols-4 gap-3 min-h-0", className)}>
      {COLUMNS.map((col) => {
        const colJobs = byStatus.get(col.status) ?? [];
        return (
          <div key={col.status} className="flex flex-col min-h-0">
            {/* Column header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                {col.label}
              </span>
              <Pill color={col.color}>{colJobs.length}</Pill>
            </div>
            {/* Column body */}
            <div className="flex-1 overflow-y-auto space-y-2 rounded-md bg-bg p-2 min-h-24">
              {colJobs.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No jobs</p>
              ) : (
                colJobs.map((job) => (
                  <JobCard key={job.id} job={job} onClick={onJobClick} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { JobsBoard };
