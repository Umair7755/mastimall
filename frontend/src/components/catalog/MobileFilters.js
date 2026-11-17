"use client";

import { Suspense, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { cn } from "@/lib/cn";

function MobileFiltersInner({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const department = searchParams?.get("department") || "";
  const isDecor =
    department === "decor" || pathname === "/decor" || pathname.startsWith("/decor/");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 transition active:scale-[0.99]",
          isDecor
            ? "border-teal-200/80 bg-gradient-to-r from-[#ecfdf5] via-white to-[#f0fdfa]"
            : "border-[#f59e0b]/40 bg-gradient-to-r from-[#fff7ed] via-white to-[#eef2ff]"
        )}
      >
        <div className="min-w-0 text-left leading-tight">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">Find faster</p>
          <p className="font-display text-sm font-semibold text-ink">
            {isDecor ? "Type, price or sale" : "Age, price or sale"}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-1.5 pr-3",
            isDecor ? "border-teal-200/80 bg-white" : "border-[#f59e0b]/35 bg-white"
          )}
        >
          <span
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full",
              isDecor ? "bg-teal-800 text-sun" : "bg-ink text-sun"
            )}
          >
            <SlidersHorizontal size={14} strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-muted">Find</span>
            <span className="font-display text-[13px] font-bold text-ink">Filters</span>
          </span>
        </span>
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        side="bottom"
        footer={
          <Button className="w-full min-h-12 cursor-pointer" onClick={() => setOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="pb-2">{children}</div>
      </Drawer>
    </>
  );
}

export function MobileFilters({ children }) {
  return (
    <Suspense
      fallback={
        <div className="h-[3.25rem] animate-pulse rounded-2xl border border-line/60 bg-white/80" />
      }
    >
      <MobileFiltersInner>{children}</MobileFiltersInner>
    </Suspense>
  );
}
