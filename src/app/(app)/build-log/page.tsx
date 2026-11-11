"use client";

import { Lock, Plus } from "lucide-react";
import { useState } from "react";
import { AddMilestoneDialog } from "@/components/add-milestone-dialog";
import { EvidenceChip, EvidencePreview } from "@/components/evidence";
import { StatusBadge } from "@/components/status";
import { Button, Card, PageHeader } from "@/components/ui";
import { COMPETITION } from "@/data";
import { dayOf, shortDate } from "@/lib/format";
import type { Evidence } from "@/lib/types";
import { useParticipant } from "@/lib/use-participant";

export default function BuildLogPage() {
  const data = useParticipant();
  const [adding, setAdding] = useState(false);
  const [preview, setPreview] = useState<Evidence | null>(null);
  if (!data) return null;
  const { participant, milestones } = data;

  return (
    <>
      <PageHeader
        title="Build log"
        subtitle="A timestamped record of what you built and when. It shows judges the business was created during the competition."
        action={
          <Button variant="primary" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Add milestone
          </Button>
        }
      />

      <p className="mb-6 flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[13px] text-ink-2">
        <Lock className="size-3.5 shrink-0 text-muted" aria-hidden />
        Your product and code stay yours. Only milestone titles can appear publicly; private evidence is visible to judges alone.
      </p>

      <ol className="relative">
        <span className="absolute top-2 bottom-8 left-[27px] w-px bg-line" aria-hidden />
        {[...milestones].reverse().map((m) => (
          <li key={m.id} className="relative flex gap-4 pb-4">
            <div className="z-10 flex w-14 shrink-0 flex-col items-center rounded-xl border border-line bg-white py-2 shadow-xs self-start">
              <span className="font-mono text-[9px] tracking-widest text-muted uppercase">Day</span>
              <span className="num text-lg leading-tight font-semibold">{dayOf(m.date)}</span>
            </div>
            <Card className="min-w-0 flex-1 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-ink/6 px-1.5 py-0.5 text-xs font-medium text-ink-2">{m.category}</span>
                <span className="text-xs text-muted">{shortDate(m.date)}</span>
                <StatusBadge status={m.status} className="ml-auto" />
              </div>
              <h2 className="mt-2 text-[15px] font-semibold">{m.title}</h2>
              {m.description && <p className="mt-1 text-sm text-ink-2">{m.description}</p>}
              {m.evidence.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.evidence.map((item) => (
                    <EvidenceChip key={item.name} evidence={item} onOpen={() => setPreview(item)} />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-muted">No evidence attached yet.</p>
              )}
            </Card>
          </li>
        ))}
        <li className="relative flex items-center gap-4">
          <span className="z-10 flex w-14 justify-center">
            <span className="size-2.5 rounded-full bg-ink" />
          </span>
          <span className="text-[13px] text-muted">Competition kicked off {shortDate(COMPETITION.startDate)}</span>
        </li>
      </ol>

      <AddMilestoneDialog participantId={participant.id} open={adding} onClose={() => setAdding(false)} />
      <EvidencePreview evidence={preview} onClose={() => setPreview(null)} />
    </>
  );
}
