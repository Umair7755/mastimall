"use client";

import { FindMallRail } from "@/components/home/FindMallRail";
import { buildDepartmentFinderGroups } from "@/lib/finderGroups";

/** Toys-scoped finder (department pages / legacy HomeSections). */
export function FindToysRail({ budgetLimits }) {
  return (
    <FindMallRail
      variant="home"
      id="find"
      groups={buildDepartmentFinderGroups("toys", { budgetLimits })}
      mobileLabel="Find toys · tap a chip"
      seeAllHref="/search?department=toys"
    />
  );
}
