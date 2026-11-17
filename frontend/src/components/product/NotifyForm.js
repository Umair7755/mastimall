"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/browser";
import { isPkMobile, normalizePhone } from "@/lib/phone";

export { AskParentButton, askParent } from "@/components/product/AskParentButton";

export function NotifyForm({ productId }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!isPkMobile(phone)) {
      setError("Phone number should look like 03XX-XXXXXXX.");
      return;
    }
    try {
      await apiFetch("/notify", {
        method: "POST",
        body: JSON.stringify({ productId, phone: normalizePhone(phone) }),
      });
      setMessage("We'll message this number when it's back.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (message) return <p className="text-ink">{message}</p>;

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field label="Phone" hint="03XX-XXXXXXX" error={error}>
        <Input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" />
      </Field>
      <Button type="submit" variant="secondary">
        Tell me when it&apos;s back
      </Button>
    </form>
  );
}
