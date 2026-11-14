"use client";

import { FindMallRail } from "@/components/home/FindMallRail";
import { buildDepartmentFinderGroups } from "@/lib/finderGroups";

/** Toys-scoped finder (department pages / legacy HomeSections). */
export function FindToysRail({ budgetLimits }) {
  return (
    <FindMallRail
      id="find"
      groups={buildDepartmentFinderGroups("toys", { budgetLimits })}
      mobileLabel="Find toys · tap a chip"
      seeAllHref="/search?department=toys"
    />
  );
}
