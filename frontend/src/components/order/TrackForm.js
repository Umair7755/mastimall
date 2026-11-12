"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { isPkMobile, normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/cn";

export function TrackForm({ orderNumber = "", compact = false }) {
  const router = useRouter();
  const [number, setNumber] = useState(orderNumber);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event) {
    event.preventDefault();
    if (!number.trim()) {
      setError("Enter the order number from your confirmation.");
      return;
    }
    if (!isPkMobile(phone)) {
      setError("Phone number should look like 03XX-XXXXXXX.");
      return;
    }
    router.push(`/order/${encodeURIComponent(number.trim())}?phone=${encodeURIComponent(normalizePhone(phone))}`);
  }

  return (
    <form onSubmit={onSubmit} className={cn("grid", compact ? "gap-3" : "gap-4")}>
      <div className={cn(compact && "grid gap-3 sm:grid-cols-2")}>
        <Field label="Order number">
          <Input
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            placeholder="MM-240001"
            className={cn("rounded-xl", compact ? "h-11" : "h-12")}
          />
        </Field>
        <Field label="Phone" hint={compact ? undefined : "Use the same number from checkout."} error={error}>
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
            placeholder="03XX-XXXXXXX"
            className={cn("rounded-xl", compact ? "h-11" : "h-12")}
          />
        </Field>
      </div>
      {compact ? <p className="text-[11px] text-ink-muted">Use the same phone number from checkout.</p> : null}
      <Button type="submit" className={cn("w-full rounded-xl", compact ? "h-11" : "h-12")}>
        <Search size={16} aria-hidden="true" />
        Track my order
      </Button>
    </form>
  );
}
