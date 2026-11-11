# ShipProof

A clickable proof of concept for a **verification layer for a $100K, 30-day, profit-based startup competition**.

Everything runs on mock data in the browser. No login, no database, no real integrations.

## The problem

"Whoever makes the most profit in 30 days wins $100K" is easy to explain and easy to game: fake customers, buying your own product, related-party deals, hidden expenses, post-deadline refunds, or an existing business entered as a new one. Self-reported numbers can't decide a prize of that size.

## The idea

Four simple pieces, built to help human judges rather than replace them:

1. **Build log**: founders record timestamped milestones with private evidence. Product and code stay secret.
2. **Financial tracker**: revenue minus all business costs equals competition profit. Sales, fees and refunds are meant to sync from the payment provider; anything else is entered manually with evidence.
3. **Verification status** on every number: Verified, Evidence submitted, Pending review, Flagged.
4. **Finalist review**: the leaderboard is provisional. Only the top 5 get a deep manual review, and prizes are paid after it.

### Where the original concept was changed, and why

| Weakness in "track revenue and expenses, most profit wins" | What the prototype does about it |
| --- | --- |
| Revenue is self-reported | A read-only payment account connection is the primary source. Manual entries count provisionally but stay unverified until a judge accepts evidence. |
| Profit rewards *hiding* costs | All costs are deducted the moment they are entered, verified or not. Finalists share bank/card statements; unusually low costs raise a review signal. |
| Self-purchases and friendly customers | Signed related-party declaration, a revenue-concentration signal, and customer spot checks for finalists. |
| An existing business in disguise | Day-1 registration plus three cheap facts: domain registration date, payment account creation date, first commit. |
| Refund everything after winning | Refunds sync as costs, and prizes are paid after a 14-day hold. |
| A "verification score" could look like it decides the winner | It is shown as "% of reported dollars verified" and labelled as completeness, not ranking. |
| A public "Flagged" label is an accusation | Judges see Flagged; the public leaderboard only ever says "In review". |
| Reviewing everyone doesn't scale | Review the top 5 (not just the top 3, so there is a replacement if someone fails). |

What it deliberately does **not** claim: automatic fraud detection. The "review signals" are five plain rules in `src/lib/metrics.ts` that point a judge at things worth a conversation. Two people colluding with real money through real accounts still need human judgment and clear disqualification rules.

## Demo script (2 minutes)

1. `/` Landing page: problem, solution, loopholes, prize split.
2. **Enter as a founder**: Alex Chen, InvoiceFlow AI, day 18. Profit $9,240, 85% verified, rank #3.
3. **Build log**: add a milestone with a (simulated) private attachment.
4. **Financials**: add a transaction and watch profit, verified % and rank change.
5. **Leaderboard**: the #1 entry has the biggest number and the least verification.
6. Switch to **Judge** in the top bar, open **Jordan Blake**: review signals, checklist, evidence. Verify or flag single transactions, then Approve / Request more information / Flag.
7. Switch to **Maya** to see how an information request looks from the founder's side.

The dark bar at the top switches persona. **Reset demo** restores the original data. Changes are saved in the visitor's own browser (localStorage) only.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build: `npm run build && npm start`.

## Share it without buying a domain

On any server with Docker (for example a Hetzner VPS):

```bash
git clone <this repo> && cd hackathon_verification_system
docker compose up -d --build
docker compose logs tunnel | grep trycloudflare.com
```

That prints a public `https://<random-words>.trycloudflare.com` link, served over HTTPS through a Cloudflare quick tunnel. No Cloudflare account, no domain and no open firewall ports are needed; the app is only reachable through the tunnel.

Things to know:

- The URL changes whenever the `tunnel` container restarts (including a server reboot). Re-run the `logs` command and resend the link.
- Quick tunnels are meant for demos and have no uptime guarantee. For a permanent address, add a domain to Cloudflare and use a named tunnel, or use Tailscale Funnel for a stable free `*.ts.net` URL.
- Anyone with the link can open it. It only contains fictional data, and pages are marked `noindex`.
- Stop sharing with `docker compose down`.

Without Docker: `npm ci && npm run build && npm start`, then in a second terminal `cloudflared tunnel --url http://localhost:3000`.

## What is mocked

| Area | In the prototype |
| --- | --- |
| Login | None. The demo bar switches persona. |
| Data | Typed mock files in `src/data`, copied into an in-browser store. |
| Payment sync | Transactions with `source: "processor"` pretend to come from Stripe. |
| File uploads | The file picker only keeps the file name. Previews are placeholders. |
| Origin facts | Domain, payment account and first commit dates are hard-coded. |
| Dates | The competition is frozen on day 18 (`src/data/competition.ts`). |

## Project layout

```
src/
  data/            Mock data. Start here to swap in real sources.
    competition.ts   Dates, prize split, finalist count, hold period
    participants.ts  Entrants, origin facts, review state
    transactions.ts  Revenue and expenses
    milestones.ts    Build logs
  lib/
    types.ts         The domain model
    metrics.ts       Profit, verified %, leaderboard, review signals (pure functions)
    store.ts         Client store + every mutation (`actions`)
  components/      UI primitives, status badges, dialogs, app shell, demo bar
  app/
    page.tsx         Landing page
    (app)/           dashboard, build-log, financials, leaderboard, admin, admin/[id]
```

Components read through `useDemo()` / `useParticipant()` and write through `actions`, so replacing the store with an API does not touch the screens.

## Production next steps

- **Authentication**: founder and judge accounts (Clerk, Auth.js or similar). Remove `demo-bar.tsx`; derive the role from the session.
- **Database**: Postgres tables mirroring `src/lib/types.ts`. Turn each function in `actions` into a server action or API route.
- **Payment provider verification**: Stripe Connect or restricted read-only API keys (plus Paddle / Lemon Squeezy). Sync charges, fees, refunds and disputes; read the account creation date. Synced rows are verified by construction.
- **File storage**: private bucket (S3 / R2) with short-lived signed URLs for judges.
- **Audit log**: append-only record of every judge action and evidence view. The "Review activity" panel is the UI for it.
- **Admin permissions**: judge vs. organiser roles, two-person approval for prize decisions, conflict-of-interest recusal.
- **Rules to write down before launch**: what counts as a cost, related-party definition, pre-start grace period, hold period, and what happens to a finalist who fails review.
