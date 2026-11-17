"use client";

import { FindMallRail } from "@/components/home/FindMallRail";
import { buildDepartmentFinderGroups, DECOR_TYPES } from "@/lib/finderGroups";

export { DECOR_TYPES };

/** Décor-scoped finder (department page) — Type + Budget chips, same UI as home. */
export function FindDecorRail({ budgetLimits }) {
  return (
    <FindMallRail
      variant="home"
      id="find-decor"
      groups={buildDepartmentFinderGroups("decor", { budgetLimits })}
      title="Style the home"
      subtitle="Type or budget"
      mobileLabel="Find décor · tap a chip"
      seeAllHref="/search?department=decor"
      shell="border-[#99f6e4]/60 bg-gradient-to-r from-[#ecfdf5] via-white to-[#f0fdfa]"
    />
  );
}
