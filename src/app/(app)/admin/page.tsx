"use client";

import { ChevronRight, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { ReviewBadge } from "@/components/status";
import { Avatar, Card, Meter, PageHeader } from "@/components/ui";
import { COMPETITION } from "@/data";
import { money } from "@/lib/format";
import { leaderboard, reviewSignals } from "@/lib/metrics";
import { useDemo } from "@/lib/store";
import type { ReviewStatus } from "@/lib/types";

export default function AdminPage() {
  const state = useDemo();
  const rows = leaderboard(state).map((row) => ({
    ...row,
    signals: reviewSignals(row.participant, state.transactions.filter((t) => t.participantId === row.participant.id)),
  }));
  const count = (...statuses: ReviewStatus[]) => rows.filter((row) => statuses.includes(row.participant.reviewStatus)).length;

  const tiles = [
    { label: "Awaiting review", value: count("pending_review", "in_progress") },
    { label: "Flagged", value: count("flagged") },
    { label: "Info requested", value: count("info_requested") },
    { label: "Verified", value: count("verified") },
  ];

  return (
    <>
      <PageHeader
        title="Review queue"
        subtitle={`Only top-ranked entrants need a human look. ${COMPETITION.entrants} founders are competing; these ${rows.length} currently lead on reported profit.`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label} className="p-5">
            <p className="text-[13px] font-medium text-muted">{tile.label}</p>
            <p className="num mt-1 text-3xl font-semibold tracking-tight">{tile.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="w-14 px-5 py-3 font-medium">Rank</th>
              <th className="px-3 py-3 font-medium">Participant</th>
              <th className="px-3 py-3 text-right font-medium">Reported profit</th>
              <th className="w-44 px-3 py-3 pl-8 font-medium">Verified</th>
              <th className="px-3 py-3 font-medium">Review signals</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line border-t border-line">
            {rows.map(({ participant, totals, rank, signals }) => (
              <tr key={participant.id} className="group relative hover:bg-paper/60">
                <td className="num px-5 py-4 font-semibold">{rank}</td>
                <td className="px-3 py-4">
                  <Link href={`/admin/${participant.id}`} className="flex items-center gap-3 after:absolute after:inset-0">
                    <Avatar name={participant.name} tone={participant.avatar} />
                    <span className="min-w-0">
                      <span className="block font-medium">{participant.name}</span>
                      <span className="block text-[13px] text-muted">{participant.business}</span>
                    </span>
                  </Link>
                </td>
                <td className="num px-3 py-4 text-right font-semibold">{money(totals.profit)}</td>
                <td className="px-3 py-4 pl-8">
                  <div className="flex items-center gap-3">
                    <Meter value={totals.verifiedPct} label={`${participant.business} verified share`} className="flex-1" />
                    <span className="num w-9 text-right text-[13px] font-medium">{totals.verifiedPct}%</span>
                  </div>
                </td>
                <td className="px-3 py-4">
                  {signals.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-amber-800">
                      <TriangleAlert className="size-3.5" aria-hidden />
                      {signals.length} to review
                    </span>
                  ) : (
                    <span className="text-[13px] text-muted">None</span>
                  )}
                </td>
                <td className="px-3 py-4">
                  <ReviewBadge status={participant.reviewStatus} />
                </td>
                <td className="px-3 py-4 text-muted">
                  <ChevronRight className="size-4 transition group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="mt-4 max-w-3xl text-[13px] text-muted">
        Review signals are simple rules (one source making up most of the revenue, large payments outside the payment account, activity before kickoff, very low
        costs). They point judges at things worth a conversation. They never decide an outcome on their own.
      </p>
    </>
  );
}
