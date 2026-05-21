"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockQuotes } from "../lib/mock-data";
import { useCommfitClient } from "../lib/commfit-client";
import type { QuoteStatus } from "@commfit/shared-types";

interface QuoteFilters {
  accountId?: string;
  status?: QuoteStatus;
}

export function useQuotes(filters?: QuoteFilters) {
  return useQuery({
    queryKey: ["quotes", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80));
      let quotes = [...mockQuotes];
      if (filters?.accountId) quotes = quotes.filter((q) => q.accountId === filters.accountId);
      if (filters?.status) quotes = quotes.filter((q) => q.status === filters.status);
      return quotes;
    },
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ["quotes", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 60));
      return mockQuotes.find((q) => q.id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => client.quotes.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useUpdateQuote() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      client.quotes.update(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ["quotes", id] });
      void qc.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useSendQuote() {
  const client = useCommfitClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.quotes.send(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: ["quotes", id] });
      void qc.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}
