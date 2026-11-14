"use client";

import { FindMallRail } from "@/components/home/FindMallRail";
import { buildDepartmentFinderGroups, DECOR_ROOMS } from "@/lib/finderGroups";

export { DECOR_ROOMS };

/** Décor-scoped finder (department page). */
export function FindDecorRail({ budgetLimits }) {
  return (
    <FindMallRail
      id="find-decor"
      groups={buildDepartmentFinderGroups("decor", { budgetLimits })}
      title="Style the home"
      subtitle="Room or budget"
      mobileLabel="Find décor · tap a chip"
      seeAllHref="/search?department=decor"
      shell="border-[#99f6e4]/60 bg-gradient-to-r from-[#ecfdf5] via-white to-[#f0fdfa]"
    />
  );
}
