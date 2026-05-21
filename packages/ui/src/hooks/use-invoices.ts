"use client";
import { useQuery } from "@tanstack/react-query";
import { mockInvoices } from "../lib/mock-data";
import type { InvoiceStatus } from "@commfit/shared-types";

interface InvoiceFilters {
  accountId?: string;
  status?: InvoiceStatus;
}

export function useInvoices(filters?: InvoiceFilters) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80));
      let invs = [...mockInvoices];
      if (filters?.accountId) invs = invs.filter((i) => i.accountId === filters.accountId);
      if (filters?.status) invs = invs.filter((i) => i.status === filters.status);
      return invs;
    },
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 60));
      return mockInvoices.find((i) => i.id === id) ?? null;
    },
    enabled: !!id,
  });
}
