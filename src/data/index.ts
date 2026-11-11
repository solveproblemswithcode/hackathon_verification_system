import type { ActivityEntry, DemoState } from "@/lib/types";
import { milestones } from "./milestones";
import { participants } from "./participants";
import { transactions } from "./transactions";

export { COMPETITION } from "./competition";

/** Review history shown on the judge's participant page (an audit log in production). */
const activity: ActivityEntry[] = [
  { id: "a1", participantId: "sarah", day: 15, actor: "Judge", text: "Spot-checked 6 customers by email. All confirmed." },
  { id: "a2", participantId: "sarah", day: 16, actor: "Judge", text: "Approved. Verification complete." },
  { id: "a3", participantId: "jordan", day: 16, actor: "System", text: "Raised review signals from the reported data." },
  { id: "a4", participantId: "jordan", day: 17, actor: "Judge", text: "Flagged for manual review." },
  { id: "a5", participantId: "maya", day: 17, actor: "Judge", text: "Requested more information about the Indie Dispatch sponsorship." },
  { id: "a6", participantId: "daniel", day: 17, actor: "System", text: "Entered the review queue (top 5 by reported profit)." },
];

/** The starting state of the demo. "Reset demo" returns to exactly this. */
export const seed: DemoState = {
  participants,
  milestones,
  transactions,
  activity,
  role: "participant",
  participantId: "alex",
};
