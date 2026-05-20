import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const pillVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-none",
  {
    variants: {
      pillColor: {
        default: "bg-border text-text-secondary",
        primary: "bg-primary/10 text-primary",
        accent: "bg-accent/10 text-accent",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        danger: "bg-danger/10 text-danger",
        info: "bg-info/10 text-info",
      },
    },
    defaultVariants: {
      pillColor: "default",
    },
  }
);

type PillColor = "default" | "primary" | "accent" | "success" | "warning" | "danger" | "info";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: PillColor;
}

function Pill({ className, color = "default", ...props }: PillProps) {
  return (
    <span
      className={cn(pillVariants({ pillColor: color }), className)}
      {...props}
    />
  );
}

export { Pill, pillVariants };
