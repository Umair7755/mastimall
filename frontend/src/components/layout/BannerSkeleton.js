/** Instant sale-bar placeholder while banner settings load. */
export function BannerSkeleton() {
  return (
    <div
      className="sale-banner-skeleton relative overflow-hidden text-white"
      role="status"
      aria-live="polite"
      aria-label="Loading deals banner"
    >
      <div className="sale-banner-skeleton__shine pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto flex max-w-[1920px] items-center gap-2 px-2.5 py-1.5 sm:hidden">
        <span className="sale-banner-skeleton__pulse inline-flex h-5 w-14 items-center rounded-full bg-sun/90" />
        <span className="sale-banner-skeleton__pulse h-3 flex-1 rounded-full bg-white/35" />
        <span className="sale-banner-skeleton__pulse h-7 w-20 rounded-full bg-white/95" />
      </div>

      <div className="relative mx-auto hidden max-w-[1920px] flex-col items-center justify-between gap-3 px-3 py-2.5 sm:flex sm:flex-row sm:gap-4 sm:px-4 sm:py-3">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className="sale-banner-skeleton__pulse inline-flex items-center gap-1.5 rounded-full bg-sun/90 px-2.5 py-1 shadow-[0_3px_0_0_#c9860a]">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[10px] font-black text-sun">
              ★
            </span>
            <span className="h-2.5 w-16 rounded-full bg-ink/20" />
          </span>
          <div className="grid gap-1.5">
            <span className="sale-banner-skeleton__pulse h-3.5 w-40 rounded-full bg-white/35 sm:w-52" />
            <span className="sale-banner-skeleton__pulse-delay h-2.5 w-56 rounded-full bg-white/20 sm:w-72" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {["D", "H", "M", "S"].map((label, index) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span
                className={`grid h-8 w-9 place-items-center rounded-lg bg-white/95 text-[10px] font-bold text-[#4c1d95] shadow-sm sm:h-9 sm:w-10 ${
                  index % 2 ? "sale-banner-skeleton__pulse-delay" : "sale-banner-skeleton__pulse"
                }`}
              >
                ··
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-white/70">{label}</span>
            </div>
          ))}
          <span className="sale-banner-skeleton__pulse ml-1 inline-flex h-10 min-w-[7.5rem] items-center justify-center rounded-full bg-white/95 px-4 text-xs font-semibold text-[#6d28d9] shadow-soft">
            Loading deals…
          </span>
        </div>
      </div>
    </div>
  );
}
