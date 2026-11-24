"use client";

import Hero3D from "@/components/three/Hero3D";
import { Hero3DBoundary } from "@/components/three/Hero3DBoundary";
import { MobileHeroArt } from "@/components/home/MobileHeroArt";
import { CONTAINER } from "@/lib/layout";

/** Split "Toys + décor. Full masti." into clean lines — no orphan period. */
function Headline({ headline, highlightDecor, className }) {
  const raw = String(headline || "").trim();
  const lines = raw
    .replace(/\.\s*$/, "")
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const parts = lines.length > 1 ? lines : [raw.replace(/\.\s*$/, "") || raw];

  return (
    <h1 className={className}>
      {parts.map((line, i) => (
        <span key={i} className={i > 0 ? "mt-0.5 block" : "block"}>
          {highlightDecor
            ? line.split(/(décor|decor)/i).map((part, index) =>
                /^(décor|decor)$/i.test(part) ? (
                  <span key={index} className="relative inline-block text-[#db2777]">
                    {part}
                    <span
                      className="absolute inset-x-0 -bottom-0.5 h-1.5 rounded-full bg-[#fbcfe8]/55"
                      aria-hidden="true"
                    />
                  </span>
                ) : (
                  <span key={index}>{part}</span>
                )
              )
            : line}
        </span>
      ))}
    </h1>
  );
}

export function Hero({ title, text, mood = "mall" }) {
  const headline = String(title || "Toys + décor. Full masti.");
  const highlightDecor = /décor|decor/i.test(headline) || mood === "decor";
  const support = text || "Bacchon ke toys aur ghar ka décor — dono ek jagah.";

  return (
    <section className={`${CONTAINER} py-2 lg:py-4`}>
      {/* Mobile — keep compact split */}
      <div className="relative isolate overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-[#ffe8c8] via-[#fff1e0] to-[#fce7f3] lg:hidden">
        <div
          className="pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full bg-sun/35 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative grid grid-cols-[1.15fr_0.85fr] items-center gap-2 py-3.5 pl-4 pr-6">
          <div className="min-w-0">
            <Headline
              headline={headline}
              highlightDecor={highlightDecor}
              className="max-w-[12ch] font-display text-[1.7rem] font-semibold leading-[1.08] tracking-tight text-ink"
            />
            <p className="mt-1.5 text-[12px] leading-snug text-ink/70">{support}</p>
          </div>
          <div className="mr-1 h-[132px] w-full max-w-[148px] justify-self-end self-center">
            <MobileHeroArt />
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="relative hidden overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#ffe8c8] via-[#eef0ff] to-[#ffd6e5] p-6 lg:block">
        <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-sun/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-brand/25 blur-3xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Headline
              headline={headline}
              highlightDecor={highlightDecor}
              className="max-w-[20ch] font-display text-[56px] font-semibold leading-[1.08] tracking-tight text-ink"
            />
            <p className="mt-3 max-w-md text-lg text-ink-muted">{support}</p>
          </div>

          <Hero3DBoundary>
            <Hero3D />
          </Hero3DBoundary>
        </div>
      </div>
    </section>
  );
}
