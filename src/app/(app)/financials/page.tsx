"use client";

import { Equal, Minus, Pencil, Plus, Zap } from "lucide-react";
import { useState } from "react";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { StatusBadge } from "@/components/status";
import { Button, Card, CardHeader, PageHeader } from "@/components/ui";
import { cx, money, shortDate } from "@/lib/format";
import type { TransactionType } from "@/lib/types";
import { useParticipant } from "@/lib/use-participant";

export default function FinancialsPage() {
  const data = useParticipant();
  const [tab, setTab] = useState<TransactionType>("revenue");
  const [adding, setAdding] = useState(false);
  if (!data) return null;
  const { participant, transactions, totals } = data;

  const rows = transactions.filter((t) => t.type === tab);
  const counts = { revenue: transactions.filter((t) => t.type === "revenue").length, expense: transactions.filter((t) => t.type === "expense").length };
  const maxCategory = totals.byCategory[0]?.amount ?? 1;

  return (
    <>
      <PageHeader
        title="Financials"
        subtitle="Sales, fees and refunds sync from your payment account. Add anything else by hand, with evidence."
        action={
          <Button variant="primary" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Add transaction
          </Button>
        }
      />

      {/* The one formula the whole competition runs on. */}
      <Card className="overflow-hidden">
        <div className="grid items-stretch sm:grid-cols-[1fr_auto_1fr_auto_1.15fr]">
          <div className="p-5">
            <p className="text-[13px] font-medium text-muted">Revenue</p>
            <p className="num mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{money(totals.revenue)}</p>
            <p className="num mt-1 text-[13px] text-ink-2">{money(totals.verifiedRevenue)} verified so far</p>
          </div>
          <span className="hidden items-center text-muted sm:flex" aria-hidden>
            <Minus className="size-5" />
          </span>
          <div className="border-t border-line p-5 sm:border-t-0">
            <p className="text-[13px] font-medium text-muted">
              <span className="sm:hidden">− </span>Costs and refunds
            </p>
            <p className="num mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{money(totals.expenses)}</p>
            <p className="mt-1 text-[13px] text-ink-2">Every business cost counts</p>
          </div>
          <span className="hidden items-center text-muted sm:flex" aria-hidden>
            <Equal className="size-5" />
          </span>
          <div className="bg-ink p-5 text-white sm:ml-5">
            <p className="text-[13px] font-medium text-white/60">
              <span className="sm:hidden">= </span>Competition profit
            </p>
            <p className="num mt-1 text-2xl font-semibold tracking-tight text-lime sm:text-3xl">{money(totals.profit)}</p>
            <p className="mt-1 text-[13px] text-white/60">Provisional until final verification</p>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_20rem]">
        <Card className="min-w-0">
          <div className="flex items-center gap-1 border-b border-line px-3 pt-2">
            {(["revenue", "expense"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTab(type)}
                aria-pressed={tab === type}
                className={cx(
                  "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium",
                  tab === type ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
                )}
              >
                {type === "revenue" ? "Revenue" : "Expenses"}
                <span className="num rounded-full bg-ink/6 px-1.5 text-xs text-ink-2">{counts[type]}</span>
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="px-5 py-2.5 font-medium">Date</th>
                  <th className="px-3 py-2.5 font-medium">Description</th>
                  <th className="px-3 py-2.5 font-medium">{tab === "revenue" ? "Customer" : "Vendor"}</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line border-t border-line">
                {rows.map((t) => (
                  <tr key={t.id} className="hover:bg-paper/50">
                    <td className="num px-5 py-3 whitespace-nowrap text-ink-2">{shortDate(t.date)}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{t.description}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                        {t.source === "processor" ? <Zap className="size-3" aria-hidden /> : <Pencil className="size-3" aria-hidden />}
                        {t.source === "processor" ? "Synced from payment account" : "Entered manually"}
                        {t.category && ` · ${t.category}`}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-ink-2">{t.counterparty}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="num px-5 py-3 text-right font-medium whitespace-nowrap">
                      {tab === "expense" && "−"}
                      {money(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="self-start">
          <CardHeader title="Where the money went" hint="Costs by category" />
          <ul className="space-y-3.5 px-5 py-4">
            {totals.byCategory.map(({ category, amount }) => (
              <li key={category} title={`${category}: ${money(amount)} (${Math.round((amount / totals.expenses) * 100)}% of costs)`}>
                <div className="num flex justify-between text-[13px]">
                  <span className="text-ink-2">{category}</span>
                  <span className="font-medium">{money(amount)}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-ink/6">
                  <div className="h-full rounded-full bg-ink/70" style={{ width: `${Math.max(2, (amount / maxCategory) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="border-t border-line px-5 py-3 text-xs text-muted">
            Your own time isn&apos;t a cost. Anything you paid for to run the business is, even if you paid before day 1.
          </p>
        </Card>
      </div>

      {/* Remount on open so the dialog starts on the tab being viewed. */}
      <AddTransactionDialog key={`${tab}-${adding}`} participantId={participant.id} open={adding} onClose={() => setAdding(false)} initialType={tab} />
    </>
  );
}
