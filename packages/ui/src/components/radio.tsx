"use client";
import * as React from "react";
import { cn } from "../lib/utils";

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (v: string) => void;
}>({});

function RadioGroup({ value, onValueChange, className, children }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div role="radiogroup" className={cn("flex flex-col gap-2", className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps {
  value: string;
  id?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

function RadioGroupItem({ value, id, label, disabled, className }: RadioGroupItemProps) {
  const ctx = React.useContext(RadioGroupContext);
  const innerId = id ?? `radio-${value}`;
  const checked = ctx.value === value;
  return (
    <div className="flex items-center gap-2">
      <button
        role="radio"
        type="button"
        id={innerId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && ctx.onValueChange?.(value)}
        className={cn(
          "h-4 w-4 rounded-full border border-border bg-surface",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked && "border-primary bg-primary",
          className
        )}
      >
        {checked && (
          <span className="flex h-full w-full items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
          </span>
        )}
      </button>
      {label && (
        <label htmlFor={innerId} className="text-sm text-text-primary cursor-pointer select-none">
          {label}
        </label>
      )}
    </div>
  );
}

export { RadioGroup, RadioGroupItem };
