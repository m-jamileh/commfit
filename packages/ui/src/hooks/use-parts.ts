"use client";
import { useQuery } from "@tanstack/react-query";
import { mockParts } from "../lib/mock-data";

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
