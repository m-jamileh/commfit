"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockTechnicians } from "../lib/mock-data";
import { useCommfitClient } from "../lib/commfit-client";
import type { TechAvailabilityStatus, TechType } from "@commfit/shared-types";

interface TechFilters {
  availabilityStatus?: TechAvailabilityStatus;
  techType?: TechType;
  region?: string;
}

export function useTechnicians(filters?: TechFilters) {
  return useQuery({
    queryKey: ["technicians", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80));
      let techs = [...mockTechnicians];
      if (filters?.availabilityStatus)
        techs = techs.filter((t) => t.availabilityStatus === filters.availabilityStatus);
      if (filters?.techType) techs = techs.filter((t) => t.techType === filters.techType);
      if (filters?.region) techs = techs.filter((t) => t.region === filters.region);
      return techs;
    },
  });
}

export function useTechnician(id: string) {
  return useQuery({
    queryKey: ["technicians", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 60));
      return mockTechnicians.find((t) => t.id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateTechnician() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => client.technicians.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["technicians"] });
    },
  });
}
