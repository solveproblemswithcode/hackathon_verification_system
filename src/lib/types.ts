/**
 * Domain model for the prototype.
 * Everything in src/data conforms to these types, so swapping mock data for a
 * database or a payment-provider sync only has to produce these shapes.
 */

/** Status of a single piece of evidence-backed data (a transaction or milestone). */
export type VerificationStatus =
  | "verified" // matched to a trusted source or accepted by a judge
  | "evidence_submitted" // participant attached evidence, not yet looked at
  | "pending" // reported, nothing to check it against yet
  | "flagged"; // a judge wants a closer look

/** Where a participant stands in the judges' review. */
export type ReviewStatus =
  | "in_progress" // competing, no review yet
  | "pending_review" // in the judges' queue
  | "info_requested" // judges asked the participant for something
  | "verified" // passed review
  | "flagged"; // potential issues, needs manual review

export type EvidenceKind = "screenshot" | "document" | "export" | "link";

export interface Evidence {
  name: string;
  kind: EvidenceKind;
  /** Private evidence is visible to judges only. */
  private: boolean;
}

export type MilestoneCategory = "Product" | "Launch" | "Customer" | "Revenue" | "Other";

export interface Milestone {
  id: string;
  participantId: string;
  date: string; // ISO yyyy-mm-dd
  title: string;
  description: string;
  category: MilestoneCategory;
  evidence: Evidence[];
  status: VerificationStatus;
}

export type TransactionType = "revenue" | "expense";

export type ExpenseCategory =
  | "Advertising"
  | "Hosting"
  | "APIs & software"
  | "Contractors"
  | "Payment fees"
  | "Refunds"
  | "Other";

/** "processor" = synced read-only from the payment provider. "manual" = typed in by the participant. */
export type TransactionSource = "processor" | "manual";

export interface Transaction {
  id: string;
  participantId: string;
  type: TransactionType;
  date: string;
  amount: number; // whole dollars, always positive
  description: string;
  /** Customer for revenue, vendor for expenses. */
  counterparty: string;
  category?: ExpenseCategory;
  source: TransactionSource;
  status: VerificationStatus;
  evidence?: Evidence;
}

export type ChecklistKey =
  | "new_business"
  | "revenue_evidence"
  | "expenses_documented"
  | "transactions_reviewed"
  | "final_approval";

export type ChecklistState = "pass" | "pending" | "issue";

export interface Participant {
  id: string;
  name: string;
  business: string;
  tagline: string;
  /** Tailwind classes for the avatar chip. */
  avatar: string;
  /** Origin signals: cheap, checkable facts about when the business started. */
  origin: {
    domain: string;
    domainRegistered: string;
    processorAccountCreated: string;
    firstCommit: string;
  };
  processorConnected: boolean;
  relatedPartyDeclaration: boolean;
  reviewStatus: ReviewStatus;
  checklist: Record<ChecklistKey, ChecklistState>;
  /** Observations written by a judge (not computed). */
  judgeNotes: string[];
  /** Latest open request from the judges, shown to the participant. */
  infoRequest?: string;
}

export interface ActivityEntry {
  id: string;
  participantId: string;
  day: number;
  actor: "Judge" | "Participant" | "System";
  text: string;
}

export type Role = "participant" | "admin";

export interface DemoState {
  participants: Participant[];
  milestones: Milestone[];
  transactions: Transaction[];
  activity: ActivityEntry[];
  role: Role;
  /** The participant currently being impersonated in the demo. */
  participantId: string;
}
