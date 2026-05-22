"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockLocations } from "../lib/mock-data";
import { useCommfitClient } from "../lib/commfit-client";

export function useLocations(accountId?: string) {
  return useQuery({
    queryKey: ["locations", { accountId }],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80));
      let locs = [...mockLocations];
      if (accountId) locs = locs.filter((l) => l.accountId === accountId);
      return locs;
    },
  });
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: ["locations", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 60));
      return mockLocations.find((l) => l.id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateLocation() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => client.locations.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

export function useUpdateLocation() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      client.locations.update(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["locations", id] });
      void qc.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
