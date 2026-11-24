"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ToyImage } from "@/components/product/ToyImage";
import { useSearchSuggest } from "@/hooks/useSearchSuggest";
import { formatPkr } from "@/lib/format";
import { productPath } from "@/lib/paths";

export function SearchField({ initial = "", id = "store-search", endSlot = null }) {
  const router = useRouter();
  const [query, setQuery] = useState(initial);
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const items = useSearchSuggest(query);

  useEffect(() => {
    setQuery(initial);
  }, [initial]);

  useEffect(() => {
    function onPointer(event) {
      if (!box.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  function submit(event) {
    event.preventDefault();
    const text = query.trim();
    setOpen(false);
    router.push(text ? `/search?q=${encodeURIComponent(text)}` : "/search");
  }

  return (
    <div ref={box} className="relative flex items-center gap-2">
      <form
        onSubmit={submit}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-line/80 bg-canvas/80 px-3 shadow-soft backdrop-blur transition focus-within:border-brand focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgb(109_40_217_/_0.22)] focus-within:ring-0 sm:px-4"
      >
        <Search aria-hidden="true" className="shrink-0 text-brand" size={16} />
        <label className="sr-only" htmlFor={id}>
          Search toys
        </label>
        <input
          id={id}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search toys, ages, brands…"
          className="h-10 w-full min-w-0 bg-transparent text-[15px] outline-none ring-0 placeholder:text-ink-muted focus:outline-none focus-visible:outline-none sm:h-11 lg:h-12 lg:text-base"
        />
      </form>
      {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
      {open && items.length ? (
        <ul className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-card border border-line/70 bg-surface shadow-lift">
          {items.map((item) => (
            <li key={item.id}>
              <a href={productPath(item)} className="flex min-h-16 items-center gap-3 px-3 py-2 transition hover:bg-brand-soft">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-canvas">
                  <ToyImage src={item.images?.[0]?.url} alt="" sizes="48px" className="object-contain" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display">{item.title}</span>
                  <span className="text-sm text-ink-muted">{formatPkr(item.currentPrice)}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
