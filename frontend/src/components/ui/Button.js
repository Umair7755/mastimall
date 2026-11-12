import Link from "next/link";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-brand text-white hover:bg-brand-dark active:scale-[0.98]",
  cart:
    "bg-sun text-ink shadow-soft hover:brightness-105 hover:shadow-lift active:scale-[0.98]",
  secondary:
    "border border-line bg-white text-ink hover:border-brand hover:bg-brand-soft",
  sun:
    "bg-sun text-ink hover:brightness-105 active:scale-[0.98]",
  soft:
    "bg-brand-soft text-brand hover:bg-brand hover:text-white",
  ghost:
    "bg-transparent text-ink hover:bg-brand-soft",
};

export function buttonClass(variant = "primary", className) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 font-display text-sm font-semibold transition duration-150 disabled:pointer-events-none disabled:opacity-50 sm:min-h-12 sm:text-base",
    variants[variant] || variants.primary,
    className
  );
}

export function Button({ variant = "primary", className, type = "button", ...props }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({ href, variant = "primary", className, children, prefetch = true, onClick }) {
  const classNames = buttonClass(variant, className);
  if (href.startsWith("#")) {
    return (
      <a href={href} className={classNames} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} prefetch={prefetch} className={classNames} onClick={onClick}>
      {children}
    </Link>
  );
}
