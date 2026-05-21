"use client";
import { useQuery } from "@tanstack/react-query";
import { mockAccounts } from "../lib/mock-data";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80));
      return [...mockAccounts];
    },
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ["accounts", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 60));
      return mockAccounts.find((a) => a.id === id) ?? null;
    },
    enabled: !!id,
  });
}
