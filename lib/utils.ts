import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PHONE_PARTIAL_PATTERNS = [
  /^$/,
  /^\($/,
  /^\(\d{1,3}$/,
  /^\(\d{3}\)$/,
  /^\(\d{3}\) $/,
  /^\(\d{3}\) \d{1,3}$/,
  /^\(\d{3}\) \d{3}$/,
  /^\(\d{3}\) \d{3}-$/,
  /^\(\d{3}\) \d{3}-\d{1,4}$/,
] as const;

export function formatPhoneNumberFromDigits(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Formats a phone value from digits (used when loading saved values). */
export function formatPhoneNumber(value: string) {
  return formatPhoneNumberFromDigits(value);
}

/**
 * Formats phone input while typing. Auto-inserts symbols when entering digits,
 * but allows manual "(", ")", "-", and spaces when digits haven't changed.
 */
export function formatPhoneNumberInput(
  newValue: string,
  previousValue = "",
): string {
  const sanitized = newValue.replace(/[^\d()\- \s]/g, "").slice(0, 14);
  const newDigits = sanitized.replace(/\D/g, "").slice(0, 10);
  const oldDigits = previousValue.replace(/\D/g, "");

  if (newDigits !== oldDigits) {
    return formatPhoneNumberFromDigits(newDigits);
  }

  if (PHONE_PARTIAL_PATTERNS.some((pattern) => pattern.test(sanitized))) {
    return sanitized;
  }

  return formatPhoneNumberFromDigits(newDigits);
}

/**
 * Formats a number or string into a standard price format "1,000.00"
 */
export function formatPrice(value: string | number): string {
  if (!value && value !== 0) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00";
  
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
