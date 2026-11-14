"use client";

import Link from "next/link";
import { Gift, Sofa, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

const LINKS = [
  {
    href: "/toys",
    label: "Toys",
    hint: "Play shelf",
    Icon: Gift,
    className: "border-[#c7d2fe] bg-gradient-to-br from-[#eef2ff] to-white text-[#3730a3]",
    iconClass: "bg-[#4f46e5] text-white",
  },
  {
    href: "/decor",
    label: "Decor",
    hint: "Home mood",
    Icon: Sofa,
    className: "border-teal-200 bg-gradient-to-br from-[#ecfdf5] to-white text-teal-900",
    iconClass: "bg-teal-700 text-white",
  },
  {
    href: "/search?isNew=1&sort=new",
    label: "New",
    hint: "Arrivals",
    Icon: Sparkles,
    className: "border-[#fde68a] bg-gradient-to-br from-[#fffbeb] to-white text-[#92400e]",
    iconClass: "bg-[#f59e0b] text-ink",
  },
];

/** Mobile-only department shortcuts — desktop already has the header nav. */
export function MobileShopLinks({ className }) {
  return (
    <nav
      aria-label="Shop departments"
      className={cn("grid grid-cols-3 gap-2 lg:hidden", className)}
    >
      {LINKS.map((item) => {
        const Icon = item.Icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-[3.5rem] flex-col items-center justify-center gap-1 rounded-2xl border px-1.5 py-2 shadow-sm transition active:scale-[0.98]",
              item.className
            )}
          >
            <span className={cn("grid h-8 w-8 place-items-center rounded-full shadow-sm", item.iconClass)}>
              <Icon size={15} strokeWidth={2.35} aria-hidden="true" />
            </span>
            <span className="font-display text-[13px] font-bold leading-none">{item.label}</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.08em] opacity-70">{item.hint}</span>
          </Link>
        );
      })}
    </nav>
  );
}
