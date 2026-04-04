import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatTicketId(ticketId: string): string {
  // Format as EYF-XXXX-XXXX for display
  const clean = ticketId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (clean.length >= 8) {
    return `EYF-${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
  }
  return `EYF-${clean}`;
}
