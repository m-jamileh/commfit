"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import {
  PageHeader,
  Card,
  Pill,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  useAccounts,
  useCreateAccount,
} from "@commfit/ui";

export default function AccountsPage() {
  const [search, setSearch] = useState("");
  const { data: accounts = [], isLoading } = useAccounts();
  const createAccount = useCreateAccount();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");

  const filtered = accounts.filter((a) =>
    !search ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.billingEmail.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate() {
    if (!newName || !newEmail) return;
    createAccount.mutate(
      { name: newName, billingEmail: newEmail, billingPhone: newPhone || undefined, city: newCity || undefined, state: newState || undefined },
      {
        onSuccess: () => {
          setShowCreate(false);
          setNewName(""); setNewEmail(""); setNewPhone(""); setNewCity(""); setNewState("");
        },
      }
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Accounts"
        breadcrumbs={[{ label: "Customers" }, { label: "Accounts" }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            + New Account
          </Button>
        }
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

      <Modal open={showCreate} onOpenChange={setShowCreate}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>New Account</ModalTitle>
          </ModalHeader>
          <div className="space-y-3 mt-2">
            <Input label="Account Name *" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input label="Billing Email *" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <Input label="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            <div className="flex gap-3">
              <Input label="City" value={newCity} onChange={(e) => setNewCity(e.target.value)} className="flex-1" />
              <Input label="State" value={newState} onChange={(e) => setNewState(e.target.value)} className="w-20" />
            </div>
          </div>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={createAccount.isPending}>
              {createAccount.isPending ? "Creating..." : "Create Account"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
