import { COMPETITION } from "@/data/competition";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_MS = 86_400_000;

const toUtc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

export function money(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(amount)).toLocaleString("en-US")}`;
}

/** "2026-11-03" → "Nov 3" (adds the year when it is not the competition year). */
export function shortDate(iso: string): string {
  const [y, mo, d] = iso.split("-").map(Number);
  const base = `${MONTHS[mo - 1]} ${d}`;
  return y === Number(COMPETITION.startDate.slice(0, 4)) ? base : `${base}, ${y}`;
}

export function longDate(iso: string): string {
  const [y, mo, d] = iso.split("-").map(Number);
  return `${MONTHS[mo - 1]} ${d}, ${y}`;
}

/** Competition day number for a date (day 1 = start date). Can be zero or negative for earlier dates. */
export function dayOf(iso: string): number {
  return Math.round((toUtc(iso) - toUtc(COMPETITION.startDate)) / DAY_MS) + 1;
}

export function daysBeforeStart(iso: string): number {
  return Math.round((toUtc(COMPETITION.startDate) - toUtc(iso)) / DAY_MS);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
