"use client";

import { Trash2 } from "lucide-react";
import { QtyStepper } from "@/components/product/QtyStepper";
import { ToyImage } from "@/components/product/ToyImage";
import { formatPkr } from "@/lib/format";

export function CartLine({ item, priced, onQty, onRemove }) {
  return (
    <div className="flex gap-3 border-b border-line py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-media bg-canvas">
        <ToyImage src={item.image} alt="" sizes="80px" className="object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg leading-tight">{item.title}</p>
        <p className="mt-1 font-display text-xl">{priced ? formatPkr(priced.lineTotal) : "Checking the price…"}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <QtyStepper qty={item.qty} onChange={(qty) => onQty(item.productId, qty)} />
          <button type="button" onClick={() => onRemove(item.productId)} className="inline-flex min-h-12 items-center gap-2 px-2">
            <Trash2 aria-hidden="true" size={18} />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
