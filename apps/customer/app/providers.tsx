"use client";
import {
  CommFitQueryProvider,
  CommfitClientProvider,
  ToastProvider,
  createCommfitClient,
} from "@commfit/ui";

const devClient = createCommfitClient({
  getAuthHeaders: () => ({
    "x-user-id": "dev-customer-id",
    "x-account-id": "acc-001",
    "x-role": "customer",
  }),
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CommFitQueryProvider>
      <CommfitClientProvider client={devClient}>
        <ToastProvider>{children}</ToastProvider>
      </CommfitClientProvider>
    </CommFitQueryProvider>
  );
}
