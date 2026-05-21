"use client";
import { createContext, useContext } from "react";
import type { CommfitClient } from "@commfit/api-client";

const CommfitClientCtx = createContext<CommfitClient | null>(null);

export function CommfitClientProvider({
  client,
  children,
}: {
  client: CommfitClient;
  children: React.ReactNode;
}) {
  return <CommfitClientCtx.Provider value={client}>{children}</CommfitClientCtx.Provider>;
}

export function useCommfitClient(): CommfitClient {
  const client = useContext(CommfitClientCtx);
  if (!client) throw new Error("useCommfitClient must be used within CommfitClientProvider");
  return client;
}
