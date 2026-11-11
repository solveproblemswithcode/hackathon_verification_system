import { COMPETITION } from "@/data/competition";
import { daysBeforeStart, money } from "./format";
import type { DemoState, ExpenseCategory, Participant, Transaction } from "./types";

/**
 * All the numbers in the UI are derived here from raw transactions, so there is
 * one definition of "competition profit" and one of "verified %".
 */

export interface Totals {
  revenue: number;
  expenses: number;
  profit: number;
  /** Share of reported dollars (revenue + costs) that is verified, 0-100. */
  verifiedPct: number;
  verifiedRevenue: number;
  byCategory: { category: ExpenseCategory; amount: number }[];
}

const sum = (rows: Transaction[]) => rows.reduce((total, row) => total + row.amount, 0);

export function totals(rows: Transaction[]): Totals {
  const revenueRows = rows.filter((row) => row.type === "revenue");
  const expenseRows = rows.filter((row) => row.type === "expense");
  const revenue = sum(revenueRows);
  const expenses = sum(expenseRows);
  const verified = sum(rows.filter((row) => row.status === "verified"));
  const reported = revenue + expenses;

  const categories = new Map<ExpenseCategory, number>();
  for (const row of expenseRows) {
    const category = row.category ?? "Other";
    categories.set(category, (categories.get(category) ?? 0) + row.amount);
  }

  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    verifiedPct: reported === 0 ? 0 : Math.round((verified / reported) * 100),
    verifiedRevenue: sum(revenueRows.filter((row) => row.status === "verified")),
    byCategory: [...categories.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
  };
}

export interface LeaderboardRow {
  participant: Participant;
  totals: Totals;
  rank: number;
  isFinalist: boolean;
}

/** Ranked by reported competition profit. Provisional by design. */
export function leaderboard(state: Pick<DemoState, "participants" | "transactions">): LeaderboardRow[] {
  return state.participants
    .map((participant) => ({
      participant,
      totals: totals(state.transactions.filter((row) => row.participantId === participant.id)),
    }))
    .sort((a, b) => b.totals.profit - a.totals.profit)
    .map((row, index) => ({ ...row, rank: index + 1, isFinalist: index < COMPETITION.finalistCount }));
}

export interface ReviewSignal {
  id: string;
  title: string;
  detail: string;
}

/**
 * Review signals: simple, explainable rules that point a judge at things worth
 * a look. They do not decide anything and they are not fraud detection.
 * Thresholds are deliberately plain so an organiser can tune them.
 */
export function reviewSignals(participant: Participant, rows: Transaction[]): ReviewSignal[] {
  const signals: ReviewSignal[] = [];
  const t = totals(rows);
  const revenueRows = rows.filter((row) => row.type === "revenue");

  // 1. Revenue concentrated in one source.
  const bySource = new Map<string, number>();
  for (const row of revenueRows) bySource.set(row.counterparty, (bySource.get(row.counterparty) ?? 0) + row.amount);
  const top = [...bySource.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top && t.revenue >= 2000 && top[1] / t.revenue >= 0.35) {
    signals.push({
      id: "concentration",
      title: "Revenue concentrated in one source",
      detail: `${Math.round((top[1] / t.revenue) * 100)}% of revenue (${money(top[1])}) comes from ${top[0]}.`,
    });
  }

  // 2. Large payments that never touched the connected payment processor.
  const offPlatform = revenueRows.filter((row) => row.source === "manual" && row.amount >= 1000 && row.status !== "verified");
  const offPlatformTotal = sum(offPlatform);
  if (offPlatform.length >= 2 || (t.revenue > 0 && offPlatformTotal / t.revenue >= 0.3)) {
    const withoutEvidence = offPlatform.filter((row) => !row.evidence).length;
    signals.push({
      id: "off-platform",
      title: "Large off-platform payments not yet verified",
      detail: `${offPlatform.length} payment${offPlatform.length === 1 ? "" : "s"} totalling ${money(offPlatformTotal)} were entered manually${
        withoutEvidence ? `; ${withoutEvidence} ha${withoutEvidence === 1 ? "s" : "ve"} no evidence attached` : ""
      }.`,
    });
  }

  // 3. Business activity that appears to predate the competition.
  const early = [
    { label: "Domain registered", date: participant.origin.domainRegistered },
    { label: "Payment account created", date: participant.origin.processorAccountCreated },
  ].filter((item) => daysBeforeStart(item.date) > COMPETITION.preStartGraceDays);
  if (early.length > 0) {
    signals.push({
      id: "predates",
      title: "Activity may predate the competition",
      detail: early.map((item) => `${item.label} ${daysBeforeStart(item.date)} days before kickoff`).join(". ") + ".",
    });
  }

  // 4. Costs that look too low to be complete (profit is inflated by leaving costs out).
  if (t.revenue >= 5000 && t.expenses / t.revenue < 0.05) {
    signals.push({
      id: "low-costs",
      title: "Reported costs unusually low",
      detail: `Costs are ${Math.round((t.expenses / t.revenue) * 100)}% of revenue. Bank and card statements can confirm nothing was left out.`,
    });
  }

  // 5. Missing related-party declaration.
  if (!participant.relatedPartyDeclaration) {
    signals.push({
      id: "declaration",
      title: "Related-party declaration not signed",
      detail: "The participant has not yet declared whether any customer is a friend, relative, employer or their own company.",
    });
  }

  return signals;
}
