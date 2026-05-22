"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockCommissionRules } from "../lib/mock-data";
import { useCommfitClient } from "../lib/commfit-client";

export function useCommissionRules() {
  return useQuery({
    queryKey: ["commission-rules"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80));
      return [...mockCommissionRules];
    },
  });
}

// Replaces mock — now calls POST /v1/commission/rules
export function useCreateCommissionRule() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => client.commission.rules.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["commission-rules"] });
    },
  });
}

// Replaces mock — now calls PATCH /v1/commission/rules/:id
export function useUpdateCommissionRule() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      client.commission.rules.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["commission-rules"] });
    },
  });
}

export function useDeleteCommissionRule() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.commission.rules.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["commission-rules"] });
    },
  });
}

export function useComputeCommissionPreview() {
  const client = useCommfitClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => client.commission.computePreview(body),
  });
}
