import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(value: string) {
  // If the user types exactly 10 digits with no symbols, auto-format it.
  if (/^\d{10}$/.test(value)) {
    return `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
  }
  // Otherwise, just strip characters that aren't digits or phone-related symbols
  return value.replace(/[^\d\s\(\)\-+]/g, "");
}
