import { PackageSearch } from "lucide-react";
import { TrackForm } from "@/components/order/TrackForm";
import { OrderStatusTrack } from "@/components/order/OrderStatusTrack";

export const metadata = { title: "Track an order", robots: { index: false, follow: true } };

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-4 lg:py-5">
      <div className="overflow-hidden rounded-2xl border border-line/70 bg-white shadow-soft">
        <div className="flex items-center gap-3 border-b border-line/60 bg-gradient-to-r from-[#eef2ff] via-white to-[#fff7ed] px-4 py-3 sm:px-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-sm">
            <PackageSearch size={20} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">Order tracking</p>
            <h1 className="font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">Track your toys</h1>
            <p className="mt-0.5 truncate text-xs text-ink-muted sm:text-sm">
              Use your order number and checkout phone to see live progress.
            </p>
          </div>
        </div>

        <div className="border-b border-line/60 px-3 py-3 sm:px-4">
          <OrderStatusTrack preview compact />
        </div>

        <div className="px-4 py-3 sm:px-5 sm:py-4">
          <TrackForm compact />
        </div>
      </div>
    </div>
  );
}
