"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { ReviewBadge } from "@/components/status";
import { Avatar, Card, Meter, PageHeader } from "@/components/ui";
import { COMPETITION } from "@/data";
import { cx, money } from "@/lib/format";
import { leaderboard } from "@/lib/metrics";
import { useDemo } from "@/lib/store";

const STEPS = [
  { when: `Day ${COMPETITION.totalDays}`, title: "Numbers freeze", text: "Final submissions lock. No new transactions or milestones." },
  { when: "Week after", title: "Finalist review", text: `Judges manually verify the top ${COMPETITION.finalistCount}: revenue, customers, start date, costs.` },
  { when: `${COMPETITION.holdbackDays}-day hold`, title: "Refund window", text: "Late refunds and chargebacks are deducted before anything is paid." },
  { when: "Then", title: "Prizes awarded", text: "If a finalist doesn't pass, the next verified founder moves up." },
];

export default function LeaderboardPage() {
  const state = useDemo();
  const rows = leaderboard(state);
  const isAdmin = state.role === "admin";

  return (
    <>
      <PageHeader
        title="Provisional leaderboard"
        subtitle={`${COMPETITION.name} · Day ${COMPETITION.currentDay} of ${COMPETITION.totalDays} · ranked by reported competition profit`}
      />

      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden />
        <p className="text-sm text-amber-950">
          <strong className="font-semibold">Rankings are provisional.</strong> Finalists must pass verification before prizes are awarded. A high
          position with little verified revenue is a claim, not a result.
        </p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="w-16 px-5 py-3 font-medium">Rank</th>
              <th className="px-3 py-3 font-medium">Business</th>
              <th className="px-3 py-3 text-right font-medium">Competition profit</th>
              <th className="w-56 px-3 py-3 pl-8 font-medium">Verified</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Prize if verified</th>
            </tr>
          </thead>
          <tbody className="border-t border-line">
            {rows.map(({ participant, totals, rank }) => {
              const prize = COMPETITION.prizes.find((p) => p.place === rank);
              const isMe = !isAdmin && participant.id === state.participantId;
              return (
                <Fragment key={participant.id}>
                  <tr className={cx("border-b border-line last:border-0", isMe && "bg-lime/25")}>
                    <td className="num px-5 py-4 text-lg font-semibold">{rank}</td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={participant.name} tone={participant.avatar} />
                        <div className="min-w-0">
                          <p className="font-medium">
                            {isAdmin ? (
                              <Link href={`/admin/${participant.id}`} className="hover:underline">
                                {participant.business}
                              </Link>
                            ) : (
                              participant.business
                            )}
                            {isMe && <span className="ml-2 rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-lime uppercase">You</span>}
                          </p>
                          <p className="text-[13px] text-muted">{participant.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="num px-3 py-4 text-right text-base font-semibold">{money(totals.profit)}</td>
                    <td className="px-3 py-4 pl-8">
                      <div className="flex items-center gap-3">
                        <Meter value={totals.verifiedPct} label={`${participant.business} verified share`} className="flex-1" />
                        <span className="num w-10 text-right text-[13px] font-medium">{totals.verifiedPct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <ReviewBadge status={participant.reviewStatus} audience={isAdmin ? "judge" : "public"} />
                    </td>
                    <td className="num px-5 py-4 text-right text-ink-2">{prize ? money(prize.amount) : "–"}</td>
                  </tr>
                  {rank === COMPETITION.finalistCount && rows.length > rank && (
                    <tr>
                      <td colSpan={6} className="border-b border-line bg-paper/70 px-5 py-2">
                        <div className="flex items-center gap-3 font-mono text-[10px] tracking-widest text-muted uppercase">
                          <span className="h-px flex-1 border-t border-dashed border-ink/25" />
                          Finalist line · top {COMPETITION.finalistCount} enter final verification
                          <span className="h-px flex-1 border-t border-dashed border-ink/25" />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        <p className="num border-t border-line px-5 py-3 text-xs text-muted">
          Showing the top {rows.length} of {COMPETITION.entrants} entrants. &ldquo;Verified&rdquo; is the share of reported dollars backed by accepted evidence.
        </p>
      </Card>

      <h2 className="mt-10 mb-3 text-sm font-semibold">How a provisional rank becomes a prize</h2>
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="rounded-2xl border border-line bg-white p-4">
            <p className="font-mono text-[10px] tracking-widest text-muted uppercase">
              {index + 1} · {step.when}
            </p>
            <p className="mt-2 text-sm font-semibold">{step.title}</p>
            <p className="mt-1 text-[13px] text-ink-2">{step.text}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
