import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-display text-4xl">That page is not in the shop.</h1>
      <p className="mt-3 text-ink-muted">Try a picture from the homepage instead.</p>
      <ButtonLink href="/" className="mt-6">
        Back to toys
      </ButtonLink>
      <p className="mt-4">
        <Link href="/search" className="text-brand">
          Search
        </Link>
      </p>
    </div>
  );
}
