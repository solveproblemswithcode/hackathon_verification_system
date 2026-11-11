"use client";

import { ClipboardCheck, LayoutDashboard, ListChecks, Trophy, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { COMPETITION } from "@/data";
import { cx } from "@/lib/format";
import { actions, useDemo } from "@/lib/store";
import type { Role } from "@/lib/types";
import { DemoBar } from "./demo-bar";
import { Logo } from "./logo";
import { Avatar } from "./ui";

const PARTICIPANT_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/build-log", label: "Build log", icon: ListChecks },
  { href: "/financials", label: "Financials", icon: WalletCards },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Review queue", icon: ClipboardCheck },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const state = useDemo();
  const pathname = usePathname();

  // The URL decides the role, except on the shared leaderboard where we keep whoever was looking.
  const role: Role = pathname.startsWith("/admin") ? "admin" : pathname === "/leaderboard" ? state.role : "participant";
  useEffect(() => actions.setRole(role), [role]);

  const nav = role === "admin" ? ADMIN_NAV : PARTICIPANT_NAV;
  const me = state.participants.find((p) => p.id === state.participantId) ?? state.participants[0];
  const isActive = (href: string) => pathname === href || (href !== "/leaderboard" && pathname.startsWith(`${href}/`));

  return (
    <div className="min-h-dvh">
      <DemoBar role={role} />
      <div className="mx-auto flex max-w-[1320px]">
        <aside className="sticky top-11 hidden h-[calc(100dvh-2.75rem)] w-60 shrink-0 flex-col border-r border-line px-4 py-5 lg:flex">
          <Link href="/" className="px-2">
            <Logo />
          </Link>
          <p className="mt-6 mb-2 px-2 font-mono text-[10px] tracking-widest text-muted uppercase">{role === "admin" ? "Judging" : "Workspace"}</p>
          <nav className="flex flex-col gap-0.5">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cx(
                  "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition",
                  isActive(href) ? "bg-ink/7 text-ink" : "text-ink-2 hover:bg-ink/4 hover:text-ink",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-xl border border-line bg-white p-3">
              <p className="text-xs font-medium">{COMPETITION.name}</p>
              <p className="num mt-0.5 text-xs text-muted">
                Day {COMPETITION.currentDay} of {COMPETITION.totalDays}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/8">
                <div className="h-full rounded-full bg-ink" style={{ width: `${(COMPETITION.currentDay / COMPETITION.totalDays) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-1">
              {role === "admin" ? (
                <>
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-ink text-xs font-semibold text-lime">JP</span>
                  <div className="min-w-0 text-sm leading-tight">
                    <p className="truncate font-medium">Judging panel</p>
                    <p className="truncate text-xs text-muted">Organiser access</p>
                  </div>
                </>
              ) : (
                <>
                  <Avatar name={me.name} tone={me.avatar} />
                  <div className="min-w-0 text-sm leading-tight">
                    <p className="truncate font-medium">{me.name}</p>
                    <p className="truncate text-xs text-muted">{me.business}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile navigation */}
          <div className="sticky top-11 z-30 flex items-center gap-1 overflow-x-auto border-b border-line bg-paper/95 px-3 py-2 backdrop-blur lg:hidden">
            <Link href="/" className="mr-2 shrink-0" aria-label="ShipProof home">
              <Logo className="[&>svg]:size-5 text-[0px]" />
            </Link>
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cx("shrink-0 rounded-full px-3 py-1 text-[13px] font-medium", isActive(href) ? "bg-ink text-white" : "text-ink-2")}
              >
                {label}
              </Link>
            ))}
          </div>
          <main className="px-4 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
