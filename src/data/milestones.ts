import type { Evidence, Milestone, MilestoneCategory, VerificationStatus } from "@/lib/types";

/** Mock build logs. In production this is a `milestones` table with files in object storage. */

let seq = 0;

function m(
  participantId: string,
  date: string,
  category: MilestoneCategory,
  title: string,
  description: string,
  status: VerificationStatus,
  evidence: Evidence[] = [],
): Milestone {
  return { id: `m${++seq}`, participantId, date, category, title, description, status, evidence };
}

const shot = (name: string, isPrivate = true): Evidence => ({ name, kind: "screenshot", private: isPrivate });
const doc = (name: string): Evidence => ({ name, kind: "document", private: true });
const exp = (name: string): Evidence => ({ name, kind: "export", private: true });
const link = (name: string, isPrivate = false): Evidence => ({ name, kind: "link", private: isPrivate });

export const milestones: Milestone[] = [
  // Alex Chen · InvoiceFlow AI
  m("alex", "2026-10-25", "Other", "Project registered", "Registered InvoiceFlow AI, signed the entry declaration and connected Stripe in read-only mode.", "verified", [
    doc("entry-declaration-signed.pdf"),
    exp("stripe-account-created.json"),
  ]),
  m("alex", "2026-10-27", "Product", "First prototype working", "Reads an invoice PDF and drafts a polite payment reminder. Tested on my own old invoices.", "verified", [
    shot("prototype-reminder-draft.png"),
    link("Private repo: first commit", true),
  ]),
  m("alex", "2026-10-30", "Launch", "Public launch", "Landing page and checkout live. Posted on LinkedIn and two agency-owner communities.", "verified", [
    link("invoiceflow.ai"),
    shot("launch-post-linkedin.png", false),
  ]),
  m("alex", "2026-10-31", "Customer", "First paying customer", "Foxglove Agency signed up for Pro within a day of launch.", "verified", [exp("stripe-charge-foxglove.csv")]),
  m("alex", "2026-11-03", "Revenue", "First annual business contract", "Northwind Logistics bought the annual Business plan after a 20-minute demo call.", "verified", [
    exp("stripe-charge-northwind.csv"),
  ]),
  m("alex", "2026-11-07", "Product", "Shipped accounting integrations", "Two-way sync with QuickBooks and Xero. This was the most requested feature in week one.", "evidence_submitted", [
    shot("integrations-settings.png"),
  ]),
  m("alex", "2026-11-10", "Customer", "Reached 25 paying customers", "25 active paying accounts across four plans.", "pending", [exp("customers-export-nov-10.csv")]),

  // Sarah Williams · AdCraft AI
  m("sarah", "2026-10-25", "Other", "Project registered", "Registered AdCraft AI and connected Stripe.", "verified", [doc("entry-declaration-signed.pdf")]),
  m("sarah", "2026-10-27", "Product", "Generator MVP", "Upload a logo and product photo, get 12 ad variations.", "verified", [shot("generator-mvp.png")]),
  m("sarah", "2026-10-29", "Launch", "Launched with paid ads", "Launched to e-commerce founders with a Meta campaign.", "verified", [link("adcraft.ai"), shot("ads-manager-launch.png")]),
  m("sarah", "2026-10-29", "Customer", "First paying customer", "Bloom & Vine bought the Starter plan on launch day.", "verified", [exp("stripe-charge-bloom-vine.csv")]),
  m("sarah", "2026-11-06", "Revenue", "Crossed $10K revenue", "Two agency annual plans in the same week.", "verified", [exp("stripe-balance-nov-06.csv")]),
  m("sarah", "2026-11-09", "Product", "Brand kit feature shipped", "Saved fonts, colours and tone of voice per brand.", "verified", [shot("brand-kit.png")]),

  // Jordan Blake · LeadHarbor
  m("jordan", "2026-10-25", "Other", "Project registered", "Registered LeadHarbor.", "evidence_submitted", [doc("entry-form.pdf")]),
  m("jordan", "2026-10-27", "Launch", "Product launched", "Site live and taking orders.", "pending", [link("leadharbor.io")]),
  m("jordan", "2026-10-29", "Revenue", "First enterprise deal", "Closed Meridian Holdings on an enterprise lead package.", "evidence_submitted", [doc("meridian-invoice-001.pdf")]),
  m("jordan", "2026-11-09", "Revenue", "Passed $19K revenue", "Repeat enterprise orders plus self-serve sales.", "pending"),

  // Daniel Kim · ClientMatch
  m("daniel", "2026-10-25", "Other", "Project registered", "Registered ClientMatch.", "verified", [doc("entry-declaration-signed.pdf")]),
  m("daniel", "2026-10-29", "Product", "Matching prototype", "Briefs in, ranked shortlist of freelancers out.", "verified", [shot("shortlist-view.png")]),
  m("daniel", "2026-11-01", "Launch", "Launched to waitlist", "Opened to 180 people who joined the waitlist in week one.", "verified", [link("clientmatch.co"), shot("waitlist-email.png")]),
  m("daniel", "2026-11-02", "Customer", "First placement fee", "Fathom Apps hired a designer through the platform.", "evidence_submitted", [exp("stripe-charge-fathom.csv")]),
  m("daniel", "2026-11-08", "Customer", "10 successful placements", "Ten briefs matched and paid.", "pending"),

  // Maya Patel · LaunchKit
  m("maya", "2026-10-25", "Other", "Project registered", "Registered LaunchKit.", "verified", [doc("entry-declaration-signed.pdf")]),
  m("maya", "2026-10-28", "Product", "Kit contents finished", "42 templates, 6 checklists and a launch-day runbook.", "verified", [shot("kit-contents.png")]),
  m("maya", "2026-10-30", "Launch", "Launched on X and Product Hunt", "Finished #4 product of the day.", "verified", [link("Product Hunt launch page"), shot("ph-ranking.png", false)]),
  m("maya", "2026-11-05", "Revenue", "First sponsorship", "Indie Dispatch sponsored the companion newsletter.", "evidence_submitted", [shot("sponsorship-email-thread.png")]),

  // Tom Okafor · ShelfSync
  m("tom", "2026-10-25", "Other", "Project registered", "Registered ShelfSync.", "verified", [doc("entry-declaration-signed.pdf")]),
  m("tom", "2026-10-31", "Product", "Two-channel sync working", "Shopify and Etsy stock levels stay in sync within 30 seconds.", "verified", [shot("sync-dashboard.png")]),
  m("tom", "2026-11-01", "Launch", "Listed on the Shopify App Store", "App approved and listed.", "verified", [link("Shopify App Store listing")]),
  m("tom", "2026-11-06", "Customer", "First annual customer", "Harlow Home moved to the Scale plan.", "pending"),
];
