"use client";

import { RotateCcw, Scale } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cx } from "@/lib/format";
import { actions, useDemo } from "@/lib/store";
import type { Role } from "@/lib/types";
import { toast } from "./ui";

/**
 * Demo mode switcher. Replaces login for the prototype: pick a founder to see
 * their workspace, or switch to the judge view. Delete this (and add real auth)
 * when going to production.
 */
export function DemoBar({ role }: { role: Role }) {
  const state = useDemo();
  const router = useRouter();
  const pathname = usePathname();

  const chip = (active: boolean) =>
    cx(
      "flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium transition",
      active ? "bg-lime text-ink" : "text-white/70 hover:bg-white/10 hover:text-white",
    );

  return (
    <div className="sticky top-0 z-40 bg-ink text-white">
      <div className="flex h-11 items-center gap-3 px-3 sm:px-5">
        <span className="hidden shrink-0 rounded border border-white/20 px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-white/70 uppercase sm:inline">
          Demo mode
        </span>
        <span className="shrink-0 text-[13px] text-white/50">View as</span>
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
          {state.participants.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={role === "participant" && state.participantId === p.id}
              onClick={() => {
                actions.viewAs(p.id);
                // Stay on the current participant page; leave judge pages for the dashboard.
                if (pathname.startsWith("/admin")) router.push("/dashboard");
              }}
              className={chip(role === "participant" && state.participantId === p.id)}
              title={`${p.name}, ${p.business}`}
            >
              {p.name.split(" ")[0]}
            </button>
          ))}
        </div>
        <span className="mx-1 h-4 w-px shrink-0 bg-white/20" aria-hidden />
        <button
          type="button"
          aria-pressed={role === "admin"}
          onClick={() => {
            actions.setRole("admin");
            router.push("/admin");
          }}
          className={chip(role === "admin")}
        >
          <Scale className="size-3.5" aria-hidden />
          Judge
        </button>
        <button
          type="button"
          onClick={() => {
            actions.reset();
            toast("Demo data reset");
          }}
          className="flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2 text-[13px] text-white/60 hover:bg-white/10 hover:text-white"
          title="Restore the original mock data"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Reset demo</span>
        </button>
      </div>
    </div>
  );
}
