"use client";
import { useState } from "react";
import {
  PageHeader,
  Card,
  Pill,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  useInvoices,
  mockAccounts,
} from "@commfit/ui";
import type { InvoiceStatus } from "@commfit/shared-types";

const statusColors: Record<InvoiceStatus, "default" | "info" | "success" | "warning" | "danger" | "accent"> = {
  draft: "default",
  sent: "info",
  paid: "success",
  partially_paid: "warning",
  overdue: "danger",
  void: "default",
};

const TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "draft", label: "Draft" },
];

export default function InvoicesPage() {
  const [tab, setTab] = useState("all");
  const { data: invoices = [], isLoading } = useInvoices(
    tab !== "all" ? { status: tab as InvoiceStatus } : undefined
  );
  const accountMap = new Map(mockAccounts.map((a) => [a.id, a]));

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Invoices"
        breadcrumbs={[{ label: "Finance" }, { label: "Invoices" }]}
        actions={<Button variant="primary" size="sm">+ New Invoice</Button>}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <Card padding="none">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Invoice #</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Account</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Due Date</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Total</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Paid</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                    <th className="py-2.5 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={7} className="py-8 text-center text-sm text-text-muted">Loading...</td></tr>
                  ) : invoices.length === 0 ? (
                    <tr><td colSpan={7} className="py-8 text-center text-sm text-text-muted">No invoices</td></tr>
                  ) : invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border hover:bg-bg/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-xs text-text-primary">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{accountMap.get(inv.accountId)?.name ?? inv.accountId}</td>
                      <td className="py-2.5 px-3 text-text-secondary text-xs">{inv.dueDate}</td>
                      <td className="py-2.5 px-3 text-text-primary font-medium">
                        ${(inv.totalCents / 100).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary">
                        ${(inv.paidCents / 100).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <Pill color={statusColors[inv.status]}>{inv.status.replace("_", " ")}</Pill>
                      </td>
                      <td className="py-2.5 px-3">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
