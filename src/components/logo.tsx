import { cx } from "@/lib/format";

/** Wordmark with a "stamp" check. Pass `invert` on dark backgrounds. */
export function Logo({ invert, className }: { invert?: boolean; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight", invert ? "text-white" : "text-ink", className)}>
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <rect width="24" height="24" rx="7" className={invert ? "fill-lime" : "fill-ink"} />
        <path d="M7 12.5l3.2 3.2L17 9" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={invert ? "stroke-ink" : "stroke-lime"} />
      </svg>
      ShipProof
    </span>
  );
}
