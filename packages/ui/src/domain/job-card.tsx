import * as React from "react";
import { Clock, User, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { Pill } from "../components/pill";
import type { JobStatus, JobType, JobPriority } from "@commfit/shared-types";

export interface JobCardData {
  id: string;
  jobType: JobType;
  status: JobStatus;
  propertyName: string;
  techName?: string;
  scheduledAt: string | Date;
  priority: JobPriority;
  accountName?: string;
}

interface JobCardProps {
  job: JobCardData;
  onClick?: (id: string) => void;
  className?: string;
}

const statusColors: Record<JobStatus, "info" | "warning" | "accent" | "success"> = {
  scheduled: "info",
  en_route: "warning",
  on_site: "accent",
  completed: "success",
  cancelled: "default" as unknown as "info",
};

const statusLabels: Record<JobStatus, string> = {
  scheduled: "Scheduled",
  en_route: "En Route",
  on_site: "On Site",
  completed: "Completed",
  cancelled: "Cancelled",
};

const jobTypeLabels: Record<JobType, string> = {
  pm: "PM",
  sr: "Service Request",
  disinfecting: "Disinfecting",
  install: "Install",
};

function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function JobCard({ job, onClick, className }: JobCardProps) {
  const statusColor = statusColors[job.status] ?? "default";

  return (
    <div
      className={cn(
        "rounded border border-border bg-surface p-3 shadow-sm cursor-pointer",
        "hover:shadow hover:border-primary/20 transition-all",
        job.priority === "urgent" && "border-l-2 border-l-danger",
        className
      )}
      onClick={() => onClick?.(job.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(job.id)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-text-primary">
            {jobTypeLabels[job.jobType]}
          </span>
          {job.priority === "urgent" && (
            <AlertCircle className="h-3 w-3 text-danger" />
          )}
        </div>
        <Pill color={statusColor}>{statusLabels[job.status]}</Pill>
      </div>

      <p className="text-sm font-medium text-text-primary truncate mb-1">
        {job.propertyName}
      </p>
      {job.accountName && (
        <p className="text-xs text-text-muted truncate mb-2">{job.accountName}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTime(job.scheduledAt)}
        </span>
        {job.techName && (
          <span className="flex items-center gap-1 truncate">
            <User className="h-3 w-3" />
            {job.techName}
          </span>
        )}
      </div>
    </div>
  );
}

export { JobCard };
