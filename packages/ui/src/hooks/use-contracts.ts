"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockContracts } from "../lib/mock-data";
import { useCommfitClient } from "../lib/commfit-client";
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

export function useCreateContract() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => client.contracts.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useSendContract() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.contracts.send(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: ["contracts", id] });
      void qc.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useSignContract() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      client.contracts.sign(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["contracts", id] });
      void qc.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}
