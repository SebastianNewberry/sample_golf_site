import type { ReactNode } from "react";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

export type CartButtonStatus = "idle" | "adding" | "success";

/**
 * Stacks every label in one grid cell so the button keeps a constant width
 * and never goes blank while switching between states.
 */
export function CartButtonLabel({
  status,
  idleLabel = "Add to Cart",
  addingLabel = "Adding...",
  successLabel = "Added!",
  iconClassName = "h-4 w-4",
  className,
}: {
  status: CartButtonStatus;
  idleLabel?: ReactNode;
  addingLabel?: ReactNode;
  successLabel?: ReactNode;
  iconClassName?: string;
  className?: string;
}) {
  const layer = (visible: boolean) =>
    cn(
      "col-start-1 row-start-1 flex items-center justify-center gap-2 transition-[opacity,transform] duration-200 ease-out",
      visible ? "opacity-100 scale-100" : "opacity-0 scale-95",
    );

  return (
    <span className={cn("grid", className)}>
      <span className={layer(status === "idle")} aria-hidden={status !== "idle"}>
        <ShoppingCart className={iconClassName} />
        {idleLabel}
      </span>
      <span className={layer(status === "adding")} aria-hidden={status !== "adding"}>
        <Loader2 className={cn(iconClassName, "animate-spin")} />
        {addingLabel}
      </span>
      <span className={layer(status === "success")} aria-hidden={status !== "success"}>
        <Check className={iconClassName} />
        {successLabel}
      </span>
    </span>
  );
}
