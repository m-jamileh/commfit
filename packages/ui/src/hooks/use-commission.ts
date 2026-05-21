"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockCommissionRules } from "../lib/mock-data";

export function useCommissionRules() {
  return useQuery({
    queryKey: ["commission-rules"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80));
      return [...mockCommissionRules];
    },
  });
}

export function useCreateCommissionRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: { name: string; ratePct: number; jobTypeFilter?: string }) => {
      await new Promise((r) => setTimeout(r, 200));
      return { id: `cr-${Date.now()}`, ...rule };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["commission-rules"] });
    },
  });
}

export function useUpdateCommissionRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await new Promise((r) => setTimeout(r, 150));
      const rule = mockCommissionRules.find((r) => r.id === id);
      if (rule) (rule as { active: boolean }).active = active;
      return { id, active };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["commission-rules"] });
    },
  });
}
