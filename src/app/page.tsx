import { ArrowRight, CalendarClock, Check, CircleDollarSign, Copy, EyeOff, Minus, Repeat2, Scale, UserRoundCheck, Users } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ReviewBadge, StatusBadge } from "@/components/status";
import { COMPETITION, seed } from "@/data";
import { cx, money } from "@/lib/format";
import { leaderboard } from "@/lib/metrics";

const PROBLEMS = [
  { icon: Users, title: "Fake customers", text: "Accounts that exist only to push money through a checkout." },
  { icon: Repeat2, title: "Buying your own product", text: "Spend $10K of your own money, report $10K of revenue." },
  { icon: UserRoundCheck, title: "Related-party deals", text: "A friend, a relative or your other company becomes your biggest customer." },
  { icon: EyeOff, title: "Hidden expenses", text: "Ad spend and contractors paid from a personal card and never mentioned." },
  { icon: CircleDollarSign, title: "Creative profit maths", text: "Refunds issued after the deadline. Costs moved outside the 30 days." },
  { icon: Copy, title: "An old business in disguise", text: "A product with an existing customer base, relaunched under a new name." },
];

const DEFENCES = [
  {
    tactic: "Reporting revenue that never happened",
    answer: "Founders connect their payment account read-only on day 1. Synced sales verify themselves; anything typed in by hand needs evidence and stays unverified until a judge accepts it.",
  },
  {
    tactic: "Buying your own product, or getting friends to",
    answer: "Every founder signs a related-party declaration. Judges see when one source makes up most of the revenue, and spot-check finalists' customers by email.",
  },
  {
    tactic: "Leaving costs out to inflate profit",
    answer: "All business costs count, including those paid before day 1. Finalists share bank and card statements for the period, and unusually low costs are surfaced for a second look.",
  },
  {
    tactic: "Entering a business that already existed",
    answer: "Registration on day 1, plus three cheap facts: when the domain was registered, when the payment account was created, and when the first code was committed.",
  },
  {
    tactic: "Refunding customers after the prize is paid",
    answer: `Refunds and fees sync automatically, and prizes are paid after a ${COMPETITION.holdbackDays}-day hold so late refunds and chargebacks are deducted first.`,
  },
];

const LIMITS = [
  "Two people determined to collude with real money through real accounts can still get past software. The answer is signed declarations, human review and clear disqualification rules, not more automation.",
  "A founder with an existing audience has a head start. That is a fairness question for the rules, not something verification can settle.",
  "Judges' time is the scarce resource. That is why only the top five get the deep review.",
];

