import { CircleCheck, CircleDashed, Clock, FileCheck2, Flag, MessageCircleQuestion } from "lucide-react";
import { cx } from "@/lib/format";
import type { ReviewStatus, VerificationStatus } from "@/lib/types";

/** One place that defines how every status looks and reads. Always icon + label, never colour alone. */

const pill = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap";

const tones = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  red: "border-rose-200 bg-rose-50 text-rose-800",
  gray: "border-line bg-paper text-ink-2",
};

export const VERIFICATION: Record<VerificationStatus, { label: string; tone: keyof typeof tones; icon: typeof Clock; help: string }> = {
  verified: { label: "Verified", tone: "green", icon: CircleCheck, help: "Matched to a trusted source or accepted by a judge." },
  evidence_submitted: { label: "Evidence submitted", tone: "amber", icon: FileCheck2, help: "Evidence attached and waiting for a judge." },
  pending: { label: "Pending review", tone: "blue", icon: Clock, help: "Reported, with nothing to check it against yet." },
  flagged: { label: "Flagged", tone: "red", icon: Flag, help: "A judge wants a closer look. Not a verdict." },
};

export function StatusBadge({ status, className }: { status: VerificationStatus; className?: string }) {
  const { label, tone, icon: Icon, help } = VERIFICATION[status];
  return (
    <span title={help} className={cx(pill, tones[tone], className)}>
      <Icon className="size-3" aria-hidden />
      {label}
    </span>
  );
}

/** How a review status reads to judges (direct) and to the public (neutral, never accusatory). */
export const REVIEW: Record<ReviewStatus, { judge: string; publicLabel: string; tone: keyof typeof tones; icon: typeof Clock }> = {
  in_progress: { judge: "Not in queue", publicLabel: "Tracking", tone: "gray", icon: CircleDashed },
  pending_review: { judge: "Pending", publicLabel: "In review", tone: "amber", icon: Clock },
  info_requested: { judge: "Info requested", publicLabel: "In review", tone: "blue", icon: MessageCircleQuestion },
  verified: { judge: "Verified", publicLabel: "Verified", tone: "green", icon: CircleCheck },
  flagged: { judge: "Flagged", publicLabel: "In review", tone: "red", icon: Flag },
};

export function ReviewBadge({ status, audience = "judge", className }: { status: ReviewStatus; audience?: "judge" | "public"; className?: string }) {
  const { judge, publicLabel, tone, icon: Icon } = REVIEW[status];
  // The public never sees "Flagged": a flag is a prompt for a conversation, not a finding.
  const publicTone = status === "flagged" || status === "info_requested" ? "amber" : tone;
  return (
    <span className={cx(pill, tones[audience === "judge" ? tone : publicTone], className)}>
      <Icon className="size-3" aria-hidden />
      {audience === "judge" ? judge : publicLabel}
    </span>
  );
}
