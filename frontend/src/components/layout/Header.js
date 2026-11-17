"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Gift,
  Heart,
  Home,
  LayoutGrid,
  Menu,
  Percent,
  ShoppingBag,
  Sparkles,
  Sofa,
  UserRound,
} from "lucide-react";
import { motion } from "motion/react";
import { MastiLogo } from "@/components/brand/MastiLogo";
import { SearchField } from "@/components/layout/SearchField";
import { PictureTile } from "@/components/home/PictureTile";
import { useCartReady } from "@/hooks/useStoreReady";
import { apiFetch } from "@/lib/browser";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { CONTAINER } from "@/lib/layout";
import { cn } from "@/lib/cn";

const NAV_TONES = {
  home: {
    shell:
      "border-[#fde68a] bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#ffedd5] text-[#92400e] hover:brightness-[1.03] hover:shadow-sm",
    icon: "bg-white text-[#d97706] ring-[#fde68a]",
    open: "ring-2 ring-[#fbbf24] shadow-sm",
    split: "border-[#fde68a]/80 hover:bg-white/70",
  },
  toys: {
    shell:
      "border-[#c7d2fe] bg-gradient-to-r from-[#eef2ff] via-[#e0e7ff] to-[#f5f3ff] text-[#3730a3] hover:brightness-[1.03] hover:shadow-sm",
    icon: "bg-white text-[#4f46e5] ring-[#c7d2fe]",
    open: "ring-2 ring-[#a5b4fc] shadow-sm",
    split: "border-[#c7d2fe]/80 hover:bg-white/70",
  },
  decor: {
    shell:
      "border-teal-200 bg-gradient-to-r from-[#ecfdf5] via-[#f0fdfa] to-[#e0f2fe] text-teal-900 hover:brightness-[1.03] hover:shadow-sm",
    icon: "bg-white text-teal-700 ring-teal-200",
    open: "ring-2 ring-teal-300 shadow-sm",
    split: "border-teal-200/80 hover:bg-white/70",
  },
  sale: {
    shell:
      "border-[#fda4af] bg-gradient-to-r from-[#fff1f2] via-[#ffe4e6] to-[#ffedd5] text-[#9f1239] hover:brightness-[1.03] hover:shadow-sm",
    icon: "bg-white text-[#e11d48] ring-[#fda4af]",
    open: "ring-2 ring-[#fb7185] shadow-sm",
    split: "border-[#fda4af]/80 hover:bg-white/70",
  },
  neu: {
    shell:
      "border-[#86efac] bg-gradient-to-r from-[#ecfdf5] via-[#d1fae5] to-[#e0f2fe] text-[#065f46] hover:brightness-[1.03] hover:shadow-sm",
    icon: "bg-white text-[#059669] ring-[#86efac]",
    open: "ring-2 ring-[#6ee7b7] shadow-sm",
    split: "border-[#86efac]/80 hover:bg-white/70",
  },
  default: {
    shell:
      "border-line/80 bg-gradient-to-r from-white to-[#f8fafc] text-ink hover:border-brand/30 hover:shadow-sm",
    icon: "bg-brand-soft text-brand ring-brand/15",
    open: "ring-2 ring-brand/30 shadow-sm",
    split: "border-line/80 hover:bg-white/70",
  },
};

function navMeta(item) {
  const key = `${item.label || ""} ${item.href || ""}`.toLowerCase();
  const label = String(item.label || "").trim();
  if (item.kind === "home" || item.href === "/" || label.toLowerCase() === "home") {
    return { Icon: Home, label: "Home", hint: "Mall home", tone: "home" };
  }
  if (key.includes("decor") || key.includes("décor") || item.href === "/decor") {
    return { Icon: Sofa, label: label || "Decor", hint: "Home décor", tone: "decor" };
  }
  if (item.kind === "department" || key.includes("toy") || item.href === "/toys") {
    return { Icon: Gift, label: label || "Toys", hint: "Browse toys", tone: "toys" };
  }
  if (key.includes("deal") || key.includes("sale")) {
    return { Icon: Percent, label: "Sale deals", hint: "Toys on sale", tone: "sale" };
  }
  if (key.includes("new")) {
    return { Icon: Sparkles, label: "New Arrivals", hint: "Just arrived", tone: "neu" };
  }
  return { Icon: Sparkles, label: label || "Shop", hint: label, tone: "default" };
}

