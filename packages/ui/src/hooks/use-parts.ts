"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockParts } from "../lib/mock-data";
import { useCommfitClient } from "../lib/commfit-client";

export function useParts(search?: string) {
  return useQuery({
    queryKey: ["parts", { search }],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80));
      let parts = [...mockParts];
      if (search) {
        const q = search.toLowerCase();
        parts = parts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            (p.description ?? "").toLowerCase().includes(q)
        );
      }
      return parts;
    },
  });
}

export function usePart(id: string) {
  return useQuery({
    queryKey: ["parts", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 60));
      return mockParts.find((p) => p.id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useCreatePart() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => client.parts.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["parts"] });
    },
  });
}
