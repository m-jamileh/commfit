import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../lib/utils";

interface TopbarProps {
  logo?: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

function Topbar({
  logo,
  title,
  actions,
  onSearch,
  searchPlaceholder = "Search...",
  className,
}: TopbarProps) {
  return (
    <header
      className={cn(
        "flex h-12 items-center gap-3 border-b border-border bg-surface px-4",
        className
      )}
    >
      {logo && <div className="flex items-center">{logo}</div>}
      {title && (
        <span className="font-display font-semibold text-sm text-text-primary hidden md:block">
          {title}
        </span>
      )}

      {onSearch && (
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="h-8 w-full rounded border border-border bg-bg pl-8 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {actions}
      </div>
    </header>
  );
}

export { Topbar };
