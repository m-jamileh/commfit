"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockAccounts } from "../lib/mock-data";
import { useCommfitClient } from "../lib/commfit-client";

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

export function useCreateAccount() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => client.accounts.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
