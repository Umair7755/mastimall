"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCheck,
  Inbox,
  MessageSquareText,
  Phone,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react";
import { adminFetch } from "@/lib/admin";
import { cn } from "@/lib/cn";

const POLL_MS = 4000;

function timeLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminSupportPage() {
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState("open");
  const [q, setQ] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const listRef = useRef(null);
  const selectedRef = useRef("");

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  async function loadThreads(next = {}) {
    const params = new URLSearchParams();
    params.set("limit", "50");
    const nextStatus = next.status ?? status;
    const nextQ = next.q ?? q;
    if (nextStatus) params.set("status", nextStatus);
    if (nextQ.trim()) params.set("q", nextQ.trim());
    const data = await adminFetch(`/admin/support/threads?${params}`);
    setThreads(data.items || []);
    setUnreadTotal(data.unreadTotal || 0);
    setLoadingList(false);
    return data;
  }

  async function loadDetail(id) {
    if (!id) {
      setDetail(null);
      return null;
    }
    const data = await adminFetch(`/admin/support/threads/${id}`);
    if (selectedRef.current === id) {
      setDetail(data);
      setThreads((current) =>
        current.map((item) => (item.id === id ? { ...item, unreadAdmin: 0 } : item))
      );
    }
    return data;
  }

  useEffect(() => {
    setLoadingList(true);
    loadThreads().catch((err) => {
      setError(err.message);
      setLoadingList(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      if (document.visibilityState === "hidden") return;
      try {
        await loadThreads();
        if (!cancelled && selectedRef.current) await loadDetail(selectedRef.current);
      } catch {
        /* ignore */
      }
    }
    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [detail?.messages?.length, selectedId]);

  async function onSelect(id) {
    setSelectedId(id);
    setError("");
    try {
      await loadDetail(id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function sendReply(event) {
    event.preventDefault();
    if (!selectedId || !reply.trim()) return;
    setPending(true);
    setError("");
    try {
      const data = await adminFetch(`/admin/support/threads/${selectedId}/reply`, {
        method: "POST",
        body: JSON.stringify({ body: reply.trim() }),
      });
      setDetail((current) =>
        current
          ? { thread: data.thread, messages: [...(current.messages || []), data.message] }
          : current
      );
      setReply("");
      await loadThreads();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  async function setThreadStatus(nextStatus) {
    if (!selectedId) return;
    await adminFetch(`/admin/support/threads/${selectedId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });
    await loadDetail(selectedId);
    await loadThreads();
  }

  const active = detail?.thread;

  return (
    <div className="-m-4 flex h-[calc(100dvh-7.5rem)] flex-col bg-[#f4f2ee] lg:-m-5 lg:h-[calc(100dvh-5.5rem)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e7e2d9] bg-white px-4 py-3 lg:px-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Support</h1>
            {unreadTotal > 0 ? (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                {unreadTotal} new
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                Up to date
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">Live customer chat · refreshes every few seconds</p>
        </div>
        <button
          type="button"
          onClick={() => loadThreads().then(() => selectedId && loadDetail(selectedId))}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid min-h-0 flex-1 lg:grid-cols-[20.5rem_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-[#e7e2d9] bg-white">
          <div className="space-y-2 border-b border-[#eee8de] p-3">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadThreads().catch((err) => setError(err.message));
                }}
                placeholder="Search name or phone"
                className="h-10 w-full rounded-xl border border-slate-200 bg-[#faf8f4] py-2 pl-9 pr-3 text-sm outline-none ring-slate-300 focus:ring-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#f4f2ee] p-1">
              {[
                { id: "open", label: "Open" },
                { id: "closed", label: "Closed" },
                { id: "", label: "All" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setStatus(item.id)}
                  className={cn(
                    "rounded-lg px-2 py-1.5 text-xs font-semibold transition",
                    status === item.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingList ? (
              <p className="p-4 text-sm text-slate-500">Loading conversations…</p>
            ) : !threads.length ? (
              <div className="grid place-items-center gap-2 px-6 py-16 text-center">
                <Inbox size={28} className="text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No conversations</p>
                <p className="text-xs text-slate-400">New chat messages from the store will land here.</p>
              </div>
            ) : (
              <ul>
                {threads.map((item) => {
                  const activeRow = selectedId === item.id;
                  return (
                    <li key={item.id} className="border-b border-[#f0ebe3]">
                      <button
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className={cn(
                          "flex w-full gap-3 px-3 py-3 text-left transition",
                          activeRow ? "bg-[#111827] text-white" : "hover:bg-[#faf8f4]"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold",
                            activeRow ? "bg-white/15 text-white" : "bg-[#fff1e8] text-[#9a3412]"
                          )}
                        >
                          {(item.name || "?").slice(0, 1).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold">{item.name}</span>
                            <span className={cn("shrink-0 text-[10px]", activeRow ? "text-white/50" : "text-slate-400")}>
                              {timeLabel(item.lastMessageAt)}
                            </span>
                          </span>
                          <span className={cn("mt-0.5 block truncate text-xs", activeRow ? "text-white/65" : "text-slate-500")}>
                            {item.lastPreview || "No messages yet"}
                          </span>
                          <span className="mt-1 flex items-center gap-2">
                            <span className={cn("text-[10px] font-medium", activeRow ? "text-white/45" : "text-slate-400")}>
                              {item.phone}
                            </span>
                            {item.unreadAdmin > 0 ? (
                              <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {item.unreadAdmin}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col bg-[#f7f4ee]">
          {!active ? (
            <div className="grid flex-1 place-items-center px-6 text-center">
              <div>
                <MessageSquareText size={36} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">Select a conversation</p>
                <p className="mt-1 text-xs text-slate-500">Reply to shoppers from the help chat on the store.</p>
              </div>
            </div>
          ) : (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e2d9] bg-white px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{active.name}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone size={12} />
                    {active.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                      active.status === "open" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {active.status}
                  </span>
                  {active.status === "open" ? (
                    <button
                      type="button"
                      onClick={() => setThreadStatus("closed")}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <CheckCheck size={13} />
                      Resolve
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setThreadStatus("open")}
                      className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Reopen
                    </button>
                  )}
                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 lg:hidden"
                    onClick={() => {
                      setSelectedId("");
                      setDetail(null);
                    }}
                    aria-label="Close conversation"
                  >
                    <X size={14} />
                  </button>
                </div>
              </header>

              <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {(detail.messages || []).map((item) => {
                  const mine = item.from === "admin";
                  const system = item.from === "system";
                  return (
                    <div key={item.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[min(28rem,85%)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                          system
                            ? "bg-[#fff7ed] text-[#9a3412] ring-1 ring-[#fed7aa]"
                            : mine
                              ? "rounded-br-md bg-[#111827] text-white"
                              : "rounded-bl-md bg-white text-slate-800 ring-1 ring-[#e7e2d9]"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{item.body}</p>
                        <p className={cn("mt-1.5 text-[10px]", mine ? "text-white/45" : "text-slate-400")}>
                          {system ? "System" : mine ? "You" : active.name} · {timeLabel(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={sendReply} className="border-t border-[#e7e2d9] bg-white p-3">
                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-[#faf8f4] p-2 focus-within:ring-2 focus-within:ring-slate-300">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={2}
                    placeholder="Write a reply…"
                    className="min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (reply.trim() && !pending) sendReply(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={pending || !reply.trim()}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#111827] px-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
                  >
                    <Send size={14} />
                    {pending ? "…" : "Send"}
                  </button>
                </div>
                <p className="mt-1.5 px-1 text-[11px] text-slate-400">Enter to send · Shift+Enter for new line</p>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
