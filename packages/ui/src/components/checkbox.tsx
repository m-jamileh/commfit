"use client";
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & { label?: string }
>(({ className, label, id, ...props }, ref) => {
  const checkId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex items-center gap-2">
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkId}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-border bg-surface",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-accent-foreground",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <Check className="h-3 w-3" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          htmlFor={checkId}
          className="text-sm text-text-primary cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
        >
          {label}
        </label>
      )}
    </div>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