export default function LandingPage() {
  const board = leaderboard(seed).slice(0, 3);
  const maxPrize = COMPETITION.prizes[0].amount;

  return (
    <div className="bg-paper">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="bg-ink text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo invert />
          <div className="hidden items-center gap-7 text-sm text-white/70 md:flex">
            <a href="#problem" className="hover:text-white">The problem</a>
            <a href="#solution" className="hover:text-white">How it works</a>
            <a href="#loopholes" className="hover:text-white">Loopholes</a>
            <a href="#prizes" className="hover:text-white">Prizes</a>
          </div>
          <Link href="/dashboard" className="rounded-lg bg-white/10 px-3.5 py-2 text-sm font-medium hover:bg-white/15">
            Open the demo
          </Link>
        </nav>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-20 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] tracking-widest text-white/70 uppercase">
              <span className="size-1.5 rounded-full bg-lime" />
              Proof of concept · {COMPETITION.name}
            </p>
            <h1 className="mt-6 text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
              Profit is easy to claim. <span className="text-lime">Make it easy to prove.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70 text-pretty">
              A 30-day competition where the most profit wins $100K only works if the numbers can be trusted. ShipProof is a simple verification layer: founders
              log what they build and earn, and judges verify the few results that matter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="inline-flex h-11 items-center gap-2 rounded-xl bg-lime px-5 text-[15px] font-semibold text-ink hover:brightness-95">
                Enter as a founder <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/admin" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-5 text-[15px] font-semibold hover:bg-white/10">
                <Scale className="size-4" aria-hidden />
                Enter as a judge
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/45">No login. Everything is clickable and runs on mock data.</p>
          </div>

          {/* Live preview built from the same mock data as the app. */}
          <div className="rounded-2xl bg-white p-1.5 text-ink shadow-2xl shadow-black/40 lg:rotate-1">
            <div className="rounded-xl border border-line">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-sm font-semibold">Provisional leaderboard</p>
                <p className="num font-mono text-[10px] tracking-widest text-muted uppercase">Day {COMPETITION.currentDay} / {COMPETITION.totalDays}</p>
              </div>
              <ul className="divide-y divide-line">
                {board.map(({ participant, totals, rank }) => (
                  <li key={participant.id} className="flex items-center gap-3 px-4 py-3.5">
                    <span className="num w-4 text-sm font-semibold text-muted">{rank}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{participant.business}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8">
                          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${totals.verifiedPct}%` }} />
                        </div>
                        <span className="num w-20 text-xs text-ink-2">{totals.verifiedPct}% verified</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="num text-sm font-semibold">{money(totals.profit)}</p>
                      <ReviewBadge status={participant.reviewStatus} audience="public" className="mt-1" />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="border-t border-line bg-paper/70 px-4 py-2.5 text-xs text-ink-2">
                The biggest number on the board is also the least verified. That is the whole problem in one picture.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Problem ──────────────────────────────────────────────────────── */}
      <section id="problem" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-20">
        <p className="font-mono text-[11px] tracking-widest text-muted uppercase">The problem</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          &ldquo;Most profit wins&rdquo; is a great rule, until $100K depends on it.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-ink-2">Self-reported numbers invite six obvious moves. A credible competition needs an answer to each.</p>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white p-6">
              <Icon className="size-5 text-ink-2" aria-hidden />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-ink-2">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Solution ─────────────────────────────────────────────────────── */}
      <section id="solution" className="scroll-mt-8 border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="font-mono text-[11px] tracking-widest text-muted uppercase">The solution</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Four simple pieces. No audit firm required.</h2>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <Pillar n="01" title="Build timeline" text="Founders log milestones as they happen. Product and code stay secret; evidence is attached privately for judges.">
              <ul className="space-y-2.5">
                {[
                  ["Day 1", "Project registered"],
                  ["Day 3", "First prototype working"],
                  ["Day 6", "Public launch"],
                  ["Day 7", "First paying customer"],
                ].map(([day, label]) => (
                  <li key={day} className="flex items-center gap-3 text-sm">
                    <span className="num w-11 font-mono text-xs text-muted">{day}</span>
                    <span className="size-1.5 rounded-full bg-ink" />
                    <span className="flex-1">{label}</span>
                    <Check className="size-3.5 text-emerald-700" aria-hidden />
                  </li>
                ))}
              </ul>
            </Pillar>

            <Pillar n="02" title="Financial tracker" text="Sales, fees and refunds sync from the payment account. Other revenue and all costs are added with evidence. One formula, no interpretation.">
              <div className="num space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-2">Revenue</span><span className="font-medium">$12,480</span></div>
                <div className="flex justify-between"><span className="flex items-center gap-1 text-ink-2"><Minus className="size-3" aria-hidden />Business costs and refunds</span><span className="font-medium">$3,240</span></div>
                <div className="flex justify-between rounded-lg bg-ink px-3 py-2 text-white"><span>Competition profit</span><span className="font-semibold text-lime">$9,240</span></div>
              </div>
            </Pillar>

            <Pillar n="03" title="Verification status" text="Every number carries a plain status, so founders know what's left to do and judges know where to look. A flag is a question, not a verdict.">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="verified" />
                <StatusBadge status="evidence_submitted" />
                <StatusBadge status="pending" />
                <StatusBadge status="flagged" />
              </div>
            </Pillar>

            <Pillar n="04" title="Finalist review" text={`The leaderboard stays provisional. On day 30 the top ${COMPETITION.finalistCount} get a manual review before any prize is awarded.`}>
              <ul className="space-y-2 text-sm">
                {["Revenue evidence", "Customer legitimacy", "Business start date", "Expense accuracy", "Related-party transactions"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="flex size-4 items-center justify-center rounded border border-ink/25">
                      <Check className="size-3" aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Pillar>
          </div>
        </div>
      </section>

      {/* ── Loopholes ────────────────────────────────────────────────────── */}
      <section id="loopholes" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-20">
        <p className="font-mono text-[11px] tracking-widest text-muted uppercase">Stress test</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">We tried to cheat it first.</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink-2">Each obvious way to game a profit competition, and the cheapest thing that makes it not worth trying.</p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-white">
          {DEFENCES.map((row, index) => (
            <div key={row.tactic} className={cx("grid gap-2 px-6 py-5 md:grid-cols-[1fr_1.6fr] md:gap-8", index > 0 && "border-t border-line")}>
              <p className="font-semibold">{row.tactic}</p>
              <p className="text-sm text-ink-2">{row.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-ink/25 p-6">
          <h3 className="font-semibold">What it does not claim to do</h3>
          <p className="mt-1 text-sm text-ink-2">ShipProof helps human judges. It does not detect fraud by itself, and it should not pretend to.</p>
          <ul className="mt-4 space-y-2.5">
            {LIMITS.map((text) => (
              <li key={text} className="flex gap-3 text-sm text-ink-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-ink/40" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Prizes ───────────────────────────────────────────────────────── */}
      <section id="prizes" className="scroll-mt-8 border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl items-end gap-12 px-5 py-20 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] tracking-widest text-muted uppercase">Prize structure</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Three founders get paid. First place still takes the most.</h2>
            <p className="mt-4 text-lg text-ink-2">
              Splitting the $100K rewards more than one real business and softens the all-or-nothing pressure that pushes people to cheat. Every prize is paid
              only after final verification.
            </p>
            <p className="mt-6 flex items-center gap-2 text-sm text-ink-2">
              <CalendarClock className="size-4" aria-hidden />
              Day {COMPETITION.totalDays} freeze, finalist review, {COMPETITION.holdbackDays}-day refund hold, then payout.
            </p>
          </div>
          <div className="flex items-end gap-3" role="img" aria-label="Prize split: first $60,000, second $30,000, third $10,000">
            {[COMPETITION.prizes[1], COMPETITION.prizes[0], COMPETITION.prizes[2]].map((prize) => (
              <div key={prize.place} className="flex-1 text-center">
                <p className="num text-2xl font-semibold tracking-tight sm:text-3xl">{money(prize.amount)}</p>
                <p className="mt-0.5 mb-3 text-sm text-ink-2">{prize.label}</p>
                <div
                  className={cx("rounded-t-xl", prize.place === 1 ? "bg-ink" : "bg-ink/15")}
                  style={{ height: `${Math.max(28, (prize.amount / maxPrize) * 220)}px` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="rounded-3xl bg-ink px-6 py-14 text-center text-white sm:px-12">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">See it from both sides in two minutes.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/65">
            Start as Alex, a founder on day {COMPETITION.currentDay}. Then switch to the judge view and open Jordan&apos;s entry to see what a flagged review looks like.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className="inline-flex h-11 items-center gap-2 rounded-xl bg-lime px-5 text-[15px] font-semibold text-ink hover:brightness-95">
              Founder dashboard <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/leaderboard" className="inline-flex h-11 items-center rounded-xl border border-white/20 px-5 text-[15px] font-semibold hover:bg-white/10">
              Leaderboard
            </Link>
            <Link href="/admin/jordan" className="inline-flex h-11 items-center rounded-xl border border-white/20 px-5 text-[15px] font-semibold hover:bg-white/10">
              A flagged review
            </Link>
          </div>
        </div>
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <Logo />
          <p>Proof of concept. All people, businesses and figures are fictional.</p>
        </footer>
      </section>
    </div>
  );
}

function Pillar({ n, title, text, children }: { n: string; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-paper/60 p-6">
      <p className="font-mono text-xs text-muted">{n}</p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-ink-2">{text}</p>
      <div className="mt-6 flex flex-1 flex-col justify-center rounded-xl border border-line bg-white p-4">{children}</div>
    </div>
  );
}
