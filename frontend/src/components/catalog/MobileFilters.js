"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";

export function MobileFilters({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="secondary"
        className="w-full justify-center gap-2 rounded-xl border-line/80 bg-white shadow-sm"
        onClick={() => setOpen(true)}
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-white">
          <SlidersHorizontal aria-hidden="true" size={14} strokeWidth={2.25} />
        </span>
        Filters
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Filters" side="bottom">
        <div className="pb-6">{children}</div>
      </Drawer>
    </>
  );
}
