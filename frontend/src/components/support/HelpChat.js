"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Package,
  Send,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { useCheckoutSettings } from "@/hooks/useCheckoutSettings";
import { apiFetch } from "@/lib/browser";
import { cn } from "@/lib/cn";
import { formatPkr } from "@/lib/format";

const STORAGE_KEY = "mastimall-support-thread";
const POLL_MS = 3000;

function buildHelpSteps(delivery) {
  return [
    {
      id: "order",
      title: "Track an order",
      text: "Have your order number and the phone used at checkout.",
      href: "/track",
      icon: Package,
      steps: ["Open Track order", "Enter order number + phone", "See live status"],
    },
    {
      id: "shipping",
      title: "Delivery & shipping",
      text: `Free delivery from ${formatPkr(delivery.freeShippingAt)} across Pakistan.`,
      href: "/delivery-terms",
      icon: Truck,
      steps: [
        `Under ${formatPkr(delivery.freeShippingAt)}: city fee applies`,
        `Near cities ${formatPkr(delivery.nearFee)} · others ${formatPkr(delivery.farFee)}`,
        "You’ll see courier updates on the order page",
      ],
    },
    {
      id: "pay",
      title: "Payments",
      text: "COD, JazzCash, or EasyPaisa — wallet orders need a receipt.",
      href: "/cart",
      icon: Wallet,
      steps: ["Add toys to cart", "Choose payment at checkout", "Upload receipt for JazzCash / EasyPaisa"],
    },
  ];
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveThread(thread) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        publicId: thread.publicId,
        name: thread.name,
        phone: thread.phone,
      })
    );
  } catch {
    /* ignore */
  }
}

