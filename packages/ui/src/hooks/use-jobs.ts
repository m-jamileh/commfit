import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockJobs } from "../lib/mock-data";
import type { JobStatus, JobType } from "@commfit/shared-types";

interface JobFilters {
  status?: JobStatus;
  technicianId?: string;
  jobType?: JobType;
  accountId?: string;
  locationId?: string;
}

export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      let jobs = [...mockJobs];
      if (filters?.status) jobs = jobs.filter((j) => j.status === filters.status);
      if (filters?.technicianId) jobs = jobs.filter((j) => j.technicianId === filters.technicianId);
      if (filters?.jobType) jobs = jobs.filter((j) => j.jobType === filters.jobType);
      if (filters?.accountId) jobs = jobs.filter((j) => j.accountId === filters.accountId);
      if (filters?.locationId) jobs = jobs.filter((j) => j.locationId === filters.locationId);
      return jobs;
    },
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80));
      return mockJobs.find((j) => j.id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: JobStatus }) => {
      await new Promise((r) => setTimeout(r, 200));
      const job = mockJobs.find((j) => j.id === id);
      if (job) {
        (job as { status: JobStatus }).status = status;
      }
      return { id, status };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
