import { cn } from "@/lib/cn";

export function Field({ label, hint, error, children, compact = false }) {
  return (
    <label className="block">
      <span className={cn("block font-display text-ink", compact ? "mb-1 text-sm font-semibold" : "mb-2 text-lg")}>
        {label}
      </span>
      {children}
      {error ? <span className={cn("block text-danger", compact ? "mt-1 text-xs" : "mt-2 text-sm")}>{error}</span> : null}
      {!error && hint ? (
        <span className={cn("block text-ink-muted", compact ? "mt-1 text-xs" : "mt-2 text-sm")}>{hint}</span>
      ) : null}
    </label>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-14 w-full rounded-field border-2 border-line bg-surface px-4 text-base text-ink focus:border-brand",
        className
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-field border-2 border-line bg-surface px-4 py-3 text-base text-ink focus:border-brand",
        className
      )}
      {...props}
    />
  );
}
