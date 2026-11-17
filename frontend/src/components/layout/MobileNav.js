"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Home, Sofa, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

function MobileNavInner() {
  const pathname = usePathname();

  const items = [
    {
      key: "home",
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
      accent: "text-brand",
      glow: "bg-brand/15",
      bar: "bg-brand",
    },
    {
      key: "toys",
      href: "/toys",
      label: "Toys",
      icon: Gift,
      active:
        pathname === "/toys" ||
        pathname.startsWith("/toys/") ||
        pathname.startsWith("/for/") ||
        pathname.startsWith("/age/") ||
        pathname.startsWith("/budget/"),
      accent: "text-[#4f46e5]",
      glow: "bg-[#eef2ff]",
      bar: "bg-[#4f46e5]",
    },
    {
      key: "decor",
      href: "/decor",
      label: "Decor",
      icon: Sofa,
      active: pathname === "/decor" || pathname.startsWith("/decor/"),
      accent: "text-teal-700",
      glow: "bg-[#ecfdf5]",
      bar: "bg-teal-600",
    },
    {
      key: "account",
      href: "/account",
      label: "Account",
      icon: UserRound,
      active: pathname.startsWith("/account"),
      accent: "text-brand",
      glow: "bg-brand/15",
      bar: "bg-brand",
    },
  ];

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 z-40 px-3 lg:hidden"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      aria-label="Primary"
    >
      <div
        className="pointer-events-none absolute inset-x-8 -bottom-0.5 h-8 rounded-full bg-ink/15 blur-2xl"
        aria-hidden="true"
      />

      <div
        className={cn(
          "pointer-events-auto relative mx-auto grid h-16 max-w-md grid-cols-4 items-center overflow-hidden rounded-full px-1",
          "border border-white/80 bg-white/95 shadow-[0_8px_30px_-10px_rgb(15_23_42_/_0.35)] backdrop-blur-xl",
          "ring-1 ring-ink/5"
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.active;

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-full font-display text-[11px] font-semibold transition",
                active ? item.accent : "text-ink-muted"
              )}
            >
              <span
                className={cn(
                  "relative grid h-8 w-8 place-items-center rounded-full transition",
                  active ? item.glow : "bg-transparent"
                )}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={active ? 2.5 : 2.15} />
              </span>
              <span className={cn("leading-none", active ? "opacity-100" : "opacity-80")}>{item.label}</span>
              {active ? (
                <span
                  className={cn("absolute bottom-1 h-1 w-1 rounded-full", item.bar)}
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileNav() {
  return (
    <Suspense fallback={null}>
      <MobileNavInner />
    </Suspense>
  );
}