function HeaderAction({ href, onClick, icon: Icon, label, tone = "soft", badge, id, compactOnMobile = false }) {
  const tones = {
    soft: "border-line/70 bg-white text-ink hover:border-brand/30 hover:bg-brand-soft hover:text-brand",
    cart: "border-brand/20 bg-brand text-white hover:bg-brand-dark",
    love: "border-coral/20 bg-[#fff1f4] text-[#be123c] hover:bg-coral hover:text-white",
  };
  const className = cn(
    "relative inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border text-sm font-semibold transition sm:h-12",
    compactOnMobile ? "px-2 sm:px-3.5" : "px-3.5",
    tones[tone] || tones.soft
  );

  const content = (
    <>
      <Icon aria-hidden="true" size={18} strokeWidth={2.25} />
      <span className={cn("font-display text-[15px] leading-none", compactOnMobile && "hidden sm:inline")}>
        {label}
      </span>
      {badge}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" id={id} onClick={onClick} className={className} aria-label={label}>
      {content}
    </button>
  );
}

export function Header({ nav = [], departments = [] }) {
  const openShop = useUi((state) => state.openShop);
  const openDrawer = useCart((state) => state.openDrawer);
  const ready = useCartReady();
  const count = useCart((state) => state.items.reduce((sum, item) => sum + item.qty, 0));
  const [openSlug, setOpenSlug] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
      setOpenSlug((current) => (current ? "" : current));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let alive = true;
    apiFetch("/auth/me")
      .then((data) => {
        if (!alive) return;
        const first = String(data?.customer?.name || "")
          .trim()
          .split(/\s+/)[0];
        setWelcomeName(first || "");
      })
      .catch(() => {
        if (alive) setWelcomeName("");
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!openSlug) return;
    function onPointerDown(event) {
      const node = menuRef.current;
      if (!node) return;
      const target = event.target;
      if (target instanceof Node && !node.contains(target)) {
        setOpenSlug("");
      }
    }
    function onKey(event) {
      if (event.key === "Escape") setOpenSlug("");
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [openSlug]);

  const cartBadge =
    ready && count > 0 ? (
      <motion.span
        key={count}
        initial={{ scale: 0.7 }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.28 }}
        className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-sun px-1.5 text-[11px] font-bold text-ink"
      >
        {count}
      </motion.span>
    ) : null;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-line/40 bg-surface/95 backdrop-blur-xl transition",
        scrolled && "shadow-nav"
      )}
    >
      <div className={`${CONTAINER} py-1.5 sm:py-3`}>
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 lg:gap-4">
          <button
            type="button"
            onClick={openShop}
            aria-label="Open menu"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-ink px-2.5 font-display text-base font-semibold text-white sm:h-12 sm:px-4 lg:hidden"
          >
            <Menu aria-hidden="true" size={17} />
            <span className="hidden min-[400px]:inline">Menu</span>
          </button>

          <Link href="/" className="min-w-0 shrink-0 overflow-visible" aria-label="Masti Mall home">
            <MastiLogo
              height={96}
              priority
              slogan="moods"
              orbit={false}
              tagline={false}
              className="!h-[3.85rem] !w-[10.4rem] sm:!h-[5.35rem] sm:!w-[14.2rem] lg:!h-[6rem] lg:!w-[16rem]"
            />
          </Link>

          <div className="hidden min-w-0 flex-1 lg:block">
            <SearchField id="store-search-desktop" />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {welcomeName ? (
              <Link
                href="/account"
                className="hidden max-w-[11rem] truncate rounded-full border border-brand/15 bg-brand-soft px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white md:inline-flex"
                title="Open your account"
              >
                Welcome {welcomeName}
              </Link>
            ) : null}
            <HeaderAction href="/wishlist" icon={Heart} label="Wishlist" tone="love" compactOnMobile />
            <div className="hidden lg:block">
              <HeaderAction
                href="/account"
                icon={UserRound}
                label={welcomeName ? "Account" : "Account"}
              />
            </div>
            <HeaderAction
              id="cart-target"
              icon={ShoppingBag}
              label="Cart"
              tone="cart"
              onClick={openDrawer}
              badge={cartBadge}
              compactOnMobile
            />
          </div>
        </div>

        <div className="mt-1.5 lg:hidden">
          <SearchField id="store-search-mobile" />
        </div>

        <nav
          aria-label="Primary"
          className="mt-3 hidden items-center gap-2 rounded-2xl border border-line/60 bg-[#f7f4ee]/80 p-1.5 lg:flex"
        >
          <button
            type="button"
            onClick={() => {
              setOpenSlug("");
              openShop();
            }}
            className="group relative inline-flex h-12 shrink-0 cursor-pointer items-center gap-2.5 overflow-hidden rounded-full border border-[#f59e0b]/40 bg-gradient-to-r from-sun via-[#fbbf24] to-[#f59e0b] px-4 font-display text-base font-bold text-ink shadow-[0_3px_0_0_#c9860a] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:shadow-none"
          >
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgb(255_255_255_/_0.45),transparent_45%)]" aria-hidden="true" />
            <span className="relative grid h-8 w-8 place-items-center rounded-full bg-ink text-sun shadow-sm">
              <LayoutGrid aria-hidden="true" size={16} strokeWidth={2.35} />
            </span>
            <span className="relative flex flex-col items-start leading-none">
              <span className="text-[15px]">Browse</span>
              <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
                All categories
              </span>
            </span>
          </button>

          <div className="mx-0.5 hidden h-7 w-px bg-line/80 sm:block" aria-hidden="true" />

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {nav.map((item) => {
              const { Icon, label, hint, tone } = navMeta(item);
              const theme = NAV_TONES[tone] || NAV_TONES.default;

              if (item.soon || !item.href) {
                return (
                  <span
                    key={item.label}
                    title={`${label} is coming soon`}
                    className="inline-flex h-12 cursor-default items-center rounded-full border border-[#e8d9b0] bg-gradient-to-r from-[#fff8e8] via-[#fff3d6] to-[#f7e7b8] px-1.5 shadow-sm"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/75 py-1 pl-2 pr-3 ring-1 ring-[#e8d9b0]/80">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f3e4b8] text-[#8a7020]">
                        <Icon size={15} strokeWidth={2.25} aria-hidden="true" />
                      </span>
                      <span className="font-display text-base font-semibold tracking-tight text-[#6b5a2e]">
                        {label}
                      </span>
                      <span className="rounded-full bg-sun px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink">
                        Soon
                      </span>
                    </span>
                  </span>
                );
              }

              const slug = String(item.href).replace(/^\//, "").split("?")[0];
              const department = departments.find((entry) => entry.slug === slug);

              if (!department) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    title={hint}
                    onClick={() => setOpenSlug("")}
                    className={cn(
                      "group inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border px-3.5 font-display text-base font-semibold transition",
                      theme.shell
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-full ring-1 transition group-hover:scale-105",
                        theme.icon
                      )}
                    >
                      <Icon size={15} strokeWidth={2.25} aria-hidden="true" />
                    </span>
                    {label}
                  </Link>
                );
              }

              const menuOpen = openSlug === department.slug;
              const isDecorDept = department.slug === "decor" || department.themeKey === "decor";
              const cats = department.categories || [];
              return (
                <div key={item.label} className="relative" ref={menuOpen ? menuRef : null}>
                  <div
                    className={cn(
                      "inline-flex h-12 items-stretch overflow-hidden rounded-full border font-display text-base font-semibold transition",
                      theme.shell,
                      menuOpen && theme.open
                    )}
                  >
                    <Link
                      href={`/${department.slug}`}
                      title={`Open ${label}`}
                      onClick={() => setOpenSlug("")}
                      className="inline-flex cursor-pointer items-center gap-2 py-0 pl-3.5 pr-2.5 transition hover:brightness-[1.04]"
                    >
                      <span className={cn("grid h-7 w-7 place-items-center rounded-full ring-1", theme.icon)}>
                        <Icon size={15} strokeWidth={2.25} aria-hidden="true" />
                      </span>
                      {label}
                    </Link>
                    <button
                      type="button"
                      title={`${label} categories`}
                      aria-label={`${label} categories`}
                      aria-expanded={menuOpen}
                      aria-haspopup="true"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setOpenSlug(menuOpen ? "" : department.slug);
                      }}
                      className={cn(
                        "inline-flex cursor-pointer items-center border-l px-2.5 transition",
                        theme.split
                      )}
                    >
                      <ChevronDown
                        aria-hidden="true"
                        size={16}
                        className={cn("opacity-80 transition duration-200", menuOpen && "rotate-180")}
                      />
                    </button>
                  </div>
                  {menuOpen ? (
                    <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-[min(44rem,calc(100vw-2rem))] rounded-2xl border border-line/70 bg-white p-4 shadow-lift">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-base font-semibold text-ink">
                            {isDecorDept ? "Pick a décor type" : "Pick a toy type"}
                          </p>
                          <p className="text-xs text-ink-muted">
                            Or open {label.toLowerCase()} to browse the full shelf
                          </p>
                        </div>
                        <Link
                          href={`/${department.slug}`}
                          className="cursor-pointer rounded-full bg-ink px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand"
                          onClick={() => setOpenSlug("")}
                        >
                          See all {label.toLowerCase()}
                        </Link>
                      </div>
                      {cats.length ? (
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                          {cats.slice(0, 12).map((category) => (
                            <PictureTile
                              key={category.id}
                              href={`/${department.slug}/${category.slug}`}
                              title={category.name}
                              image={category.image?.url}
                              color={category.color}
                              shape="circle"
                              onClick={() => setOpenSlug("")}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-xl bg-canvas px-3 py-4 text-sm text-ink-muted">
                          Categories will show here once this department is stocked.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
