"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, Card, Pill, Button, useLocations, mockAccounts } from "@commfit/ui";

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const { data: locations = [], isLoading } = useLocations();
  const accountMap = new Map(mockAccounts.map((a) => [a.id, a]));

  const filtered = locations.filter((l) =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Properties"
        breadcrumbs={[{ label: "Customers" }, { label: "Properties" }]}
        actions={<Button variant="primary" size="sm">+ New Property</Button>}
      />
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 rounded border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 w-56"
          />
        </div>
        <span className="text-xs text-text-muted ml-auto">{filtered.length} properties</span>
      </div>
      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Property Name</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Account</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Address</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Contact</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-8 text-center text-sm text-text-muted">Loading...</td></tr>
            ) : filtered.map((l) => (
              <tr key={l.id} className="border-b border-border hover:bg-bg/50 transition-colors cursor-pointer">
                <td className="py-2.5 px-3">
                  <p className="font-medium text-text-primary">{l.name}</p>
                  <p className="text-xs text-text-muted font-mono">{l.id}</p>
                </td>
                <td className="py-2.5 px-3 text-text-secondary">{accountMap.get(l.accountId)?.name ?? l.accountId}</td>
                <td className="py-2.5 px-3 text-text-secondary">{l.address}, {l.city}, {l.state}</td>
                <td className="py-2.5 px-3 text-text-secondary">{l.contactName ?? "—"}</td>
                <td className="py-2.5 px-3">
                  <Pill color={l.status === "active" ? "success" : "default"}>{l.status}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
