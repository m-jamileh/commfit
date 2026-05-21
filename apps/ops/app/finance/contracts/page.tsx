"use client";
import {
  PageHeader,
  Card,
  Pill,
  Button,
  useContracts,
  mockAccounts,
} from "@commfit/ui";
import type { ContractStatus } from "@commfit/shared-types";

const statusColors: Record<ContractStatus, "default" | "info" | "warning" | "success" | "danger"> = {
  draft: "default",
  sent: "info",
  partially_signed: "warning",
  signed: "success",
  terminated: "danger",
};

export default function ContractsPage() {
  const { data: contracts = [], isLoading } = useContracts();
  const accountMap = new Map(mockAccounts.map((a) => [a.id, a]));

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Contracts"
        breadcrumbs={[{ label: "Finance" }, { label: "Contracts" }]}
        actions={<Button variant="primary" size="sm">+ New Contract</Button>}
      />
      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Title</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Account</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Service</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Term</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Value</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">E-Sign Status</th>
              <th className="py-2.5 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-8 text-center text-sm text-text-muted">Loading...</td></tr>
            ) : contracts.map((c) => (
              <tr key={c.id} className="border-b border-border hover:bg-bg/50 transition-colors">
                <td className="py-2.5 px-3">
                  <p className="font-medium text-text-primary max-w-[220px] truncate">{c.title}</p>
                </td>
                <td className="py-2.5 px-3 text-text-secondary">{accountMap.get(c.accountId)?.name ?? c.accountId}</td>
                <td className="py-2.5 px-3 text-text-secondary capitalize">{c.serviceType.replace("_", " ")}</td>
                <td className="py-2.5 px-3 text-text-secondary text-xs">
                  {c.startDate} → {c.endDate}
                </td>
                <td className="py-2.5 px-3 text-text-primary font-medium">
                  ${(c.totalValueCents / 100).toLocaleString()}
                </td>
                <td className="py-2.5 px-3">
                  <Pill color={statusColors[c.status]}>{c.status.replace("_", " ")}</Pill>
                </td>
                <td className="py-2.5 px-3">
                  <Button variant="ghost" size="sm">View PDF</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
