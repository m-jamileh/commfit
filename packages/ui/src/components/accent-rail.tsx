import * as React from "react";
import { cn } from "../lib/utils";

interface AccentRailProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

function AccentRail({ label, className, children, ...props }: AccentRailProps) {
  return (
    <div
      className={cn("border-l-2 border-accent pl-3 py-0.5", className)}
      {...props}
    >
      {label && (
        <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

export { AccentRail };
