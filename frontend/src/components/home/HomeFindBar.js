"use client";

import { CONTAINER } from "@/lib/layout";
import { DepartmentFindControl } from "@/components/home/DepartmentFindControl";

/**
 * Home mobile: compact Find row + bottom-sheet filters (same pattern as Toys/Decor).
 */
export function HomeFindBar({ groups = [], seeAllHref = "/search" }) {
  if (!groups.length) return null;

  return (
    <div className={`${CONTAINER} overflow-visible py-1.5`}>
      <div className="relative z-20 flex items-center justify-between gap-3 overflow-visible rounded-2xl border border-[#f59e0b]/30 bg-gradient-to-r from-[#fff7ed] via-white to-[#eef2ff] px-3 py-2.5">
        <div className="min-w-0 leading-tight">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">Find faster</p>
          <p className="font-display text-sm font-semibold text-ink">Who, age, type or budget</p>
        </div>
        <DepartmentFindControl
          groups={groups}
          title="Find faster"
          seeAllHref={seeAllHref}
          tone="mall"
        />
      </div>
    </div>
  );
}
