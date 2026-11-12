import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for shopping at Masti Mall.",
};

const SECTIONS = [
  {
    title: "1. About these terms",
    body: "These Terms of Service apply when you browse or place an order on Masti Mall. By placing an order, you agree to these terms. If you do not agree, please do not complete checkout.",
  },
  {
    title: "2. Products & pricing",
    body: "Product titles, photos, ages, and prices are shown for shopping convenience. Final prices, stock, and delivery fees are confirmed by our server when you request a quote or place an order. We may correct obvious pricing or listing errors and cancel an order if needed, with a notice to you.",
  },
  {
    title: "3. Orders",
    body: "An order is an offer to buy. We accept it when we confirm the order (for example by updating status or contacting you). We may refuse or cancel orders for stock issues, payment problems, incomplete address details, suspected fraud, or force majeure.",
  },
  {
    title: "4. Payments",
    body: "We currently accept Cash on Delivery (COD), JazzCash, and EasyPaisa. For JazzCash and EasyPaisa you must transfer the exact order total to the account shown at checkout and upload a clear receipt screenshot. Orders stay pending until we verify the receipt. Fake, edited, or mismatched receipts may lead to cancellation. COD customers pay the rider in cash when the parcel is delivered.",
  },
  {
    title: "5. Delivery",
    body: "We deliver across Pakistan through partner couriers or local riders. Delivery times are estimates and can change with city, weather, courier load, or incomplete addresses. Please provide a reachable phone number and a clear house/street/area address. Extra courier attempts or address changes may add fees.",
  },
  {
    title: "6. Risk & inspection",
    body: "Please inspect the parcel with the rider when possible. If packaging is badly damaged, note it with the courier and contact us promptly with photos of the parcel and order number.",
  },
  {
    title: "7. Returns & exchanges",
    body: "Unused items in original condition may be eligible for return or exchange within a short window after delivery, subject to product type and stock. Opened hygiene-sensitive items, personalized goods, and clearance items may be excluded. Contact us with your order number before sending anything back. Approved refunds are processed to the original payment method or another agreed method after we receive and check the item.",
  },
  {
    title: "8. Age-appropriate toys",
    body: "Age bands and warnings on product pages are guidance for parents and guardians. You are responsible for choosing toys suitable for the child who will use them and for supervising play as needed.",
  },
  {
    title: "9. Your information",
    body: "We use your name, phone, address, and order details to process delivery, payment verification, support, and order history. Do not share someone else’s details without permission. Keep your account password safe if you create an account.",
  },
  {
    title: "10. Acceptable use",
    body: "You agree not to misuse the site, attempt unauthorized access, submit false payment proofs, harass staff, or place abusive/fraudulent orders.",
  },
  {
    title: "11. Limitation of liability",
    body: "To the fullest extent allowed by law, Masti Mall is not liable for indirect or consequential losses (such as lost time or data). Our total liability for an order is limited to the amount you paid for that order, except where liability cannot be limited by law.",
  },
  {
    title: "12. Changes",
    body: "We may update these terms from time to time. The version on this page at checkout is the one that applies to new orders. Continued use of the store after updates means you accept the revised terms.",
  },
  {
    title: "13. Contact",
    body: "For order help, payment receipt checks, or delivery issues, reach us through the WhatsApp or contact options shown on the website and include your order number.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Legal</p>
      <h1 className="mt-1 font-display text-[32px] font-semibold lg:text-[40px]">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Last updated 13 Nov 2026 · These terms cover shopping, payment, delivery, and returns at Masti Mall.
      </p>

      <div className="mt-6 grid gap-4">
        {SECTIONS.map((section) => (
          <section key={section.title} className="rounded-2xl border border-line/70 bg-white p-4 shadow-soft sm:p-5">
            <h2 className="font-display text-lg font-semibold text-ink">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/checkout" className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">
          Back to checkout
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
