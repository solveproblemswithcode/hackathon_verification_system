"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { COMPETITION } from "@/data";
import { actions } from "@/lib/store";
import type { Evidence, ExpenseCategory, TransactionType } from "@/lib/types";
import { EvidencePicker } from "./evidence";
import { Button, Field, Modal, Segmented, inputClass, toast } from "./ui";

const CATEGORIES: readonly ExpenseCategory[] = ["Advertising", "Hosting", "APIs & software", "Contractors", "Payment fees", "Refunds", "Other"];

export function AddTransactionDialog({
  participantId,
  open,
  onClose,
  initialType,
}: {
  participantId: string;
  open: boolean;
  onClose: () => void;
  initialType: TransactionType;
}) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [date, setDate] = useState<string>(COMPETITION.today);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Advertising");
  const [evidence, setEvidence] = useState<Evidence[]>([]);

  const value = Math.round(Number(amount));
  const valid = value > 0 && description.trim() && counterparty.trim();

  const close = () => {
    setAmount("");
    setDescription("");
    setCounterparty("");
    setEvidence([]);
    onClose();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    actions.addTransaction({
      participantId,
      type,
      date,
      amount: value,
      description: description.trim(),
      counterparty: counterparty.trim(),
      category: type === "expense" ? category : undefined,
      evidence: evidence[0],
    });
    toast(type === "revenue" ? "Revenue added. Profit updated." : "Expense added. Profit updated.");
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add transaction"
      description="For anything your connected payment account doesn't capture."
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="transaction-form" disabled={!valid}>
            Add {type}
          </Button>
        </>
      }
    >
      <form id="transaction-form" onSubmit={submit} className="space-y-4">
        <Segmented
          label="Type"
          value={type}
          onChange={setType}
          options={[
            { value: "revenue", label: "Revenue" },
            { value: "expense", label: "Expense" },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount (USD)">
            <input className={`${inputClass} num`} type="number" min="1" step="1" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" autoFocus required />
          </Field>
          <Field label="Date">
            <input className={inputClass} type="date" value={date} min={COMPETITION.startDate} max={COMPETITION.today} onChange={(e) => setDate(e.target.value)} required />
          </Field>
        </div>
        <Field label="Description">
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={type === "revenue" ? "e.g. Business plan, annual" : "e.g. Launch campaign"} required />
        </Field>
        <Field label={type === "revenue" ? "Customer" : "Vendor"}>
          <input className={inputClass} value={counterparty} onChange={(e) => setCounterparty(e.target.value)} placeholder={type === "revenue" ? "Who paid you" : "Who you paid"} required />
        </Field>
        {type === "expense" && (
          <div>
            <p className="mb-1.5 text-[13px] font-medium">Category</p>
            <Segmented label="Category" value={category} options={CATEGORIES} onChange={setCategory} />
          </div>
        )}
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Evidence</p>
          <EvidencePicker value={evidence} onChange={(next) => setEvidence(next.slice(-1))} sample={type === "revenue" ? "bank-transfer-confirmation.pdf" : "receipt.pdf"} />
        </div>
        <p className="flex gap-2 rounded-lg bg-sky-50 px-3 py-2 text-[13px] text-sky-900">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {type === "revenue"
            ? "Manual revenue counts toward your provisional profit straight away, and stays unverified until a judge accepts the evidence."
            : "All costs reduce competition profit as soon as they are entered. Leaving costs out is the most common reason finalists are adjusted."}
        </p>
      </form>
    </Modal>
  );
}
