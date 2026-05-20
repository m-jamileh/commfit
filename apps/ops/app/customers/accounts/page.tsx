"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, Card, Pill, Button, useAccounts } from "@commfit/ui";

export default function AccountsPage() {
  const [search, setSearch] = useState("");
  const { data: accounts = [], isLoading } = useAccounts();

  const filtered = accounts.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.billingEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Accounts"
        breadcrumbs={[{ label: "Customers" }, { label: "Accounts" }]}
        actions={<Button variant="primary" size="sm">+ New Account</Button>}
      />
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 rounded border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 w-56"
          />
        </div>
        <span className="text-xs text-text-muted ml-auto">{filtered.length} accounts</span>
      </div>
      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Account Name</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Email</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Phone</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">City</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-8 text-center text-sm text-text-muted">Loading...</td></tr>
            ) : filtered.map((a) => (
              <tr key={a.id} className="border-b border-border hover:bg-bg/50 transition-colors cursor-pointer">
                <td className="py-2.5 px-3">
                  <p className="font-medium text-text-primary">{a.name}</p>
                  <p className="text-xs text-text-muted font-mono">{a.id}</p>
                </td>
                <td className="py-2.5 px-3 text-text-secondary">{a.billingEmail}</td>
                <td className="py-2.5 px-3 text-text-secondary">{a.billingPhone ?? "—"}</td>
                <td className="py-2.5 px-3 text-text-secondary">{a.city ?? "—"}, {a.state ?? ""}</td>
                <td className="py-2.5 px-3">
                  <Pill color={a.status === "active" ? "success" : "default"}>{a.status}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
