"use client";
import { useQuery } from "@tanstack/react-query";
import { mockLocations } from "../lib/mock-data";

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
