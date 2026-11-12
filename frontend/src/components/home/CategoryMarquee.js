"use client";

import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { ToyImage } from "@/components/product/ToyImage";

function CategoryCard({ href, name, image, color }) {
  return (
    <Link
      href={href}
      prefetch={true}
      className="group flex w-[9.5rem] shrink-0 flex-col items-center gap-3 rounded-[1.75rem] bg-white p-3 shadow-soft transition hover:-translate-y-1 hover:shadow-lift sm:w-[11rem] sm:p-4 lg:w-[12rem]"
    >
      <span
        className="relative block aspect-square w-full overflow-hidden rounded-[1.5rem] shadow-inner ring-1 ring-black/5"
        style={{ background: `linear-gradient(160deg, ${color || "#EEF0FF"}, #ffffff 72%)` }}
      >
        {image ? (
          <ToyImage
            src={image}
            alt=""
            sizes="200px"
            className="object-contain p-4 transition duration-300 group-hover:scale-110 sm:p-5"
          />
        ) : (
          <span className="grid h-full place-items-center font-display text-xl">{name}</span>
        )}
      </span>
      <span className="min-h-11 text-center font-display text-base leading-tight sm:text-lg">{name}</span>
    </Link>
  );
}

/** Soft infinite drift for Top categories. Pauses on hover / focus / touch. */
export function CategoryMarquee({ categories = [], departmentSlug }) {
  const reduceMotion = useReducedMotion();

  if (!categories.length) return null;

  const cards = categories.map((category) => ({
    id: category.id,
    href: `/${departmentSlug}/${category.slug}`,
    name: category.name,
    image: category.image?.url,
    color: category.color,
  }));

  const seconds = Math.max(24, cards.length * 3.8);

  if (reduceMotion) {
    return (
      <div className="no-scrollbar flex gap-3 overflow-x-auto overscroll-x-contain pb-1 sm:gap-4">
        {cards.map((card) => (
          <CategoryCard key={card.id} {...card} />
        ))}
      </div>
    );
  }

  return (
    <div className="mm-cat-wrap relative overflow-hidden">
      {/* Scoped styles so the drift always ships with the component (not reliant on globals build). */}
      <style>{`
        @keyframes mm-cat-marquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        .mm-cat-track {
          display: flex;
          width: max-content;
          gap: 0.75rem;
          animation: mm-cat-marquee ${seconds}s linear infinite;
          will-change: transform;
        }
        @media (min-width: 640px) {
          .mm-cat-track { gap: 1rem; }
        }
        .mm-cat-wrap:hover .mm-cat-track,
        .mm-cat-wrap:focus-within .mm-cat-track {
          animation-play-state: paused;
        }
        .mm-cat-wrap:active .mm-cat-track {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mm-cat-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 gap-3 sm:gap-4">
            {cards.map((card) => (
              <CategoryCard
                key={`${copy}-${card.id}`}
                href={card.href}
                name={card.name}
                image={card.image}
                color={card.color}
              />
            ))}
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#dff5ff] to-transparent sm:w-14"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#ffe8f3] to-transparent sm:w-14"
        aria-hidden="true"
      />
      <span className="sr-only">Categories scroll automatically. Hover to pause.</span>
    </div>
  );
}
