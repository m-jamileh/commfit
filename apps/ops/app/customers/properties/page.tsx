"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import {
  PageHeader,
  Card,
  Pill,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  useLocations,
  useCreateLocation,
  mockAccounts,
} from "@commfit/ui";

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const { data: locations = [], isLoading } = useLocations();
  const createLocation = useCreateLocation();
  const accountMap = new Map(mockAccounts.map((a) => [a.id, a]));

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAccountId, setNewAccountId] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newZip, setNewZip] = useState("");
  const [newContact, setNewContact] = useState("");

  const filtered = locations.filter((l) =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.city.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate() {
    if (!newName || !newAccountId || !newAddress || !newCity || !newState) return;
    createLocation.mutate(
      { name: newName, accountId: newAccountId, address: newAddress, city: newCity, state: newState, zip: newZip || undefined, contactName: newContact || undefined },
      {
        onSuccess: () => {
          setShowCreate(false);
          setNewName(""); setNewAccountId(""); setNewAddress(""); setNewCity(""); setNewState(""); setNewZip(""); setNewContact("");
        },
      }
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Properties"
        breadcrumbs={[{ label: "Customers" }, { label: "Properties" }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            + New Property
          </Button>
        }
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

      <Modal open={showCreate} onOpenChange={setShowCreate}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>New Property</ModalTitle>
          </ModalHeader>
          <div className="space-y-3 mt-2">
            <Input label="Property Name *" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Select value={newAccountId} onValueChange={setNewAccountId}>
              <SelectTrigger label="Account *">
                <SelectValue placeholder="Select account..." />
              </SelectTrigger>
              <SelectContent>
                {mockAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input label="Address *" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
            <div className="flex gap-3">
              <Input label="City *" value={newCity} onChange={(e) => setNewCity(e.target.value)} className="flex-1" />
              <Input label="State *" value={newState} onChange={(e) => setNewState(e.target.value)} className="w-20" />
              <Input label="ZIP" value={newZip} onChange={(e) => setNewZip(e.target.value)} className="w-24" />
            </div>
            <Input label="Contact Name" value={newContact} onChange={(e) => setNewContact(e.target.value)} />
          </div>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={createLocation.isPending}>
              {createLocation.isPending ? "Creating..." : "Create Property"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
