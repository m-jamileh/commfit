"use client";
import { useQuery } from "@tanstack/react-query";
import { mockEquipment } from "../lib/mock-data";
import type { EquipmentCondition } from "@commfit/shared-types";

interface EquipmentFilters {
  accountId?: string;
  locationId?: string;
  condition?: EquipmentCondition;
}

export function useEquipment(filters?: EquipmentFilters) {
  return useQuery({
    queryKey: ["equipment", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80));
      let eq = [...mockEquipment];
      if (filters?.accountId) eq = eq.filter((e) => e.accountId === filters.accountId);
      if (filters?.locationId) eq = eq.filter((e) => e.locationId === filters.locationId);
      if (filters?.condition) eq = eq.filter((e) => e.condition === filters.condition);
      return eq;
    },
  });
}

export function useEquipmentItem(id: string) {
  return useQuery({
    queryKey: ["equipment", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 60));
      return mockEquipment.find((e) => e.id === id) ?? null;
    },
    enabled: !!id,
  });
}
