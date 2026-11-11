"use client";

import { useSyncExternalStore } from "react";
import { COMPETITION, seed } from "@/data";
import type {
  ActivityEntry,
  ChecklistKey,
  ChecklistState,
  DemoState,
  Milestone,
  ReviewStatus,
  Role,
  Transaction,
  VerificationStatus,
} from "./types";

/**
 * A tiny client-side store. State lives in memory and is mirrored to
 * localStorage so a demo survives page reloads. Nothing is sent to a server.
 *
 * To make the prototype real, replace the bodies of `actions` with API calls;
 * components only talk to `useDemo()` and `actions`.
 */

const STORAGE_KEY = "shipproof-demo-v1";

let state: DemoState = seed;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) state = JSON.parse(saved) as DemoState;
  } catch {
    // Storage unavailable or corrupted: fall back to the seed data.
  }
}

function set(update: (current: DemoState) => DemoState) {
  state = update(state);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore: the demo still works in memory.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  load();
  return state;
}

export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, getSnapshot, () => seed);
}

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

function log(participantId: string, actor: ActivityEntry["actor"], text: string): ActivityEntry {
  return { id: newId("a"), participantId, day: COMPETITION.currentDay, actor, text };
}

const updateParticipant = (current: DemoState, id: string, patch: (p: DemoState["participants"][number]) => DemoState["participants"][number]) =>
  current.participants.map((p) => (p.id === id ? patch(p) : p));

export const actions = {
  setRole(role: Role) {
    if (state.role !== role) set((s) => ({ ...s, role }));
  },

  viewAs(participantId: string) {
    set((s) => ({ ...s, role: "participant", participantId }));
  },

  addMilestone(input: Omit<Milestone, "id" | "status">) {
    const status: VerificationStatus = input.evidence.length > 0 ? "evidence_submitted" : "pending";
    set((s) => ({
      ...s,
      milestones: [...s.milestones, { ...input, id: newId("m"), status }],
      activity: [...s.activity, log(input.participantId, "Participant", `Added milestone "${input.title}".`)],
    }));
  },

  addTransaction(input: Omit<Transaction, "id" | "status" | "source">) {
    // Manually entered rows are never auto-verified: with evidence they wait for a judge, without they are pending.
    const status: VerificationStatus = input.evidence ? "evidence_submitted" : "pending";
    set((s) => ({
      ...s,
      transactions: [...s.transactions, { ...input, id: newId("t"), source: "manual", status }],
      activity: [
        ...s.activity,
        log(input.participantId, "Participant", `Added ${input.type} of $${input.amount.toLocaleString("en-US")} (${input.counterparty}).`),
      ],
    }));
  },

  setTransactionStatus(id: string, status: VerificationStatus) {
    set((s) => {
      const row = s.transactions.find((t) => t.id === id);
      if (!row) return s;
      const verb = status === "verified" ? "Verified" : status === "flagged" ? "Flagged" : "Reset";
      return {
        ...s,
        transactions: s.transactions.map((t) => (t.id === id ? { ...t, status } : t)),
        activity: [...s.activity, log(row.participantId, "Judge", `${verb} $${row.amount.toLocaleString("en-US")} from ${row.counterparty}.`)],
      };
    });
  },

  setChecklist(participantId: string, key: ChecklistKey, value: ChecklistState) {
    set((s) => ({
      ...s,
      participants: updateParticipant(s, participantId, (p) => ({ ...p, checklist: { ...p.checklist, [key]: value } })),
    }));
  },

  /** Approve, flag, or request information. The three judge decisions. */
  review(participantId: string, status: Extract<ReviewStatus, "verified" | "flagged" | "info_requested">, note?: string) {
    set((s) => ({
      ...s,
      participants: updateParticipant(s, participantId, (p) => {
        if (status === "verified") {
          return {
            ...p,
            reviewStatus: status,
            infoRequest: undefined,
            checklist: {
              new_business: "pass",
              revenue_evidence: "pass",
              expenses_documented: "pass",
              transactions_reviewed: "pass",
              final_approval: "pass",
            },
          };
        }
        if (status === "flagged") {
          return { ...p, reviewStatus: status, checklist: { ...p.checklist, final_approval: "issue" } };
        }
        return { ...p, reviewStatus: status, infoRequest: note, checklist: { ...p.checklist, final_approval: "pending" } };
      }),
      activity: [
        ...s.activity,
        log(
          participantId,
          "Judge",
          status === "verified"
            ? "Approved. Verification complete."
            : status === "flagged"
              ? `Flagged for manual review${note ? `: ${note}` : "."}`
              : `Requested more information: ${note}`,
        ),
      ],
    }));
  },

  /** Participant replies to an information request (simulated). */
  respondToRequest(participantId: string) {
    set((s) => ({
      ...s,
      participants: updateParticipant(s, participantId, (p) => ({ ...p, reviewStatus: "pending_review", infoRequest: undefined })),
      activity: [...s.activity, log(participantId, "Participant", "Responded to the information request with new evidence.")],
    }));
  },

  reset() {
    set((s) => ({ ...seed, role: s.role, participantId: s.participantId }));
  },
};
