import Link from "next/link";
import { ToyImage } from "@/components/product/ToyImage";
import { cn } from "@/lib/cn";

export function PictureTile({
  href,
  title,
  text,
  image,
  color = "#EEF0FF",
  shape = "rounded",
  onClick,
  className,
}) {
  const mediaClass =
    shape === "circle"
      ? "aspect-square overflow-hidden rounded-full shadow-soft"
      : "aspect-square overflow-hidden rounded-card shadow-soft";

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onClick}
      className={cn("group flex min-w-[118px] flex-col gap-3", className)}
    >
      <span className={cn("relative block transition duration-300 group-hover:-translate-y-1", mediaClass)} style={{ backgroundColor: color }}>
        {image ? (
          <ToyImage
            src={image}
            alt=""
            sizes="(min-width: 1024px) 200px, 45vw"
            className="object-contain p-3 transition-transform duration-300 group-active:scale-95 lg:p-5 lg:group-hover:scale-110"
          />
        ) : (
          <span className="grid h-full place-items-center px-3 text-center font-display text-2xl">{title}</span>
        )}
      </span>
      <span className="text-center">
        <span className="block font-display text-lg leading-tight">{title}</span>
        {text ? <span className="mt-1 block text-sm text-ink-muted">{text}</span> : null}
      </span>
    </Link>
  );
}
