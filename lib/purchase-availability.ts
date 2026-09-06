export const PROGRAM_NO_LONGER_AVAILABLE = "Program no longer available";

export function getPurchaseBlockReason({
  isProgramActive,
  noSessions,
  needsSelection,
  selectionLabel = "Please select a session from the dropdown above",
}: {
  isProgramActive: boolean;
  noSessions: boolean;
  needsSelection: boolean;
  selectionLabel?: string;
}): string | null {
  if (!isProgramActive) return PROGRAM_NO_LONGER_AVAILABLE;
  if (noSessions) return "No sessions currently available";
  if (needsSelection) return selectionLabel;
  return null;
}
