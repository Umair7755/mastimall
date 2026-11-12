import { CONTAINER } from "@/lib/layout";

const PAYMENTS = [
  { label: "COD", hint: "Cash", icon: "/trust/cod.svg", dark: false },
  { label: "JazzCash", hint: "Wallet", icon: "/trust/jazzcash.png", dark: true },
  { label: "EasyPaisa", hint: "Wallet", icon: "/trust/easypaisa.jpg", dark: false },
];

const COURIERS = [
  { label: "TCS", hint: "Courier", icon: "/trust/tcs.svg" },
  { label: "Leopards", hint: "Courier", icon: "/trust/leopards.svg" },
  { label: "PostEx", hint: "Courier", icon: "/trust/postex.svg" },
  { label: "Trax", hint: "Courier", icon: "/trust/trax.svg" },
  { label: "Local", hint: "Rider", icon: "/trust/local.svg" },
];

function LogoChip({ label, hint, icon, dark = false }) {
  return (
    <span className="inline-flex min-h-[4.5rem] min-w-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border border-line/80 bg-white px-2.5 py-2 shadow-soft">
      <span
        className={`grid h-8 w-12 place-items-center overflow-hidden rounded-md ${dark ? "bg-black" : "bg-white"}`}
      >
        <img
          src={icon}
          alt=""
          width={48}
          height={32}
          className={`h-8 w-12 object-contain ${dark ? "object-cover" : ""}`}
        />
      </span>
      <span className="font-display text-xs font-semibold leading-none text-ink">{label}</span>
      <span className="text-[9px] uppercase tracking-wide text-ink-muted">{hint}</span>
    </span>
  );
}

/** Payments + delivery strip with brand marks. */
export function TrustBar() {
  return (
    <section className={`${CONTAINER} py-4 lg:py-6`}>
      <div className="rounded-2xl border border-line/70 bg-[#eef7fb] p-4 sm:p-5 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-0">
          <div className="lg:pr-8">
            <h3 className="font-display text-xl font-semibold text-ink lg:text-2xl">Secure payments</h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {PAYMENTS.map((item) => (
                <LogoChip key={item.label} {...item} />
              ))}
            </div>
          </div>
          <div className="border-t border-line/70 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <h3 className="font-display text-xl font-semibold text-ink lg:text-2xl">Fast & reliable delivery</h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {COURIERS.map((item) => (
                <LogoChip key={item.label} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
