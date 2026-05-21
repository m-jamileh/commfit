"use client";
import { useQuery } from "@tanstack/react-query";
import { mockContracts } from "../lib/mock-data";
import type { ContractStatus } from "@commfit/shared-types";

interface ContractFilters {
  accountId?: string;
  status?: ContractStatus;
}

export function useContracts(filters?: ContractFilters) {
  return useQuery({
    queryKey: ["contracts", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80));
      let contracts = [...mockContracts];
      if (filters?.accountId) contracts = contracts.filter((c) => c.accountId === filters.accountId);
      if (filters?.status) contracts = contracts.filter((c) => c.status === filters.status);
      return contracts;
    },
  });
}

export function useContract(id: string) {
  return useQuery({
    queryKey: ["contracts", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 60));
      return mockContracts.find((c) => c.id === id) ?? null;
    },
    enabled: !!id,
  });
}
