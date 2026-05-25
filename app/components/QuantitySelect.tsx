"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface QuantitySelectProps {
  value: number;
  onChange: (value: number) => void;
  maxQuantity: number;
  disabled?: boolean;
  label?: string;
  id?: string;
  /** Renders a compact select without a block label (for inline layouts). */
  inline?: boolean;
  className?: string;
}

const triggerStyles =
  "bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white";

export function QuantitySelect({
  value,
  onChange,
  maxQuantity,
  disabled = false,
  label = "Quantity:",
  id = "quantity",
  inline = false,
  className,
}: QuantitySelectProps) {
  const optionCount = Math.max(maxQuantity, 1);
  const options = Array.from({ length: optionCount }, (_, i) => i + 1);

  const select = (
    <Select
      value={String(value)}
      onValueChange={(v) => onChange(Number(v))}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        aria-label="Quantity"
        className={cn(
          triggerStyles,
          inline
            ? "h-9 w-24 shrink-0 px-3 text-sm"
            : "w-full",
          className,
        )}
      >
        <SelectValue placeholder={inline ? "Qty" : "Select quantity..."} />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {options.map((n) => (
          <SelectItem key={n} value={String(n)}>
            {inline ? n : `${n} ${n === 1 ? "spot" : "spots"}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (inline) {
    return select;
  }

  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label}
      </label>
      {select}
    </div>
  );
}
