"use client";
import { useState } from "react";
import { Search, X } from "lucide-react";
import {
  PageHeader,
  Card,
  Pill,
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  useJobs,
  mockLocations,
  mockTechnicians,
  type JobCardData,
} from "@commfit/ui";
import type { JobStatus, JobType } from "@commfit/shared-types";

const statusColors: Record<JobStatus, "info" | "warning" | "accent" | "success" | "default"> = {
  scheduled: "info",
  en_route: "warning",
  on_site: "accent",
  completed: "success",
  cancelled: "default",
};

const jobTypeLabels: Record<JobType, string> = {
  pm: "PM",
  sr: "Service Request",
  disinfecting: "Disinfecting",
  install: "Install",
};

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const { data: jobs = [], isLoading } = useJobs(
    statusFilter !== "all" ? { status: statusFilter as JobStatus } : undefined
  );

  const locationMap = new Map(mockLocations.map((l) => [l.id, l]));
  const techMap = new Map(mockTechnicians.map((t) => [t.id, t]));

  const filtered = jobs.filter((j) => {
    if (typeFilter !== "all" && j.jobType !== typeFilter) return false;
    if (search) {
      const loc = locationMap.get(j.locationId)?.name ?? "";
      const tech = j.technicianId
        ? (() => {
            const t = techMap.get(j.technicianId);
            return t ? `${t.firstName} ${t.lastName}` : "";
          })()
        : "";
      const q = search.toLowerCase();
      if (
        !loc.toLowerCase().includes(q) &&
        !tech.toLowerCase().includes(q) &&
        !j.id.toLowerCase().includes(q) &&
        !j.jobType.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const selectedJob = selectedJobId ? jobs.find((j) => j.id === selectedJobId) : null;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Jobs"
        breadcrumbs={[{ label: "Operations" }, { label: "Jobs" }]}
        actions={
          <Button variant="primary" size="sm">
            + New Job
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 rounded border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 w-56"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="en_route">En Route</SelectItem>
            <SelectItem value="on_site">On Site</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pm">PM</SelectItem>
            <SelectItem value="sr">Service Request</SelectItem>
            <SelectItem value="disinfecting">Disinfecting</SelectItem>
            <SelectItem value="install">Install</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-text-muted ml-auto">{filtered.length} jobs</span>
      </div>

      {/* Table */}
      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">ID</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Type</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Property</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Technician</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Scheduled</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Priority</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-text-muted">
                  Loading jobs...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-text-muted">
                  No jobs match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((job) => {
                const loc = locationMap.get(job.locationId);
                const tech = job.technicianId ? techMap.get(job.technicianId) : null;
                const scheduledDate = new Date(job.scheduledAt);
                return (
                  <tr
                    key={job.id}
                    className="border-b border-border hover:bg-bg/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <td className="py-2.5 px-3 font-mono text-xs text-text-muted">{job.id}</td>
                    <td className="py-2.5 px-3 text-text-primary font-medium">
                      {jobTypeLabels[job.jobType]}
                    </td>
                    <td className="py-2.5 px-3 text-text-primary">{loc?.name ?? job.locationId}</td>
                    <td className="py-2.5 px-3 text-text-secondary">
                      {tech ? `${tech.firstName} ${tech.lastName}` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary text-xs">
                      {scheduledDate.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      <Pill color={statusColors[job.status]}>
                        {job.status.replace("_", " ")}
                      </Pill>
                    </td>
                    <td className="py-2.5 px-3">
                      {job.priority === "urgent" ? (
                        <Pill color="danger">Urgent</Pill>
                      ) : (
                        <span className="text-xs text-text-muted">Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* Job detail modal */}
      <Modal open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJobId(null)}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>
              Job Detail — {selectedJob ? jobTypeLabels[selectedJob.jobType] : ""}
            </ModalTitle>
            <ModalDescription>
              {selectedJob ? locationMap.get(selectedJob.locationId)?.name : ""}
            </ModalDescription>
          </ModalHeader>
          {selectedJob && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-text-muted">ID</p>
                  <p className="font-mono text-text-primary">{selectedJob.id}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Status</p>
                  <Pill color={statusColors[selectedJob.status]}>
                    {selectedJob.status.replace("_", " ")}
                  </Pill>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Type</p>
                  <p className="text-text-primary">{jobTypeLabels[selectedJob.jobType]}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Priority</p>
                  <p className="text-text-primary capitalize">{selectedJob.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Scheduled</p>
                  <p className="text-text-primary">
                    {new Date(selectedJob.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Technician</p>
                  <p className="text-text-primary">
                    {selectedJob.technicianId
                      ? (() => {
                          const t = techMap.get(selectedJob.technicianId!);
                          return t ? `${t.firstName} ${t.lastName}` : "—";
                        })()
                      : "Unassigned"}
                  </p>
                </div>
              </div>
              {selectedJob.notes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-text-muted mb-1">Notes</p>
                  <p className="text-sm text-text-secondary">{selectedJob.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedJobId(null)}>
                  Close
                </Button>
                <Button variant="primary" size="sm">
                  Edit Job
                </Button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
