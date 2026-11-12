import Link from "next/link";
import { cn } from "@/lib/cn";

const base =
  "relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-ink transition duration-200 hover:bg-brand hover:text-white hover:-translate-y-0.5 active:translate-y-0";

export function IconButton({ className, type = "button", ...props }) {
  return <button type={type} className={cn(base, className)} {...props} />;
}

export function IconLink({ href, className, children, ...props }) {
  return (
    <Link href={href} className={cn(base, className)} {...props}>
      {children}
    </Link>
  );
}
