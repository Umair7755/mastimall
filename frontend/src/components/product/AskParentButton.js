"use client";

import { MessageCircleHeart } from "lucide-react";
import { askParentMessage, openWhatsAppShare } from "@/lib/share";
import { cn } from "@/lib/cn";

export function askParent(product, href) {
  openWhatsAppShare(askParentMessage(product, `${window.location.origin}${href}`));
}

function ParentEmojiPair({ compact = false }) {
  const size = compact ? "h-7 w-7 text-sm" : "h-8 w-8 text-base";
  return (
    <span className="relative ml-auto flex shrink-0 items-center pr-0.5" aria-hidden="true">
      <span
        className={cn(
          "grid place-items-center rounded-full bg-[#fce7f3] ring-2 ring-white",
          size
        )}
      >
        👩
      </span>
      <span
        className={cn(
          "relative -ml-2 grid place-items-center rounded-full bg-[#dbeafe] ring-2 ring-white",
          size
        )}
      >
        👨
      </span>
      <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-sun text-[9px] ring-2 ring-white">
        💛
      </span>
    </span>
  );
}

/**
 * Core kid → parent share CTA. Clear, warm, not oversized.
 */
export function AskParentButton({ product, href, compact = false }) {
  return (
    <button
      type="button"
      onClick={() => askParent(product, href)}
      className={cn(
        "group relative inline-flex w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-2xl border transition active:scale-[0.98]",
        compact
          ? "min-h-11 border-[#a7f3d0] bg-[#ecfdf5] px-3"
          : "min-h-12 border-[#6ee7b7]/80 bg-gradient-to-r from-[#ecfdf5] via-white to-[#d1fae5] px-4 py-2.5"
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
        style={{
          background: "radial-gradient(circle at 20% 50%, rgb(37 211 102 / 0.12), transparent 55%)",
        }}
        aria-hidden="true"
      />
      <span
        className={cn(
          "relative grid shrink-0 place-items-center rounded-full bg-[#25D366] text-white",
          compact ? "h-8 w-8" : "h-9 w-9"
        )}
      >
        <MessageCircleHeart size={compact ? 15 : 17} strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="relative flex min-w-0 flex-col items-start leading-tight">
        <span
          className={cn(
            "font-display font-bold text-ink",
            compact ? "text-[13px]" : "text-[15px] sm:text-base"
          )}
        >
          Send to Mom or Dad
        </span>
        {!compact ? (
          <span className="text-[11px] font-semibold text-emerald-700/80">WhatsApp · one tap</span>
        ) : (
          <span className="text-[10px] font-semibold text-emerald-700/75">WhatsApp</span>
        )}
      </span>
      <ParentEmojiPair compact={compact} />
    </button>
  );
}
