import type { Evidence, ExpenseCategory, Transaction, VerificationStatus } from "@/lib/types";

/**
 * Mock ledger. In production, `source: "processor"` rows come from a read-only
 * Stripe/Paddle/Lemon Squeezy sync and `source: "manual"` rows are typed in by
 * the participant and need evidence.
 *
 * The small helpers below only exist to keep the mock data readable.
 */

type Opts = { status?: VerificationStatus; manual?: boolean; evidence?: Evidence };

let seq = 0;
const nextId = () => `t${++seq}`;

function revenue(
  participantId: string,
  date: string,
  amount: number,
  description: string,
  counterparty: string,
  opts: Opts = {},
): Transaction {
  return {
    id: nextId(),
    participantId,
    type: "revenue",
    date,
    amount,
    description,
    counterparty,
    source: opts.manual ? "manual" : "processor",
    status: opts.status ?? "verified",
    evidence: opts.evidence,
  };
}

function expense(
  participantId: string,
  date: string,
  amount: number,
  category: ExpenseCategory,
  description: string,
  counterparty: string,
  opts: Opts = {},
): Transaction {
  return {
    id: nextId(),
    participantId,
    type: "expense",
    date,
    amount,
    description,
    counterparty,
    category,
    // Fees and refunds come straight from the processor; everything else is entered with a receipt.
    source: category === "Payment fees" || category === "Refunds" ? "processor" : "manual",
    status: opts.status ?? "verified",
    evidence: "evidence" in opts ? opts.evidence : { name: `${counterparty.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-receipt.pdf`, kind: "document", private: true },
  };
}

/** Several processor sales of the same plan to different customers. */
function sales(participantId: string, amount: number, description: string, rows: [date: string, customer: string][]): Transaction[] {
  return rows.map(([date, customer]) => revenue(participantId, date, amount, description, customer));
}

const doc = (name: string): Evidence => ({ name, kind: "document", private: true });

// ── Alex Chen · InvoiceFlow AI ─────────────────────────────────────────────
// Revenue $12,480 · Expenses $3,240 · Profit $9,240
const alex: Transaction[] = [
  ...sales("alex", 99, "Starter plan, monthly", [
    ["2026-10-31", "Pine & Pixel Studio"],
    ["2026-11-01", "R. Okonkwo Consulting"],
    ["2026-11-04", "Tidewater Creative"],
    ["2026-11-09", "Lumen Bookkeeping"],
  ]),
  ...sales("alex", 249, "Pro plan, monthly", [
    ["2026-10-31", "Foxglove Agency"],
    ["2026-11-01", "Marlow Design Co."],
    ["2026-11-02", "Atlas Web Works"],
    ["2026-11-02", "Greyfield Media"],
    ["2026-11-03", "Juniper Digital"],
    ["2026-11-04", "Bright Harbor PR"],
    ["2026-11-05", "Ostrander & Lee"],
    ["2026-11-06", "Studio Nomad"],
    ["2026-11-07", "Copperline Films"],
    ["2026-11-08", "Hartwell Architects"],
    ["2026-11-09", "Sable Interactive"],
    ["2026-11-10", "Quill & Co."],
  ]),
  ...sales("alex", 499, "Agency plan, monthly", [
    ["2026-11-03", "Redwood Creative Group"],
    ["2026-11-06", "Calder Marketing"],
    ["2026-11-08", "Fieldnote Partners"],
  ]),
  revenue("alex", "2026-11-10", 499, "Agency plan, paid by invoice", "Ironbridge Studio", {
    manual: true,
    status: "evidence_submitted",
    evidence: doc("ironbridge-invoice-0012.pdf"),
  }),
  revenue("alex", "2026-11-03", 1200, "Business plan, annual", "Northwind Logistics"),
  revenue("alex", "2026-11-05", 1200, "Business plan, annual", "Harbor & Finch Accounting"),
  revenue("alex", "2026-11-07", 2400, "Team plan, annual (10 seats)", "Brightside Dental Group"),
  revenue("alex", "2026-11-09", 800, "Setup and data migration", "Harbor & Finch Accounting"),
  revenue("alex", "2026-11-11", 1500, "Business plan, annual (bank transfer)", "Kestrel Freight", {
    manual: true,
    status: "pending",
  }),

  expense("alex", "2026-10-30", 500, "Advertising", "Launch campaign", "Meta Ads"),
  expense("alex", "2026-11-06", 500, "Advertising", "Retargeting campaign", "Meta Ads"),
  expense("alex", "2026-11-04", 420, "Advertising", "Search ads", "Google Ads"),
  expense("alex", "2026-10-31", 120, "APIs & software", "API usage, October", "OpenAI"),
  expense("alex", "2026-11-10", 186, "APIs & software", "API usage, November to date", "OpenAI"),
  expense("alex", "2026-10-26", 49, "Hosting", "Pro plan", "Vercel"),
  expense("alex", "2026-10-29", 299, "Contractors", "Landing page design", "Priya N. (freelance)", {
    status: "evidence_submitted",
    evidence: doc("landing-page-design-invoice.pdf"),
  }),
  expense("alex", "2026-11-05", 450, "Contractors", "Onboarding flow build", "Devon M. (freelance)"),
  expense("alex", "2026-11-11", 362, "Payment fees", "Processing fees to date", "Stripe"),
  expense("alex", "2026-11-08", 249, "Refunds", "Refund, Pro plan", "Greyfield Media"),
  expense("alex", "2026-10-24", 38, "Other", "Domain and business email", "Namecheap"),
  expense("alex", "2026-10-30", 15, "APIs & software", "Transactional email", "Postmark"),
  expense("alex", "2026-10-28", 52, "Other", "Terms and privacy templates", "Termly", { status: "pending", evidence: undefined }),
];

