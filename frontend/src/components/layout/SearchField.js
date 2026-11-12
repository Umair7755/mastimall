"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ToyImage } from "@/components/product/ToyImage";
import { useSearchSuggest } from "@/hooks/useSearchSuggest";
import { formatPkr } from "@/lib/format";
import { productPath } from "@/lib/paths";

export function SearchField({ initial = "", id = "store-search" }) {
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
    <div ref={box} className="relative">
      <form
        onSubmit={submit}
        className="flex items-center gap-2 rounded-full border border-line/80 bg-canvas/80 px-4 shadow-soft backdrop-blur transition focus-within:border-brand focus-within:bg-surface focus-within:shadow-nav"
      >
        <Search aria-hidden="true" className="text-brand" size={18} />
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
          className="h-12 w-full bg-transparent text-base outline-none placeholder:text-ink-muted lg:h-12"
        />
      </form>
      {open && items.length ? (
        <ul className="absolute z-40 mt-2 w-full overflow-hidden rounded-card border border-line/70 bg-surface shadow-lift">
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
