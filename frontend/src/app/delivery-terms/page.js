import Link from "next/link";
import { DeliveryChargesCopy } from "@/components/shipping/DeliveryChargesCopy";

export const metadata = {
  title: "Delivery Terms",
  description: "Delivery fees, timelines, and shipping partners for Masti Mall Pakistan.",
};

const SECTIONS = [
  {
    title: "1. Where we deliver",
    body: "Masti Mall delivers across Pakistan. Orders are shipped through TCS, PostEx, or a local city rider, depending on your city, parcel size, and availability. Remote or hard-to-reach areas may take longer than major cities.",
  },
  {
    title: "2. Delivery charges",
    body: null,
  },
  {
    title: "3. Delivery timelines",
    body: "After your order is confirmed and packed, major cities usually receive parcels in about 2–5 working days. Other cities may take about 3–7 working days. These are estimates only. Delays can happen due to courier load, weather, public holidays, incomplete addresses, or unsuccessful delivery attempts.",
  },
  {
    title: "4. Shipping partners",
    body: "We currently ship with TCS, PostEx, and local riders for selected city deliveries. You cannot choose a specific courier at checkout. Once shipped, we share tracking details when the courier provides them. Tracking is also available on the Track Order page with your order number and phone.",
  },
  {
    title: "5. Address & phone",
    body: "Please enter a clear house/street/area address and a reachable Pakistani mobile number. Wrong or incomplete addresses can delay delivery or cause return-to-sender. Extra courier attempts or address changes after dispatch may add courier fees, which may be charged to you.",
  },
  {
    title: "6. Cash on delivery (COD)",
    body: "For COD orders, please keep the exact cash ready for the rider or courier agent. If nobody is available at the address after reasonable attempts, the parcel may be returned and the order may be cancelled or require re-shipping fees.",
  },
  {
    title: "7. Prepaid orders (JazzCash / EasyPaisa)",
    body: "Prepaid orders are packed after we verify your payment receipt. Delivery timelines start after confirmation. If payment cannot be verified, the order stays pending and is not handed to the courier.",
  },
  {
    title: "8. Parcel inspection",
    body: "Please check the outer packaging when the parcel arrives. If the box is badly damaged or opened, note it with the courier and contact us the same day with your order number and clear photos of the packaging and products. Claims for transit damage are harder to process without timely proof.",
  },
  {
    title: "9. Failed delivery & returns to us",
    body: "If a parcel comes back because of a wrong number, refused delivery, or incomplete address, we will contact you. Re-shipping may require an extra delivery fee. Fragile décor and toys should be handled carefully after delivery — misuse or later damage is not covered as a delivery fault.",
  },
  {
    title: "10. Contact for delivery help",
    body: "For shipping questions, delayed parcels, or address updates before dispatch, email support@mastimall.store or WhatsApp / call 0304-4471631 and include your order number. Also see our Terms of Service for returns and general shopping rules.",
  },
];

export default function DeliveryTermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Shipping</p>
      <h1 className="mt-1 font-display text-[32px] font-semibold lg:text-[40px]">Delivery Terms</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Last updated 15 Nov 2026 · Fees, partners (TCS, PostEx, local), and timelines for mastimall.store.
      </p>

      <div className="mt-6 grid gap-4">
        {SECTIONS.map((section) => (
          <section key={section.title} className="rounded-2xl border border-line/70 bg-white p-4 shadow-soft sm:p-5">
            <h2 className="font-display text-lg font-semibold text-ink">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {section.title === "2. Delivery charges" ? <DeliveryChargesCopy /> : section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/terms" className="inline-flex h-11 items-center rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink">
          Terms of Service
        </Link>
        <Link href="/" className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