// ── Sarah Williams · AdCraft AI ────────────────────────────────────────────
const sarah: Transaction[] = [
  revenue("sarah", "2026-11-02", 2400, "Agency plan, annual", "Bluepeak Media"),
  revenue("sarah", "2026-11-06", 2400, "Agency plan, annual", "Stanton & Vale"),
  revenue("sarah", "2026-11-04", 1800, "Brand kit onboarding", "Oro Skincare"),
  revenue("sarah", "2026-11-08", 1500, "Creative sprint package", "Luma Fitness"),
  ...sales("sarah", 1200, "Growth plan, annual", [
    ["2026-11-01", "Peak Outdoor Supply"],
    ["2026-11-05", "Haven Home Goods"],
    ["2026-11-09", "Roast Republic"],
  ]),
  ...sales("sarah", 999, "Studio plan, quarterly", [
    ["2026-11-03", "Kindred Pets"],
    ["2026-11-07", "Verde Meal Co."],
  ]),
  revenue("sarah", "2026-11-10", 999, "Studio plan, quarterly (invoice)", "Mosaic Travel", {
    manual: true,
    status: "evidence_submitted",
    evidence: doc("mosaic-travel-invoice.pdf"),
  }),
  ...sales("sarah", 799, "Growth plan, quarterly", [
    ["2026-10-30", "Sunday Candle Co."],
    ["2026-11-02", "Fable Kids"],
    ["2026-11-06", "Northlight Optics"],
    ["2026-11-10", "Tallgrass Apparel"],
  ]),
  ...sales("sarah", 499, "Starter plan, quarterly", [
    ["2026-10-29", "Bloom & Vine"],
    ["2026-11-01", "Arc Cycles"],
    ["2026-11-05", "Saltwater Swim"],
    ["2026-11-09", "Minted Paper Co."],
  ]),
  ...sales("sarah", 399, "Starter plan, monthly", [
    ["2026-11-04", "Glow Dental"],
    ["2026-11-08", "Parcel & Post"],
  ]),
  expense("sarah", "2026-10-29", 1400, "Advertising", "Launch campaign", "Meta Ads"),
  expense("sarah", "2026-11-05", 1100, "Advertising", "Scaling campaign", "Meta Ads"),
  expense("sarah", "2026-11-03", 600, "Advertising", "Creator ads test", "TikTok Ads"),
  expense("sarah", "2026-11-10", 480, "APIs & software", "API usage", "OpenAI"),
  expense("sarah", "2026-11-10", 310, "APIs & software", "Image model usage", "Replicate"),
  expense("sarah", "2026-10-26", 79, "Hosting", "Team plan", "Vercel"),
  expense("sarah", "2026-11-02", 850, "Contractors", "Video editor, demo reels", "Luis G. (freelance)"),
  expense("sarah", "2026-11-11", 620, "Payment fees", "Processing fees to date", "Stripe"),
  expense("sarah", "2026-11-07", 399, "Refunds", "Refund, Starter plan", "Glow Dental"),
  expense("sarah", "2026-10-27", 98, "Other", "Design tools", "Figma", { status: "pending", evidence: undefined }),
];

