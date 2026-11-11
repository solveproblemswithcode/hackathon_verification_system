/** Competition-level settings. The demo is frozen on day 18 so the story never drifts. */
export const COMPETITION = {
  name: "The $100K Build",
  startDate: "2026-10-25", // day 1
  totalDays: 30,
  currentDay: 18,
  today: "2026-11-11",
  entrants: 142,
  /** How many top-ranked entrants go through final verification. */
  finalistCount: 5,
  /** Days after the deadline before prizes are paid (refunds and chargebacks land in this window). */
  holdbackDays: 14,
  /** Grace period: a domain or payment account may be created this many days before kickoff. */
  preStartGraceDays: 7,
  prizes: [
    { place: 1, label: "1st place", amount: 60000 },
    { place: 2, label: "2nd place", amount: 30000 },
    { place: 3, label: "3rd place", amount: 10000 },
  ],
} as const;
