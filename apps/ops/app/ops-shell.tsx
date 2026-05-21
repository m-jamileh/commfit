"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Briefcase,
  FileText,
  Building2,
  Home,
  Dumbbell,
  Users,
  Package,
  Receipt,
  BarChart3,
  ScrollText,
  Percent,
  Mail,
} from "lucide-react";
import {
  Sidebar,
  CommFitQueryProvider,
  type SidebarSection,
} from "@commfit/ui";

const NAV_SECTIONS: SidebarSection[] = [
  {
    title: "Operations",
    items: [
      { label: "Overview", href: "/overview", icon: LayoutDashboard },
      { label: "Dispatch", href: "/dispatch", icon: MapPin },
      { label: "Jobs", href: "/jobs", icon: Briefcase },
      { label: "Quotes", href: "/quotes", icon: FileText },
    ],
  },
  {
    title: "Customers",
    items: [
      { label: "Accounts", href: "/customers/accounts", icon: Building2 },
      { label: "Properties", href: "/customers/properties", icon: Home },
      { label: "Equipment", href: "/customers/equipment", icon: Dumbbell },
    ],
  },
  {
    title: "Workforce",
    items: [
      { label: "Technicians", href: "/workforce/technicians", icon: Users },
      { label: "Parts & Inventory", href: "/workforce/parts", icon: Package },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Invoices", href: "/finance/invoices", icon: Receipt },
      { label: "Reports", href: "/finance/reports", icon: BarChart3 },
      { label: "Contracts", href: "/finance/contracts", icon: ScrollText },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Commission Rules", href: "/settings/commission", icon: Percent },
      { label: "Email Inbox", href: "/settings/email-inbox", icon: Mail },
    ],
  },
];

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded bg-accent flex items-center justify-center">
        <span className="text-xs font-bold text-white">CF</span>
      </div>
      <span className="font-display font-semibold text-sm text-text-primary">Comm-Fit</span>
    </div>
  );
}

export function OpsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <CommFitQueryProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          sections={NAV_SECTIONS}
          activePath={pathname}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          logo={<Logo />}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex h-12 items-center border-b border-border bg-surface px-4 gap-3 shrink-0">
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">D</span>
              </div>
              <span className="text-sm text-text-secondary hidden md:block">Dispatcher</span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-5">
            {children}
          </main>
        </div>
      </div>
    </CommFitQueryProvider>
  );
}
