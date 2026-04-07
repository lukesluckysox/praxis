import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ts));
}

export function formatDateShort(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(ts));
}

export function getTensionLabel(poleA: string, poleB: string): string {
  return `${poleA} ↔ ${poleB}`;
}

export function parseJsonArray<T>(json: string): T[] {
  try {
    return JSON.parse(json) as T[];
  } catch {
    return [];
  }
}
