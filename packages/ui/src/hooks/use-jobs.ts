"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockJobs } from "../lib/mock-data";
import { useCommfitClient } from "../lib/commfit-client";
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

export function useCreateJob() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => client.jobs.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJob() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      client.jobs.update(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["jobs", id] });
      void qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

// Replaces the mock useUpdateJobStatus — now wired to the real transition endpoint
export function useTransitionJob() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      client.jobs.transition(id, { status }),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["jobs", id] });
      void qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

// Kept for backward compat with existing screen components; delegates to useTransitionJob
export function useUpdateJobStatus() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      client.jobs.transition(id, { status }),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["jobs", id] });
      void qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useCompleteJob() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      client.jobs.complete(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["jobs", id] });
      void qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useAssignTechnician() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, technicianId }: { id: string; technicianId: string }) =>
      client.jobs.assign(id, { technicianId }),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["jobs", id] });
      void qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useAddJobPhoto() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      client.jobs.addPhoto(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["jobs", id] });
    },
  });
}

export function useAddJobPart() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      client.jobs.addPart(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["jobs", id] });
    },
  });
}
