"use client";
import { useState } from "react";
import {
  PageHeader,
  Card,
  Pill,
  Button,
  useQuotes,
  mockLocations,
  mockAccounts,
} from "@commfit/ui";
import type { QuoteStatus } from "@commfit/shared-types";

const statusColors: Record<QuoteStatus, "default" | "info" | "success" | "warning" | "danger"> = {
  draft: "default",
  sent: "info",
  signed: "success",
  expired: "warning",
  cancelled: "danger",
};

export default function QuotesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: quotes = [], isLoading } = useQuotes();

  const locationMap = new Map(mockLocations.map((l) => [l.id, l]));
  const accountMap = new Map(mockAccounts.map((a) => [a.id, a]));
  const selected = selectedId ? quotes.find((q) => q.id === selectedId) : null;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Quotes"
        breadcrumbs={[{ label: "Operations" }, { label: "Quotes" }]}
        actions={
          <Button variant="primary" size="sm">+ New Quote</Button>
        }
      />

      <div className="flex gap-4">
        {/* Quote list */}
        <div className="flex-1">
          <Card padding="none">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Quote</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Account</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Type</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Total</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Valid Until</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-text-muted">Loading...</td></tr>
                ) : quotes.map((q) => (
                  <tr
                    key={q.id}
                    className={`border-b border-border hover:bg-bg/50 transition-colors cursor-pointer ${selectedId === q.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedId(q.id)}
                  >
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-text-primary truncate max-w-[200px]">{q.title}</p>
                      <p className="text-xs text-text-muted font-mono">{q.id}</p>
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary">{accountMap.get(q.accountId)?.name ?? q.accountId}</td>
                    <td className="py-2.5 px-3 text-text-secondary capitalize">{q.jobType}</td>
                    <td className="py-2.5 px-3 text-text-primary font-medium">
                      ${(q.totalCents / 100).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary text-xs">{q.validUntil ?? "—"}</td>
                    <td className="py-2.5 px-3">
                      <Pill color={statusColors[q.status]}>{q.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Detail pane */}
        {selected && (
          <div className="w-72 shrink-0">
            <Card padding="md" className="sticky top-0">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-text-primary text-sm leading-snug">{selected.title}</h3>
                <button onClick={() => setSelectedId(null)} className="text-text-muted hover:text-text-primary text-lg leading-none">×</button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-text-muted">Account</p>
                  <p className="text-text-primary">{accountMap.get(selected.accountId)?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Property</p>
                  <p className="text-text-primary">{locationMap.get(selected.locationId)?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Type</p>
                  <p className="text-text-primary capitalize">{selected.jobType}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Subtotal</p>
                  <p className="text-text-primary">${(selected.subtotalCents / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Discount</p>
                  <p className="text-text-primary">{selected.discountPct}%</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Tax</p>
                  <p className="text-text-primary">{selected.taxPct}%</p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-text-muted">Total</p>
                  <p className="text-lg font-semibold text-text-primary">${(selected.totalCents / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Status</p>
                  <Pill color={statusColors[selected.status]}>{selected.status}</Pill>
                </div>
                {selected.notes && (
                  <div className="pt-2">
                    <p className="text-xs text-text-muted">Notes</p>
                    <p className="text-text-secondary text-xs">{selected.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" size="sm" className="flex-1">Edit</Button>
                <Button variant="primary" size="sm" className="flex-1">Send</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
