"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/cn";

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ className, children }) {
  return (
    <div className={cn("rounded-xl border border-slate-200/80 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = "slate" }) {
  const tones = {
    slate: "from-slate-50 to-white",
    indigo: "from-indigo-50 to-white",
    emerald: "from-emerald-50 to-white",
    amber: "from-amber-50 to-white",
    rose: "from-rose-50 to-white",
    sky: "from-sky-50 to-white",
  };
  return (
    <Card className={cn("bg-gradient-to-br p-4", tones[tone] || tones.slate)}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </Card>
  );
}

export function AdminField({ label, children, className }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export function AdminInput({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
        className
      )}
      {...props}
    />
  );
}

export function AdminSelect({ className, children, ...props }) {
  return (
    <div className={cn("relative", className || "w-full")}>
      <select
        className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function PageIconButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition",
        "hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
        "disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-slate-50 disabled:hover:text-slate-300"
      )}
    >
      {children}
    </button>
  );
}

export function Pagination({ page = 1, pages = 1, total = 0, limit = 10, onPageChange, onLimitChange }) {
  const safePages = Math.max(1, pages || 1);
  const current = Math.min(Math.max(1, page || 1), safePages);
  const from = total === 0 ? 0 : (current - 1) * limit + 1;
  const to = Math.min(total, current * limit);

  const pageItems = [];
  const windowSize = 5;
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  let end = Math.min(safePages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  for (let i = start; i <= end; i += 1) pageItems.push(i);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{from}</span>–
        <span className="font-semibold text-slate-700">{to}</span> of{" "}
        <span className="font-semibold text-slate-700">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {onLimitChange ? (
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline">Rows</span>
            <AdminSelect
              className="w-[7.5rem]"
              value={String(limit)}
              onChange={(event) => onLimitChange(Number(event.target.value))}
              aria-label="Rows per page"
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </AdminSelect>
          </label>
        ) : null}

        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-1">
          <PageIconButton
            label="First page"
            disabled={current <= 1}
            onClick={() => onPageChange?.(1)}
          >
            <ChevronsLeft size={16} strokeWidth={2.25} aria-hidden="true" />
          </PageIconButton>
          <PageIconButton
            label="Previous page"
            disabled={current <= 1}
            onClick={() => onPageChange?.(current - 1)}
          >
            <ChevronLeft size={16} strokeWidth={2.25} aria-hidden="true" />
          </PageIconButton>

          {pageItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange?.(item)}
              aria-current={item === current ? "page" : undefined}
              className={cn(
                "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg px-2 text-sm font-semibold transition",
                item === current
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-indigo-700"
              )}
            >
              {item}
            </button>
          ))}

          <PageIconButton
            label="Next page"
            disabled={current >= safePages}
            onClick={() => onPageChange?.(current + 1)}
          >
            <ChevronRight size={16} strokeWidth={2.25} aria-hidden="true" />
          </PageIconButton>
          <PageIconButton
            label="Last page"
            disabled={current >= safePages}
            onClick={() => onPageChange?.(safePages)}
          >
            <ChevronsRight size={16} strokeWidth={2.25} aria-hidden="true" />
          </PageIconButton>
        </div>
      </div>
    </div>
  );
}

export function AdminTextarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
        className
      )}
      {...props}
    />
  );
}

export function AdminButton({ variant = "primary", className, ...props }) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
    ghost: "text-slate-600 hover:bg-slate-100",
  };
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition disabled:opacity-50",
        variants[variant] || variants.primary,
        className
      )}
      {...props}
    />
  );
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", tones[tone])}>
      {children}
    </span>
  );
}

export function DataTable({ columns, rows, empty = "No data yet." }) {
  if (!rows?.length) {
    return <p className="px-4 py-8 text-center text-sm text-slate-500">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn("px-4 py-3 font-semibold", col.headerClassName)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                "border-b border-slate-50 last:border-0 hover:bg-slate-50/70",
                row.blocked && "bg-rose-50/40"
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3.5 align-middle text-slate-700", col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
