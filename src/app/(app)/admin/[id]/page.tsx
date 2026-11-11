"use client";

import { ArrowLeft, Check, CircleCheck, CircleDashed, Flag, MessageCircleQuestion, Pencil, RotateCcw, StickyNote, TriangleAlert, Zap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { EvidenceChip, EvidencePreview } from "@/components/evidence";
import { ReviewBadge, StatusBadge } from "@/components/status";
import { Avatar, Button, Card, CardHeader, Field, Modal, inputClass, toast } from "@/components/ui";
import { COMPETITION } from "@/data";
import { cx, dayOf, daysBeforeStart, longDate, money, shortDate } from "@/lib/format";
import { actions } from "@/lib/store";
import type { ChecklistKey, ChecklistState, Evidence } from "@/lib/types";
import { useParticipant } from "@/lib/use-participant";

const CHECKLIST: { key: ChecklistKey; label: string }[] = [
  { key: "new_business", label: "New business started during competition" },
  { key: "revenue_evidence", label: "Revenue evidence submitted" },
  { key: "expenses_documented", label: "Expenses documented" },
  { key: "transactions_reviewed", label: "Suspicious transactions reviewed" },
  { key: "final_approval", label: "Final approval" },
];

const NEXT_STATE: Record<ChecklistState, ChecklistState> = { pending: "pass", pass: "issue", issue: "pending" };

const CHECK_STYLE: Record<ChecklistState, { icon: typeof Check; className: string; label: string }> = {
  pass: { icon: CircleCheck, className: "text-emerald-700", label: "Done" },
  pending: { icon: CircleDashed, className: "text-muted", label: "Pending" },
  issue: { icon: TriangleAlert, className: "text-rose-700", label: "Needs attention" },
};

export default function ParticipantReviewPage() {
  const { id } = useParams<{ id: string }>();
  const data = useParticipant(id);
  const [preview, setPreview] = useState<{ evidence: Evidence; context: string } | null>(null);
  const [dialog, setDialog] = useState<"info" | "flag" | null>(null);
  const [note, setNote] = useState("");
  const [showAll, setShowAll] = useState(false);

  if (!data) {
    return (
      <p className="text-sm text-ink-2">
        Participant not found.{" "}
        <Link href="/admin" className="font-medium underline">
          Back to the review queue
        </Link>
      </p>
    );
  }
  const { participant, transactions, milestones, totals, signals, rank, activity } = data;

  // Unverified rows first: that is where a judge's time goes.
  const ordered = [...transactions].sort((a, b) => Number(a.status === "verified") - Number(b.status === "verified") || b.amount - a.amount);
  const visible = showAll ? ordered : ordered.slice(0, 8);
  const issueCount = signals.length + participant.judgeNotes.length;

  const evidence = [
    ...milestones.flatMap((m) => m.evidence.map((item) => ({ evidence: item, context: `Milestone: ${m.title}` }))),
    ...transactions.filter((t) => t.evidence && t.source === "manual").map((t) => ({ evidence: t.evidence!, context: `${money(t.amount)} · ${t.counterparty}` })),
  ];

  const origin = [
    { label: "Domain registered", date: participant.origin.domainRegistered },
    { label: "Payment account created", date: participant.origin.processorAccountCreated },
    { label: "First code commit", date: participant.origin.firstCommit },
  ];

  const closeDialog = () => {
    setDialog(null);
    setNote("");
  };

  return (
    <>
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="size-3.5" aria-hidden />
        Review queue
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Avatar name={participant.name} tone={participant.avatar} size="lg" />
        <div className="min-w-0 flex-1 basis-56">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">{participant.name}</h1>
            <ReviewBadge status={participant.reviewStatus} />
          </div>
          <p className="mt-0.5 text-sm text-ink-2">
            {participant.business} · {participant.tagline} · Rank #{rank}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setDialog("info")}>
            <MessageCircleQuestion className="size-4" aria-hidden />
            Request more information
          </Button>
          <Button variant="danger" onClick={() => setDialog("flag")}>
            <Flag className="size-4" aria-hidden />
            Flag for review
          </Button>
          <Button
            variant="success"
            onClick={() => {
              actions.review(participant.id, "verified");
              toast(`${participant.business} approved`);
            }}
          >
            <Check className="size-4" aria-hidden />
            Approve
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-4">
          {/* Potential issues */}
          <Card className={cx(issueCount > 0 && "border-amber-300")}>
            <CardHeader
              title="Potential issues requiring manual review"
              hint="Raised by simple rules and judge notes. These are prompts for a conversation, not findings."
            />
            {issueCount === 0 ? (
              <p className="flex items-center gap-2 px-5 py-5 text-sm text-ink-2">
                <CircleCheck className="size-4 text-emerald-700" aria-hidden />
                No review signals. Evidence still needs a human check before approval.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {signals.map((signal) => (
                  <li key={signal.id} className="flex gap-3 px-5 py-3.5">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
                    <div>
                      <p className="text-sm font-medium">{signal.title}</p>
                      <p className="num mt-0.5 text-[13px] text-ink-2">{signal.detail}</p>
                    </div>
                  </li>
                ))}
                {participant.judgeNotes.map((text) => (
                  <li key={text} className="flex gap-3 px-5 py-3.5">
                    <StickyNote className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                    <div>
                      <p className="text-sm font-medium">Judge note</p>
                      <p className="mt-0.5 text-[13px] text-ink-2">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Financial summary + ledger */}
          <Card>
            <CardHeader title="Financial summary" hint={`${totals.verifiedPct}% of reported dollars verified`} />
            <dl className="num grid grid-cols-3 divide-x divide-line border-b border-line">
              {[
                { label: "Revenue", value: money(totals.revenue) },
                { label: "Expenses", value: money(totals.expenses) },
                { label: "Profit", value: money(totals.profit) },
              ].map((item) => (
                <div key={item.label} className="px-5 py-4">
                  <dt className="text-[13px] text-muted">{item.label}</dt>
                  <dd className="mt-0.5 text-xl font-semibold tracking-tight sm:text-2xl">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <tbody className="divide-y divide-line">
                  {visible.map((t) => (
                    <tr key={t.id}>
                      <td className="num py-2.5 pr-3 pl-5 whitespace-nowrap text-ink-2">{shortDate(t.date)}</td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium">{t.counterparty}</p>
                        <p className="flex items-center gap-1 text-xs text-muted">
                          {t.source === "processor" ? <Zap className="size-3" aria-hidden /> : <Pencil className="size-3" aria-hidden />}
                          {t.source === "processor" ? "Payment account" : "Manual"} · {t.description}
                        </p>
                      </td>
                      <td className="num px-3 py-2.5 text-right font-medium whitespace-nowrap">
                        {t.type === "expense" ? "−" : "+"}
                        {money(t.amount)}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-2.5 pr-5 pl-1">
                        <div className="flex justify-end gap-1">
                          {t.status === "verified" || t.status === "flagged" ? (
                            <Button size="sm" variant="ghost" aria-label={`Undo decision for ${t.counterparty}`} title="Undo" onClick={() => actions.setTransactionStatus(t.id, t.evidence ? "evidence_submitted" : "pending")}>
                              <RotateCcw className="size-3.5" aria-hidden />
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" onClick={() => actions.setTransactionStatus(t.id, "verified")}>
                                Verify
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => actions.setTransactionStatus(t.id, "flagged")}>
                                Flag
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {ordered.length > 8 && (
              <button type="button" onClick={() => setShowAll(!showAll)} className="w-full border-t border-line px-5 py-3 text-left text-[13px] font-medium text-ink-2 hover:bg-paper/60 hover:text-ink">
                {showAll ? "Show fewer" : `Show all ${ordered.length} transactions`}
              </button>
            )}
          </Card>

          {/* Build timeline */}
          <Card>
            <CardHeader title="Build timeline" hint={`${milestones.length} milestones submitted`} />
            <ul className="divide-y divide-line">
              {milestones.map((m) => (
                <li key={m.id} className="flex flex-wrap items-start gap-x-4 gap-y-2 px-5 py-3.5">
                  <span className="num w-12 shrink-0 pt-0.5 font-mono text-xs text-muted">Day {dayOf(m.date)}</span>
                  <div className="min-w-0 flex-1 basis-60">
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="mt-0.5 text-[13px] text-ink-2">{m.description}</p>
                    {m.evidence.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.evidence.map((item) => (
                          <EvidenceChip key={item.name} evidence={item} onOpen={() => setPreview({ evidence: item, context: `Milestone: ${m.title}` })} />
                        ))}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={m.status} />
                </li>
              ))}
            </ul>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader title="Evidence" hint="Screenshots, documents and payment exports. Click to preview." />
            <div className="grid gap-2 px-5 py-4 sm:grid-cols-2">
              {evidence.map((item, index) => (
                <button
                  key={`${item.evidence.name}-${index}`}
                  type="button"
                  onClick={() => setPreview(item)}
                  className="rounded-xl border border-line px-3 py-2.5 text-left hover:border-ink/30 hover:bg-paper/50"
                >
                  <p className="truncate text-[13px] font-medium">{item.evidence.name}</p>
                  <p className="num truncate text-xs text-muted">{item.context}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader title="Verification checklist" hint="Click an item to change its state." />
            <ul className="p-2">
              {CHECKLIST.map(({ key, label }) => {
                const value = participant.checklist[key];
                const { icon: Icon, className, label: stateLabel } = CHECK_STYLE[value];
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => actions.setChecklist(participant.id, key, NEXT_STATE[value])}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-paper"
                    >
                      <Icon className={cx("size-[18px] shrink-0", className)} aria-hidden />
                      <span className="flex-1 text-sm">{label}</span>
                      <span className={cx("text-xs font-medium", className)}>{stateLabel}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Business origin" hint={`Kickoff was ${longDate(COMPETITION.startDate)}`} />
            <ul className="space-y-3 px-5 py-4">
              {origin.map((item) => {
                const early = daysBeforeStart(item.date) > COMPETITION.preStartGraceDays;
                return (
                  <li key={item.label} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-ink-2">{item.label}</span>
                    <span className="shrink-0 text-right">
                      <span className="num block font-medium">{longDate(item.date)}</span>
                      {early && (
                        <span className="num inline-flex items-center gap-1 text-xs font-medium text-amber-800">
                          <TriangleAlert className="size-3" aria-hidden />
                          {daysBeforeStart(item.date)} days before kickoff
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
              <li className="flex items-start justify-between gap-3 border-t border-line pt-3 text-sm">
                <span className="text-ink-2">Related-party declaration</span>
                <span className={cx("font-medium", !participant.relatedPartyDeclaration && "text-amber-800")}>{participant.relatedPartyDeclaration ? "Signed" : "Not signed"}</span>
              </li>
            </ul>
          </Card>

          <Card>
            <CardHeader title="Review activity" />
            {activity.length === 0 ? (
              <p className="px-5 py-4 text-[13px] text-muted">No review activity yet.</p>
            ) : (
              <ul className="space-y-3 px-5 py-4">
                {[...activity].reverse().slice(0, 8).map((entry) => (
                  <li key={entry.id} className="text-[13px]">
                    <p className="num font-mono text-[10px] tracking-widest text-muted uppercase">
                      Day {entry.day} · {entry.actor}
                    </p>
                    <p className="mt-0.5 text-ink-2">{entry.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={dialog !== null}
        onClose={closeDialog}
        title={dialog === "flag" ? "Flag for review" : "Request more information"}
        description={
          dialog === "flag"
            ? "Marks this entrant for a deeper manual review. Publicly they simply show as “In review”."
            : `${participant.name} will see this on their dashboard.`
        }
        footer={
          <>
            <Button variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={dialog === "info" && !note.trim()}
              onClick={() => {
                actions.review(participant.id, dialog === "flag" ? "flagged" : "info_requested", note.trim() || undefined);
                toast(dialog === "flag" ? `${participant.business} flagged for review` : `Request sent to ${participant.name}`);
                closeDialog();
              }}
            >
              {dialog === "flag" ? "Flag participant" : "Send request"}
            </Button>
          </>
        }
      >
        <Field label={dialog === "flag" ? "Reason" : "What do you need?"} hint={dialog === "flag" ? "Optional, judges only" : undefined}>
          <textarea
            className={`${inputClass} h-28 resize-none py-2`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
            placeholder={
              dialog === "flag"
                ? "e.g. Most revenue comes from one off-platform source"
                : "e.g. Please attach bank records for the three Meridian Holdings transfers."
            }
          />
        </Field>
      </Modal>

      <EvidencePreview evidence={preview?.evidence ?? null} context={preview?.context} onClose={() => setPreview(null)} />
    </>
  );
}