/** Keep the sheet above the soft keyboard on mobile. */
function useKeyboardSafeSheet(active) {
  const [offset, setOffset] = useState(0);
  const [height, setHeight] = useState(null);

  useEffect(() => {
    if (!active || typeof window === "undefined") {
      setOffset(0);
      setHeight(null);
      return undefined;
    }

    const vv = window.visualViewport;
    if (!vv) return undefined;

    function sync() {
      const layoutH = window.innerHeight;
      const visibleH = vv.height;
      const keyboard = Math.max(0, layoutH - visibleH - vv.offsetTop);
      setOffset(keyboard);
      setHeight(Math.max(280, Math.round(visibleH - 12)));
    }

    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [active]);

  return { offset, height };
}

export function HelpChat() {
  const delivery = useCheckoutSettings();
  const helpSteps = useMemo(() => buildHelpSteps(delivery), [delivery]);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("help");
  const [guide, setGuide] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [draft, setDraft] = useState("");
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [unread, setUnread] = useState(0);
  const listRef = useRef(null);
  const composerRef = useRef(null);
  const messageCountRef = useRef(0);
  const { offset: keyboardOffset, height: sheetHeight } = useKeyboardSafeSheet(open);

  async function fetchThread(publicId, { markRead = false } = {}) {
    const qs = markRead ? "?markRead=1" : "";
    const response = await fetch(`/api/support/threads/${publicId}${qs}`, {
      cache: "no-store",
      headers: { accept: "application/json" },
      credentials: "include",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Could not load chat.");
    return data;
  }

  useEffect(() => {
    const saved = loadSaved();
    if (!saved?.publicId) return;
    setName(saved.name || "");
    setPhone(saved.phone || "");
    fetchThread(saved.publicId)
      .then((data) => {
        setThread(data.thread);
        setMessages(data.messages || []);
        messageCountRef.current = data.messages?.length || 0;
        setUnread(Number(data.thread?.unreadCustomer) || 0);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, tab, keyboardOffset]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!thread?.publicId) return undefined;
    let cancelled = false;

    async function poll() {
      if (document.visibilityState === "hidden") return;
      try {
        const data = await fetchThread(thread.publicId, { markRead: open && tab === "chat" });
        if (cancelled) return;
        const nextMessages = data.messages || [];
        setThread(data.thread);
        setMessages(nextMessages);
        if (!open || tab !== "chat") {
          const grew = nextMessages.length > messageCountRef.current;
          const adminUnread = Number(data.thread?.unreadCustomer) || 0;
          setUnread(adminUnread || (grew ? Math.max(1, nextMessages.length - messageCountRef.current) : 0));
        } else {
          setUnread(0);
        }
        messageCountRef.current = nextMessages.length;
      } catch {
        /* ignore */
      }
    }

    poll();
    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [thread?.publicId, open, tab]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  async function startOrSend(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      if (!thread?.publicId) {
        const data = await apiFetch("/support/threads", {
          method: "POST",
          body: JSON.stringify({ name: name.trim(), phone: phone.trim(), body: draft.trim() }),
        });
        setThread(data.thread);
        setMessages(data.messages || []);
        saveThread(data.thread);
        setDraft("");
        setTab("chat");
      } else {
        const data = await apiFetch(`/support/threads/${thread.publicId}/messages`, {
          method: "POST",
          body: JSON.stringify({ body: draft.trim() }),
        });
        setThread(data.thread);
        setMessages((current) => [...current, data.message]);
        setDraft("");
      }
    } catch (err) {
      setError(err.message || "Could not send. Try again.");
    } finally {
      setPending(false);
    }
  }

  function openChatTab() {
    setTab("chat");
    setGuide(null);
    setUnread(0);
  }

  function onComposerFocus() {
    window.setTimeout(() => {
      composerRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, 80);
  }

  const mobileSheetStyle = sheetHeight
    ? {
        height: `${sheetHeight}px`,
        maxHeight: `${sheetHeight}px`,
        bottom: `${Math.max(0, keyboardOffset)}px`,
      }
    : undefined;

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[45] flex flex-col items-end gap-3",
        open
          ? "inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-[max(1.25rem,env(safe-area-inset-bottom))] sm:right-5"
          : "help-chat-dock mobile-chrome-bottom right-3 sm:right-5"
      )}
      style={!open ? undefined : keyboardOffset ? { bottom: 0 } : undefined}
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn(
              "pointer-events-auto flex w-full flex-col overflow-hidden border-[#e8dfd0] bg-[#fbf7f1] shadow-[0_24px_60px_-28px_rgba(15,23,42,0.55)]",
              "rounded-t-[1.35rem] border border-b-0 sm:rounded-[1.35rem] sm:border",
              "h-[min(92dvh,40rem)] sm:h-[min(34rem,calc(100dvh-6rem))] sm:w-[min(24rem,calc(100vw-2.5rem))]"
            )}
            style={mobileSheetStyle}
          >
            <div className="relative shrink-0 overflow-hidden bg-[#1e1b4b] px-4 pb-3 pt-3 text-white sm:pt-4">
              <div
                className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#fbbf24]/25 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Masti Mall help</p>
                  <h2 className="mt-1 font-display text-lg font-semibold leading-tight sm:text-xl">
                    {greeting}. How can I help you?
                  </h2>
                  <p className="mt-1 text-xs text-white/70">Quick guides, or chat with our team.</p>
                </div>
                <button
                  type="button"
                  aria-label="Close help"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="relative mt-3 grid grid-cols-2 gap-1 rounded-full bg-black/25 p-1 sm:mt-4">
                {[
                  { id: "help", label: "Guide me" },
                  { id: "chat", label: "Want to chat?" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTab(item.id);
                      setGuide(null);
                      if (item.id === "chat") setUnread(0);
                    }}
                    className={cn(
                      "rounded-full px-3 py-2 text-sm font-semibold transition",
                      tab === item.id ? "bg-[#fbbf24] text-[#0f172a] shadow-sm" : "text-white/75 hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              {tab === "help" ? (
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                  {!guide ? (
                    <div className="grid gap-2">
                      <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        Pick a path
                      </p>
                      {helpSteps.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setGuide(item)}
                            className="flex items-start gap-3 rounded-2xl border border-[#eadfce] bg-white p-3 text-left shadow-sm transition hover:border-[#f59e0b]/50 hover:shadow-md"
                          >
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff7ed] text-[#c2410c]">
                              <Icon size={18} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-2">
                                <span className="font-display text-[15px] font-semibold text-ink">{item.title}</span>
                                <ChevronRight size={16} className="text-ink-muted" />
                              </span>
                              <span className="mt-0.5 block text-xs text-ink-muted">{item.text}</span>
                            </span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={openChatTab}
                        className="mt-1 flex items-center justify-between rounded-2xl border border-dashed border-[#c4b5a0] bg-[#fffdf9] px-3 py-3 text-left transition hover:border-[#f59e0b]"
                      >
                        <span>
                          <span className="block font-display text-sm font-semibold text-ink">Still stuck?</span>
                          <span className="text-xs text-ink-muted">Send a message — we reply in this chat.</span>
                        </span>
                        <MessageCircle size={18} className="text-[#c2410c]" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <button
                        type="button"
                        onClick={() => setGuide(null)}
                        className="text-left text-xs font-semibold text-ink-muted hover:text-ink"
                      >
                        ← All guides
                      </button>
                      <div className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">
                        <p className="font-display text-lg font-semibold text-ink">{guide.title}</p>
                        <p className="mt-1 text-sm text-ink-muted">{guide.text}</p>
                        <ol className="mt-4 grid gap-2">
                          {guide.steps.map((step, index) => (
                            <li key={step} className="flex items-start gap-2 text-sm text-ink">
                              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#059669]" />
                              <span>
                                <span className="font-semibold text-ink-muted">Step {index + 1}.</span> {step}
                              </span>
                            </li>
                          ))}
                        </ol>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            href={guide.href}
                            onClick={() => setOpen(false)}
                            className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-white"
                          >
                            Take me there
                          </Link>
                          <button
                            type="button"
                            onClick={openChatTab}
                            className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink"
                          >
                            Chat instead
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div
                    ref={listRef}
                    className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-3"
                  >
                    {!messages.length ? (
                      <div className="rounded-2xl border border-dashed border-[#d6c7b3] bg-white/70 px-3 py-6 text-center">
                        <p className="font-display text-base font-semibold text-ink">Start a conversation</p>
                        <p className="mt-1 text-xs text-ink-muted">
                          Tell us your name, phone, and what you need help with.
                        </p>
                      </div>
                    ) : (
                      messages.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                            item.from === "customer"
                              ? "ml-auto bg-[#1e1b4b] text-white"
                              : item.from === "admin"
                                ? "bg-white text-ink ring-1 ring-[#eadfce]"
                                : "bg-[#fff7ed] text-[#9a3412] ring-1 ring-[#fed7aa]"
                          )}
                        >
                          {item.body}
                          <p
                            className={cn(
                              "mt-1 text-[10px]",
                              item.from === "customer" ? "text-white/55" : "text-ink-muted"
                            )}
                          >
                            {item.from === "admin" ? "Masti Mall" : item.from === "system" ? "Note" : "You"} ·{" "}
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleTimeString("en-PK", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <form
                    ref={composerRef}
                    onSubmit={startOrSend}
                    className="shrink-0 border-t border-[#eadfce] bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                  >
                    {!thread ? (
                      <div className="mb-2 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                        <input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onFocus={onComposerFocus}
                          placeholder="Your name"
                          autoComplete="name"
                          enterKeyHint="next"
                          className="h-11 rounded-xl border border-line bg-[#fbf7f1] px-3 text-base outline-none ring-brand/30 focus:ring-2 sm:text-sm"
                        />
                        <input
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onFocus={onComposerFocus}
                          placeholder="03XX…"
                          inputMode="tel"
                          autoComplete="tel"
                          enterKeyHint="next"
                          className="h-11 rounded-xl border border-line bg-[#fbf7f1] px-3 text-base outline-none ring-brand/30 focus:ring-2 sm:text-sm"
                        />
                      </div>
                    ) : null}
                    <div className="flex items-end gap-2">
                      <textarea
                        required
                        rows={2}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onFocus={onComposerFocus}
                        placeholder={thread ? "Write a reply…" : "How can we help?"}
                        enterKeyHint="send"
                        className="min-h-11 max-h-28 flex-1 resize-none rounded-xl border border-line bg-[#fbf7f1] px-3 py-2.5 text-base outline-none ring-brand/30 focus:ring-2 sm:text-sm"
                      />
                      <button
                        type="submit"
                        disabled={pending}
                        aria-label="Send message"
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fbbf24] text-ink shadow-[0_3px_0_0_#c9860a] transition enabled:hover:brightness-105 disabled:opacity-60"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                    {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
                  </form>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!open ? (
        <button
          type="button"
          aria-label="Open help chat"
          onClick={() => {
            setOpen(true);
            if (unread > 0 || messages.some((m) => m.from === "admin")) {
              setTab("chat");
            }
          }}
          className="pointer-events-auto relative grid h-14 w-14 place-items-center rounded-full bg-[#1e1b4b] text-[#fbbf24] shadow-[0_14px_30px_-12px_rgba(30,27,75,0.85)] transition hover:scale-[1.03] active:scale-95"
        >
          <MessageCircle size={22} />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      ) : null}
    </div>
  );
}
