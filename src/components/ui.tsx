"use client";

import { X } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { cx, initials } from "@/lib/format";

/* Small, dependency-free UI primitives (the role shadcn/ui would play in a larger app). */

// ── Button ─────────────────────────────────────────────────────────────────
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md";
};

export const buttonClass = (variant: ButtonProps["variant"] = "secondary", size: ButtonProps["size"] = "md") =>
  cx(
    "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-50",
    size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-9 px-3.5 text-sm",
    variant === "primary" && "bg-ink text-white hover:bg-ink/85",
    variant === "secondary" && "border border-line bg-white text-ink shadow-xs hover:bg-paper",
    variant === "ghost" && "text-ink-2 hover:bg-ink/5 hover:text-ink",
    variant === "danger" && "border border-rose-200 bg-white text-rose-700 shadow-xs hover:bg-rose-50",
    variant === "success" && "bg-emerald-700 text-white hover:bg-emerald-800",
  );

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button type="button" {...props} className={cx(buttonClass(variant, size), className)} />;
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("rounded-2xl border border-line bg-white shadow-xs", className)} />;
}

export function CardHeader({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        {hint && <p className="mt-0.5 text-[13px] text-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Page header ────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-ink-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────
export function Avatar({ name, tone, size = "md" }: { name: string; tone: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        tone,
        size === "sm" && "size-6 text-[10px]",
        size === "md" && "size-9 text-xs",
        size === "lg" && "size-12 text-sm",
      )}
    >
      {initials(name)}
    </span>
  );
}

// ── Meter ──────────────────────────────────────────────────────────────────
export function Meter({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cx("h-1.5 overflow-hidden rounded-full bg-ink/8", className)}
    >
      <div className="h-full rounded-full bg-emerald-600 transition-[width] duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}

// ── Form fields ────────────────────────────────────────────────────────────
export const inputClass =
  "h-9 w-full rounded-lg border border-line bg-white px-3 text-sm shadow-xs outline-none placeholder:text-muted/70 focus:border-ink focus:ring-2 focus:ring-ink/10";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium">
        {label}
        {hint && <span className="font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** A row of pill buttons acting as a single-choice control. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly T[] | readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const item = typeof option === "string" ? { value: option, label: option } : option;
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(item.value)}
            className={cx(
              "h-8 rounded-full border px-3 text-[13px] font-medium transition",
              active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-ink/30 hover:text-ink",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          "pop-in relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-lg",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-m-1 rounded-md p-1 text-muted hover:bg-ink/5 hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-paper/60 px-5 py-3 sm:rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}

// ── Toasts ─────────────────────────────────────────────────────────────────
let toasts: { id: number; text: string }[] = [];
const toastListeners = new Set<() => void>();
const emit = () => toastListeners.forEach((listener) => listener());

export function toast(text: string) {
  const id = Date.now() + Math.random();
  toasts = [...toasts, { id, text }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((item) => item.id !== id);
    emit();
  }, 3200);
}

const noToasts: typeof toasts = [];

export function Toaster() {
  const items = useSyncExternalStore(
    (listener) => {
      toastListeners.add(listener);
      return () => toastListeners.delete(listener);
    },
    () => toasts,
    () => noToasts,
  );
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4">
      {items.map((item) => (
        <div key={item.id} className="pop-in rounded-full bg-ink px-4 py-2 text-sm font-medium text-white shadow-lg">
          {item.text}
        </div>
      ))}
    </div>
  );
}
