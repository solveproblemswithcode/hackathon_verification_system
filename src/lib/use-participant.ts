"use client";

import { useMemo } from "react";
import { leaderboard, reviewSignals, totals } from "./metrics";
import { useDemo } from "./store";

/** Everything a screen needs about one participant, derived from the store. */
export function useParticipant(id?: string) {
  const state = useDemo();
  const participantId = id ?? state.participantId;

  return useMemo(() => {
    const participant = state.participants.find((p) => p.id === participantId);
    if (!participant) return null;
    const transactions = state.transactions
      .filter((t) => t.participantId === participantId)
      .sort((a, b) => b.date.localeCompare(a.date) || b.amount - a.amount);
    const milestones = state.milestones.filter((m) => m.participantId === participantId).sort((a, b) => a.date.localeCompare(b.date));
    const board = leaderboard(state);
    return {
      participant,
      transactions,
      milestones,
      totals: totals(transactions),
      signals: reviewSignals(participant, transactions),
      rank: board.find((row) => row.participant.id === participantId)?.rank ?? 0,
      isFinalist: board.find((row) => row.participant.id === participantId)?.isFinalist ?? false,
      activity: state.activity.filter((a) => a.participantId === participantId),
    };
  }, [state, participantId]);
}
