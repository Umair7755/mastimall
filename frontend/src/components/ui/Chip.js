import { cn } from "@/lib/cn";

export function chipClass(selected, className) {
  return cn(
    "inline-flex min-h-12 items-center justify-center rounded-full px-5 text-base",
    selected ? "border-2 border-brand bg-brand-soft text-ink" : "border-2 border-line bg-surface text-ink",
    className
  );
}