// ── Jordan Blake · LeadHarbor ──────────────────────────────────────────────
// The intentionally suspicious entrant: most revenue is off-platform, from one
// source, with thin evidence, and almost no reported costs.
const jordan: Transaction[] = [
  revenue("jordan", "2026-10-29", 4800, "Enterprise lead package (bank transfer)", "Meridian Holdings LLC", {
    manual: true,
    status: "evidence_submitted",
    evidence: doc("meridian-invoice-001.pdf"),
  }),
  revenue("jordan", "2026-11-03", 4800, "Enterprise lead package (bank transfer)", "Meridian Holdings LLC", {
    manual: true,
    status: "pending",
  }),
  revenue("jordan", "2026-11-08", 4800, "Enterprise lead package (bank transfer)", "Meridian Holdings LLC", {
    manual: true,
    status: "pending",
  }),
  revenue("jordan", "2026-11-09", 3600, "Custom list build (bank transfer)", "MH Ventures", {
    manual: true,
    status: "pending",
  }),
  ...sales("jordan", 199, "Lead list, single", [
    ["2026-10-30", "Castell Recruiting"],
    ["2026-11-01", "Brightline Solar"],
    ["2026-11-02", "Oakmont Insurance"],
    ["2026-11-05", "Vantage Staffing"],
    ["2026-11-07", "Pioneer HVAC"],
    ["2026-11-10", "Crestview Realty"],
  ]),
  ...sales("jordan", 398, "Lead list, two-pack", [
    ["2026-11-04", "Summit Payroll"],
    ["2026-11-09", "Delta Signworks"],
  ]),
  expense("jordan", "2026-10-28", 240, "APIs & software", "Contact data credits", "Apollo"),
  expense("jordan", "2026-10-26", 29, "Hosting", "Hobby plan", "Render"),
  expense("jordan", "2026-11-11", 58, "Payment fees", "Processing fees to date", "Stripe"),
  expense("jordan", "2026-10-27", 99, "Other", "Email warm-up tool", "Instantly", { status: "pending", evidence: undefined }),
  expense("jordan", "2026-10-25", 14, "Other", "Domain renewal", "Namecheap", { status: "pending", evidence: undefined }),
];

// ── Daniel Kim · ClientMatch ───────────────────────────────────────────────
const daniel: Transaction[] = [
  revenue("daniel", "2026-11-06", 1500, "Agency retainer (invoice)", "Larkspur Studio", {
    manual: true,
    status: "evidence_submitted",
    evidence: doc("larkspur-retainer-invoice.pdf"),
  }),
  revenue("daniel", "2026-11-04", 1200, "Team plan, annual", "Hollis & Grey"),
  revenue("daniel", "2026-11-08", 900, "Placement fee", "Tandem Labs"),
  revenue("daniel", "2026-11-10", 900, "Placement fee (bank transfer)", "Wren Analytics", { manual: true, status: "pending" }),
  ...sales("daniel", 600, "Placement fee", [
    ["2026-11-02", "Fathom Apps"],
    ["2026-11-05", "Mosswood Brewing"],
    ["2026-11-07", "Kite Robotics"],
    ["2026-11-09", "Paper Lantern Games"],
  ]),
  ...sales("daniel", 300, "Freelancer Pro, annual", [
    ["2026-11-01", "S. Abara"],
    ["2026-11-03", "J. Lindqvist"],
    ["2026-11-04", "M. Duarte"],
    ["2026-11-06", "T. Nakamura"],
    ["2026-11-08", "E. Rossi"],
    ["2026-11-10", "A. Banerjee"],
  ]),
  expense("daniel", "2026-11-01", 700, "Advertising", "Sponsored posts", "LinkedIn Ads"),
  expense("daniel", "2026-11-05", 350, "Advertising", "Search ads", "Google Ads", { status: "pending", evidence: undefined }),
  expense("daniel", "2026-11-09", 95, "APIs & software", "API usage", "OpenAI"),
  expense("daniel", "2026-10-27", 40, "Hosting", "Starter plan", "Railway"),
  expense("daniel", "2026-11-03", 400, "Contractors", "Matching algorithm review", "Ines C. (freelance)", {
    status: "evidence_submitted",
  }),
  expense("daniel", "2026-11-11", 265, "Payment fees", "Processing fees to date", "Stripe"),
  expense("daniel", "2026-11-07", 300, "Refunds", "Refund, Freelancer Pro", "M. Duarte"),
];

