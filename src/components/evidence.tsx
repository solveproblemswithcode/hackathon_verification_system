"use client";

import { FileSpreadsheet, FileText, Globe, Image as ImageIcon, Link2, Lock, Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { cx } from "@/lib/format";
import type { Evidence, EvidenceKind } from "@/lib/types";
import { Modal } from "./ui";

const ICONS: Record<EvidenceKind, typeof FileText> = {
  screenshot: ImageIcon,
  document: FileText,
  export: FileSpreadsheet,
  link: Link2,
};

const KIND_LABEL: Record<EvidenceKind, string> = {
  screenshot: "Screenshot",
  document: "Document",
  export: "Payment export",
  link: "Link",
};

export function kindFromName(name: string): EvidenceKind {
  if (/\.(png|jpe?g|gif|webp|heic)$/i.test(name)) return "screenshot";
  if (/\.(csv|xlsx?|json)$/i.test(name)) return "export";
  if (/^https?:\/\//i.test(name)) return "link";
  return "document";
}

/** A small file chip. Clickable when `onOpen` is given. */
export function EvidenceChip({ evidence, onOpen, onRemove }: { evidence: Evidence; onOpen?: () => void; onRemove?: () => void }) {
  const Icon = ICONS[evidence.kind];
  const body = (
    <>
      <Icon className="size-3.5 shrink-0 text-muted" aria-hidden />
      <span className="truncate">{evidence.name}</span>
      {evidence.private ? (
        <Lock className="size-3 shrink-0 text-muted" aria-label="Private: judges only" />
      ) : (
        <Globe className="size-3 shrink-0 text-muted" aria-label="Public" />
      )}
    </>
  );
  const base = "inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-md border border-line bg-paper/70 px-2 text-xs text-ink-2";
  return (
    <span className="inline-flex max-w-full min-w-0 items-center">
      {onOpen ? (
        <button type="button" onClick={onOpen} className={cx(base, "hover:border-ink/30 hover:text-ink")} title={evidence.private ? "Private: visible to judges only" : "Public"}>
          {body}
        </button>
      ) : (
        <span className={base} title={evidence.private ? "Private: visible to judges only" : "Public"}>
          {body}
        </span>
      )}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${evidence.name}`} className="ml-1 rounded p-0.5 text-muted hover:bg-ink/5 hover:text-ink">
          <X className="size-3.5" />
        </button>
      )}
    </span>
  );
}

/**
 * Simulated uploader. Opens the real file picker but only keeps the file NAME;
 * nothing leaves the browser. Swap `add` for an upload to object storage later.
 */
export function EvidencePicker({ value, onChange, sample }: { value: Evidence[]; onChange: (next: Evidence[]) => void; sample: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);

  const add = (names: string[]) => {
    if (names.length === 0) return;
    setUploading(true);
    setTimeout(() => {
      onChange([...value, ...names.map((name) => ({ name, kind: kindFromName(name), private: isPrivate }))]);
      setUploading(false);
    }, 650);
  };

  return (
    <div>
      <div className="rounded-xl border border-dashed border-ink/20 bg-paper/50 p-4 text-center">
        <Paperclip className="mx-auto size-4 text-muted" aria-hidden />
        <p className="mt-1.5 text-[13px] text-ink-2">
          {uploading ? (
            "Uploading…"
          ) : (
            <>
              <button type="button" className="font-medium text-ink underline underline-offset-2" onClick={() => input.current?.click()}>
                Choose a file
              </button>{" "}
              or{" "}
              <button type="button" className="font-medium text-ink underline underline-offset-2" onClick={() => add([sample])}>
                attach a sample
              </button>
            </>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted">Screenshots, invoices, payment exports. Simulated: files stay on your device.</p>
        <input
          ref={input}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            add([...(event.target.files ?? [])].map((file) => file.name));
            event.target.value = "";
          }}
        />
      </div>
      <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-[13px] text-ink-2">
        <input type="checkbox" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} className="size-3.5 accent-ink" />
        <Lock className="size-3.5 text-muted" aria-hidden />
        Keep evidence private (judges only)
      </label>
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((item, index) => (
            <EvidenceChip key={`${item.name}-${index}`} evidence={item} onRemove={() => onChange(value.filter((_, i) => i !== index))} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Mock document viewer for the judge. Renders a believable placeholder per file type. */
export function EvidencePreview({ evidence, context, onClose }: { evidence: Evidence | null; context?: string; onClose: () => void }) {
  if (!evidence) return null;
  const Icon = ICONS[evidence.kind];
  return (
    <Modal open onClose={onClose} title={evidence.name} description={`${KIND_LABEL[evidence.kind]} · ${evidence.private ? "Private, judges only" : "Public"}${context ? ` · ${context}` : ""}`}>
      <div className="rounded-xl border border-line bg-paper p-5">
        <div className="mb-4 flex items-center gap-2 text-xs text-muted">
          <Icon className="size-4" aria-hidden />
          Mock preview
        </div>
        {evidence.kind === "export" ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="grid grid-cols-[1fr_2fr_1fr] gap-3">
                {[0, 1, 2].map((cell) => (
                  <div key={cell} className={cx("h-2.5 rounded-full", row === 0 ? "bg-ink/25" : "bg-ink/10")} />
                ))}
              </div>
            ))}
          </div>
        ) : evidence.kind === "screenshot" ? (
          <div className="aspect-video rounded-lg border border-line bg-white p-3">
            <div className="flex gap-1">
              <span className="size-1.5 rounded-full bg-ink/15" />
              <span className="size-1.5 rounded-full bg-ink/15" />
              <span className="size-1.5 rounded-full bg-ink/15" />
            </div>
            <div className="mt-3 grid h-[70%] grid-cols-3 gap-2">
              <div className="rounded bg-ink/8" />
              <div className="col-span-2 rounded bg-ink/5" />
            </div>
          </div>
        ) : evidence.kind === "link" ? (
          <p className="rounded-lg border border-line bg-white px-3 py-2 font-mono text-xs text-ink-2">{evidence.name}</p>
        ) : (
          <div className="mx-auto max-w-xs space-y-2 rounded-lg border border-line bg-white p-5">
            <div className="h-3 w-1/2 rounded-full bg-ink/25" />
            <div className="h-2 rounded-full bg-ink/10" />
            <div className="h-2 rounded-full bg-ink/10" />
            <div className="h-2 w-4/5 rounded-full bg-ink/10" />
            <div className="!mt-5 flex justify-between">
              <div className="h-2 w-1/4 rounded-full bg-ink/10" />
              <div className="h-2 w-1/5 rounded-full bg-ink/25" />
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-muted">In production this opens the real file from private storage, and every view is written to the audit log.</p>
    </Modal>
  );
}
