"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockInvoices } from "../lib/mock-data";
import { useCommfitClient } from "../lib/commfit-client";
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

export function useCreateInvoice() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => client.invoices.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useSendInvoice() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.invoices.send(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: ["invoices", id] });
      void qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useRecordInvoicePayment() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      client.invoices.recordPayment(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["invoices", id] });
      void qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