// ── Maya Patel · LaunchKit ─────────────────────────────────────────────────
const maya: Transaction[] = [
  revenue("maya", "2026-11-05", 1500, "Newsletter sponsorship (bank transfer)", "Indie Dispatch", {
    manual: true,
    status: "evidence_submitted",
    evidence: { name: "sponsorship-email-thread.png", kind: "screenshot", private: true },
  }),
  ...sales("maya", 499, "Team license", [
    ["2026-11-03", "Outpost Labs"],
    ["2026-11-07", "Tiny Rocket Co."],
    ["2026-11-10", "Fernhill Software"],
  ]),
  ...sales("maya", 149, "Complete kit", [
    ["2026-10-30", "K. Alvarez"],
    ["2026-10-31", "D. Osei"],
    ["2026-11-01", "H. Fujita"],
    ["2026-11-02", "L. Moreau"],
    ["2026-11-04", "P. Iyer"],
    ["2026-11-06", "C. Whitlock"],
    ["2026-11-08", "N. Haddad"],
    ["2026-11-10", "B. Sorensen"],
  ]),
  ...sales("maya", 79, "Starter kit", [
    ["2026-10-30", "G. Petrov"],
    ["2026-10-31", "A. Mensah"],
    ["2026-11-01", "R. Castillo"],
    ["2026-11-03", "V. Nair"],
    ["2026-11-05", "J. Brandt"],
    ["2026-11-06", "O. Kimura"],
    ["2026-11-07", "S. Delgado"],
    ["2026-11-09", "W. Achebe"],
    ["2026-11-10", "F. Lund"],
    ["2026-11-11", "I. Romano"],
  ]),
  expense("maya", "2026-10-30", 300, "Advertising", "Promoted launch thread", "X Ads"),
  expense("maya", "2026-10-26", 20, "Hosting", "Pro plan", "Netlify"),
  expense("maya", "2026-10-28", 120, "Other", "Illustration pack license", "Envato"),
  expense("maya", "2026-11-11", 150, "Payment fees", "Processing fees to date", "Lemon Squeezy"),
  expense("maya", "2026-11-04", 149, "Refunds", "Refund, Complete kit", "L. Moreau"),
];

// ── Tom Okafor · ShelfSync ─────────────────────────────────────────────────
const tom: Transaction[] = [
  ...sales("tom", 499, "Scale plan, annual", [
    ["2026-11-06", "Harlow Home"],
    ["2026-11-10", "Bison Outfitters"],
  ]),
  ...sales("tom", 99, "Growth plan, monthly", [
    ["2026-11-02", "Clay & Kiln"],
    ["2026-11-03", "Petal Press"],
    ["2026-11-04", "Rove Leather"],
    ["2026-11-05", "Zest Pantry"],
    ["2026-11-06", "Little Finch Toys"],
    ["2026-11-07", "Ember Candleworks"],
    ["2026-11-08", "Trailhead Coffee"],
    ["2026-11-09", "Nook Stationery"],
    ["2026-11-10", "Dune Swimwear"],
    ["2026-11-11", "Moss & Stone"],
  ]),
  ...sales("tom", 29, "Starter plan, monthly", [
    ["2026-11-01", "Tin Robot Vintage"],
    ["2026-11-02", "Wild Thyme Soap"],
    ["2026-11-04", "Kettle Knits"],
    ["2026-11-05", "Paperboat Prints"],
    ["2026-11-07", "Sprout Baby"],
    ["2026-11-08", "Lark Ceramics"],
    ["2026-11-09", "Gull Bay Tackle"],
    ["2026-11-11", "Bramble Tea"],
  ]),
  expense("tom", "2026-11-01", 250, "Advertising", "App store search ads", "Shopify App Store"),
  expense("tom", "2026-10-26", 35, "Hosting", "Launch plan", "Fly.io", { status: "pending", evidence: undefined }),
  expense("tom", "2026-11-09", 40, "APIs & software", "Error monitoring", "Sentry", { status: "pending", evidence: undefined }),
  expense("tom", "2026-11-11", 85, "Payment fees", "Processing fees to date", "Shopify Billing"),
];

export const transactions: Transaction[] = [...alex, ...sarah, ...jordan, ...daniel, ...maya, ...tom];
