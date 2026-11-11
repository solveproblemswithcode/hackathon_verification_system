"use client";

import { useState } from "react";
import { COMPETITION } from "@/data";
import { actions } from "@/lib/store";
import type { Evidence, MilestoneCategory } from "@/lib/types";
import { EvidencePicker } from "./evidence";
import { Button, Field, Modal, Segmented, inputClass, toast } from "./ui";

const CATEGORIES: readonly MilestoneCategory[] = ["Product", "Launch", "Customer", "Revenue", "Other"];

export function AddMilestoneDialog({ participantId, open, onClose }: { participantId: string; open: boolean; onClose: () => void }) {
  const [date, setDate] = useState<string>(COMPETITION.today);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MilestoneCategory>("Product");
  const [evidence, setEvidence] = useState<Evidence[]>([]);

  const close = () => {
    setTitle("");
    setDescription("");
    setEvidence([]);
    setCategory("Product");
    setDate(COMPETITION.today);
    onClose();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    actions.addMilestone({ participantId, date, title: title.trim(), description: description.trim(), category, evidence });
    toast("Milestone added to your build log");
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add milestone"
      description="Entries are timestamped when you log them and can't be backdated past today."
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="milestone-form" disabled={!title.trim()}>
            Add milestone
          </Button>
        </>
      }
    >
      <form id="milestone-form" onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
          <Field label="Milestone title">
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Reached 50 customers" autoFocus required />
          </Field>
          <Field label="Date">
            <input className={inputClass} type="date" value={date} min={COMPETITION.startDate} max={COMPETITION.today} onChange={(e) => setDate(e.target.value)} required />
          </Field>
        </div>
        <Field label="Description" hint="Optional">
          <textarea
            className={`${inputClass} h-20 resize-none py-2`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happened, in a sentence or two. No need to reveal anything secret."
          />
        </Field>
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Category</p>
          <Segmented label="Category" value={category} options={CATEGORIES} onChange={setCategory} />
        </div>
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Evidence</p>
          <EvidencePicker value={evidence} onChange={setEvidence} sample="dashboard-screenshot.png" />
        </div>
      </form>
    </Modal>
  );
}
