"use client";
import Link from "next/link";
import { MapPin, Package, FileText } from "lucide-react";
import {
  PageHeader,
  Card,
  useLocations,
  useEquipment,
  useContracts,
} from "@commfit/ui";

const DEMO_ACCOUNT_ID = "acc-001";

export default function CustomerPropertiesPage() {
  const { data: locations = [], isLoading } = useLocations(DEMO_ACCOUNT_ID);
  const { data: allEquipment = [] } = useEquipment({ accountId: DEMO_ACCOUNT_ID });
  const { data: contracts = [] } = useContracts({ accountId: DEMO_ACCOUNT_ID });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Properties"
        description="Your managed fitness facilities"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-sm text-text-muted col-span-3">Loading...</p>
        ) : locations.map((loc) => {
          const equipCount = allEquipment.filter((e) => e.locationId === loc.id).length;
          const contractCount = contracts.filter(
            (c) => c.propertyIds?.includes(loc.id) && c.status === "signed"
          ).length;

          return (
            <Link key={loc.id} href={`/properties/${loc.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="mb-3">
                  <h3 className="font-semibold text-text-primary">{loc.name}</h3>
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {loc.address}, {loc.city}, {loc.state}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-text-secondary">
                    <Package className="h-3.5 w-3.5 text-text-muted" />
                    <span>{equipCount} units</span>
                  </div>
                  <div className="flex items-center gap-1 text-text-secondary">
                    <FileText className="h-3.5 w-3.5 text-text-muted" />
                    <span>{contractCount} contracts</span>
                  </div>
                </div>

                {loc.contactName && (
                  <p className="text-xs text-text-muted mt-2">Contact: {loc.contactName}</p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
