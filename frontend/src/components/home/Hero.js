import { Cake, Sparkles, Users, Wallet } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import Hero3D from "@/components/three/Hero3D";
import { Hero3DBoundary } from "@/components/three/Hero3DBoundary";
import { CONTAINER } from "@/lib/layout";

export function Hero({ title, text, entries, findHref = "#find", mood = "mall" }) {
  const headline = String(title || "Toys + décor. Full masti.");
  const highlightDecor = /décor|decor/i.test(headline) || mood === "decor";
  const actionCount = [entries?.who, entries?.age, entries?.budget].filter(Boolean).length;
  const shell =
    mood === "decor"
      ? "bg-gradient-to-br from-[#ecfdf5] via-[#f0fdfa] to-[#e0f2fe]"
      : mood === "toys"
        ? "bg-gradient-to-br from-[#eef0ff] via-[#fff7ed] to-[#ffe4e6]"
        : "bg-gradient-to-br from-[#ffe8c8] via-[#eef0ff] to-[#ffd6e5]";
  const badge =
    mood === "decor" ? "Home décor" : mood === "toys" ? "Play shelf" : "Toys & home décor";

  return (
    <section className={`${CONTAINER} py-2 lg:py-4`}>
      <div className={`relative overflow-hidden rounded-[1.5rem] ${shell} p-3 sm:p-5 lg:p-6`}>
        <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-sun/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-brand/25 blur-3xl" />

        <div className="relative grid items-center gap-3 sm:gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="order-2 lg:order-2">
            <Hero3DBoundary>
              <Hero3D />
            </Hero3DBoundary>
          </div>

          <div className="order-1 lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand px-3 py-1.5 text-sm text-white shadow-soft">
              <Sparkles aria-hidden="true" size={16} />
              {badge}
            </span>
            <h1 className="mt-3 max-w-[18ch] text-balance font-display text-[34px] font-semibold leading-[1.08] tracking-tight text-ink sm:mt-4 sm:max-w-[20ch] sm:text-[48px] lg:text-[56px]">
              {highlightDecor ? (
                <>
                  {headline.split(/(décor|decor)/i).map((part, index) =>
                    /^(décor|decor)$/i.test(part) ? (
                      <span key={index} className="relative inline-block text-[#db2777]">
                        {part}
                        <span
                          className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-[#fbcfe8]/40 sm:h-2.5"
                          aria-hidden="true"
                        />
                      </span>
                    ) : (
                      <span key={index}>{part}</span>
                    )
                  )}
                </>
              ) : (
                headline
              )}
            </h1>
            {text ? <p className="mt-2 max-w-md text-sm text-ink-muted sm:mt-3 sm:text-lg">{text}</p> : null}
            <div
              className={`mt-3 grid gap-2 sm:mt-5 sm:gap-3 ${
                actionCount >= 3 ? "sm:grid-cols-3" : actionCount === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1 sm:max-w-xs"
              }`}
            >
              {entries.who ? (
                <ButtonLink
                  href={findHref}
                  variant="secondary"
                  className="w-full border-2 border-ink/10 bg-white"
                >
                  <Users aria-hidden="true" size={18} />
                  For who?
                </ButtonLink>
              ) : null}
              {entries.age ? (
                <ButtonLink href={findHref} variant="sun" className="w-full">
                  <Cake aria-hidden="true" size={18} />
                  What age?
                </ButtonLink>
              ) : null}
              {entries.budget ? (
                <ButtonLink
                  href={findHref}
                  variant="primary"
                  className="w-full bg-[#059669] hover:bg-[#047857]"
                >
                  <Wallet aria-hidden="true" size={18} />
                  {entries.who || entries.age ? "Budget" : "Shop by budget"}
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
