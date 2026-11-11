"use client";

import { ArrowRight, CircleCheck, CreditCard, FileSignature, Globe, Info, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { ReviewBadge, StatusBadge } from "@/components/status";
import { Button, Card, CardHeader, Meter, PageHeader, buttonClass, toast } from "@/components/ui";
import { COMPETITION } from "@/data";
import { cx, dayOf, longDate, money } from "@/lib/format";
import { actions } from "@/lib/store";
import { useParticipant } from "@/lib/use-participant";

export default function DashboardPage() {
  const data = useParticipant();
  if (!data) return null;
  const { participant, totals, milestones, transactions, rank, isFinalist } = data;

  const daysLeft = COMPETITION.totalDays - COMPETITION.currentDay;
  const openItems = [
    ...transactions.filter((t) => t.status !== "verified").map((t) => ({
      id: t.id,
      label: `${money(t.amount)} · ${t.counterparty}`,
      detail: t.evidence ? "Waiting for a judge to check your evidence" : `Attach ${t.type === "revenue" ? "an invoice or bank record" : "a receipt"}`,
      status: t.status,
      href: "/financials",
    })),
    ...milestones.filter((m) => m.status !== "verified").map((m) => ({
      id: m.id,
      label: m.title,
      detail: m.evidence.length ? "Waiting for a judge to check your evidence" : "Attach evidence to this milestone",
      status: m.status,
      href: "/build-log",
    })),
  ];

  return (
    <>
      <PageHeader
        title={participant.business}
        subtitle={participant.tagline}
        action={<ReviewBadge status={participant.reviewStatus} audience="public" className="!px-2.5 !py-1 !text-[13px]" />}
      />

      {participant.infoRequest && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4">
          <MessageCircleQuestion className="size-5 shrink-0 text-sky-700" aria-hidden />
          <div className="min-w-0 flex-1 basis-64">
            <p className="text-sm font-semibold text-sky-950">The judges have asked for more information</p>
            <p className="mt-0.5 text-sm text-sky-900">{participant.infoRequest}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              actions.respondToRequest(participant.id);
              toast("Response sent to the judges");
            }}
          >
            Upload and respond
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-[13px] font-medium text-muted">Competition progress</p>
          <p className="num mt-2 text-3xl font-semibold tracking-tight">
            Day {COMPETITION.currentDay} <span className="text-lg font-medium text-muted">of {COMPETITION.totalDays}</span>
          </p>
          <div className="mt-4 flex gap-[3px]" role="img" aria-label={`Day ${COMPETITION.currentDay} of ${COMPETITION.totalDays}`}>
            {Array.from({ length: COMPETITION.totalDays }, (_, index) => (
              <span
                key={index}
                className={cx("h-5 flex-1 rounded-[2px]", index + 1 < COMPETITION.currentDay ? "bg-ink" : index + 1 === COMPETITION.currentDay ? "bg-lime ring-1 ring-ink" : "bg-ink/10")}
              />
            ))}
          </div>
          <p className="mt-3 text-[13px] text-ink-2">{daysLeft} days until final submission</p>
        </Card>

        <Card className="p-5">
          <p className="text-[13px] font-medium text-muted">Competition profit</p>
          <p className="num mt-2 text-3xl font-semibold tracking-tight">{money(totals.profit)}</p>
          <dl className="num mt-4 space-y-1.5 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-ink-2">Revenue</dt>
              <dd className="font-medium">{money(totals.revenue)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-2">Costs and refunds</dt>
              <dd className="font-medium">−{money(totals.expenses)}</dd>
            </div>
          </dl>
          <Link href="/financials" className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium hover:underline">
            Open financials <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Card>

        <Card className="p-5">
          <p className="text-[13px] font-medium text-muted">Verification</p>
          <p className="num mt-2 text-3xl font-semibold tracking-tight">
            {totals.verifiedPct}% <span className="text-lg font-medium text-muted">verified</span>
          </p>
          <Meter value={totals.verifiedPct} label="Share of reported dollars verified" className="mt-4 !h-2" />
          <p className="mt-3 flex gap-1.5 text-[13px] text-ink-2">
            <Info className="mt-0.5 size-3.5 shrink-0 text-muted" aria-hidden />
            Not a score. It shows how much of what you&apos;ve reported is already backed by evidence.
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-[13px] font-medium text-muted">Provisional rank</p>
          <p className="num mt-2 text-3xl font-semibold tracking-tight">
            #{rank} <span className="text-lg font-medium text-muted">of {COMPETITION.entrants}</span>
          </p>
          <p className="mt-4 text-[13px] text-ink-2">
            {isFinalist
              ? `You're inside the top ${COMPETITION.finalistCount}. If that holds on day 30 you enter final verification.`
              : `The top ${COMPETITION.finalistCount} on day 30 enter final verification.`}
          </p>
          <Link href="/leaderboard" className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium hover:underline">
            View leaderboard <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="min-w-0">
          <CardHeader
            title="Left to verify"
            hint={openItems.length ? "Closing these out now makes final review fast if you finish in the top five." : undefined}
          />
          {openItems.length === 0 ? (
            <p className="flex items-center gap-2 px-5 py-8 text-sm text-ink-2">
              <CircleCheck className="size-4 text-emerald-700" aria-hidden />
              Everything you&apos;ve reported is verified.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {openItems.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="flex items-center gap-3 px-5 py-3 hover:bg-paper/60">
                    <div className="min-w-0 flex-1">
                      <p className="num truncate text-sm font-medium">{item.label}</p>
                      <p className="truncate text-[13px] text-muted">{item.detail}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </Link>
                </li>
              ))}
              {openItems.length > 6 && <li className="px-5 py-3 text-[13px] text-muted">and {openItems.length - 6} more</li>}
            </ul>
          )}
        </Card>

        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader title="Trusted sources" hint="The less you have to prove by hand, the better." />
            <ul className="space-y-3 px-5 py-4 text-sm">
              <li className="flex items-start gap-3">
                <CreditCard className="mt-0.5 size-4 text-muted" aria-hidden />
                <div className="flex-1">
                  <p className="font-medium">Payment account connected</p>
                  <p className="text-[13px] text-muted">Read-only. Created {longDate(participant.origin.processorAccountCreated)}. Sales, fees and refunds sync automatically.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Globe className="mt-0.5 size-4 text-muted" aria-hidden />
                <div className="flex-1">
                  <p className="font-medium">{participant.origin.domain}</p>
                  <p className="text-[13px] text-muted">Domain registered {longDate(participant.origin.domainRegistered)}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileSignature className="mt-0.5 size-4 text-muted" aria-hidden />
                <div className="flex-1">
                  <p className="font-medium">Related-party declaration</p>
                  <p className="text-[13px] text-muted">
                    {participant.relatedPartyDeclaration ? "Signed. You confirmed no customer is you, family, or a company you control." : "Not signed yet. Required before final review."}
                  </p>
                </div>
              </li>
            </ul>
          </Card>

          <Card>
            <CardHeader
              title="Latest milestones"
              action={
                <Link href="/build-log" className={buttonClass("ghost", "sm")}>
                  Build log
                </Link>
              }
            />
            <ul className="divide-y divide-line">
              {milestones.slice(-3).reverse().map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="num w-12 shrink-0 font-mono text-xs text-muted">Day {dayOf(m.date)}</span>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{m.title}</p>
                  <StatusBadge status={m.status} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
