"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface SidebarProps {
  sections: SidebarSection[];
  activePath?: string;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  logo?: React.ReactNode;
  className?: string;
}

function Sidebar({
  sections,
  activePath,
  collapsed = false,
  onCollapse,
  logo,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-surface transition-all duration-200",
        collapsed ? "w-14" : "w-56",
        className
      )}
    >
      {/* Logo area */}
      <div
        className={cn(
          "flex items-center border-b border-border",
          collapsed ? "justify-center h-12 px-2" : "h-12 px-4"
        )}
      >
        {logo && (
          <div className={cn(collapsed ? "scale-90" : "")}>
            {logo}
          </div>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4 px-2">
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && !collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = activePath === item.href || activePath?.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded px-2 py-1.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/8 text-primary"
                          : "text-text-secondary hover:bg-primary/5 hover:text-text-primary",
                        collapsed && "justify-center"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-accent" : "")} />
                      {!collapsed && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                      {!collapsed && item.badge !== undefined && (
                        <span className="ml-auto rounded-full bg-accent/10 text-accent text-xs px-1.5 py-0.5 min-w-[1.25rem] text-center">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      {onCollapse && (
        <div className="border-t border-border p-2">
          <button
            onClick={() => onCollapse(!collapsed)}
            className="flex w-full items-center justify-center rounded p-1.5 text-text-muted hover:bg-primary/5 hover:text-text-primary transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </aside>
  );
}

export { Sidebar };
