"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, Check, Copy, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, TextArea } from "@/components/ui/Input";
import { useCheckoutSettings } from "@/hooks/useCheckoutSettings";
import { useQuote } from "@/hooks/useQuote";
import { apiFetch } from "@/lib/browser";
import { PAYMENT_METHODS } from "@/lib/constants";
import { readDraft, writeDraft } from "@/lib/draft";
import { formatPkr } from "@/lib/format";
import { isPkMobile, normalizePhone } from "@/lib/phone";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/cn";

const MAX_RECEIPT_BYTES = 2.5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const WALLET_METHODS = new Set(["jazzcash", "easypaisa"]);
const ALLOWED_PAYMENTS = new Set(["cod", "jazzcash", "easypaisa"]);

const schema = z.object({
  name: z.string().trim().min(2, "Please enter the name for the parcel."),
  phone: z.string().trim().refine((value) => isPkMobile(value), "Phone number should look like 03XX-XXXXXXX."),
  city: z.string().trim().min(2, "Choose a city."),
  address: z.string().trim().min(6, "Add the house number, street and area."),
  notes: z.string().trim().max(300).optional(),
  paymentMethod: z.enum(["cod", "jazzcash", "easypaisa"]),
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: "Please accept the Terms of Service to place your order.",
  }),
});

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read that image. Try another file."));
    reader.readAsDataURL(file);
  });
}

function PaymentLogo({ method }) {
  if (method === "cod") {
    return (
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
        <Banknote className="h-5 w-5" aria-hidden />
      </span>
    );
  }

  if (method === "jazzcash") {
    return (
      <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-black ring-1 ring-black/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/trust/jazzcash.png" alt="" width={40} height={40} className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-black/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/trust/easypaisa.jpg" alt="" width={40} height={40} className="h-8 w-8 object-contain" />
    </span>
  );
}

function CopyChip({ value }) {
  const [copied, setCopied] = useState(false);

  async function copy(event) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-sm ring-1 ring-black/5"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const receiptInputId = useId();
  const termsId = useId();
  const citiesId = useId();
  const fileRef = useRef(null);
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const settings = useCheckoutSettings();
  const [serverError, setServerError] = useState("");
  const [ready, setReady] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [receiptDataUrl, setReceiptDataUrl] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [receiptName, setReceiptName] = useState("");

  const paymentMethods = (
    Array.isArray(settings.paymentMethods) && settings.paymentMethods.length
      ? settings.paymentMethods
      : PAYMENT_METHODS
  ).filter((method) => method?.id && ALLOWED_PAYMENTS.has(method.id));

  const cities = Array.isArray(settings.cities) ? settings.cities : [];

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      city: "",
      address: "",
      notes: "",
      paymentMethod: "cod",
      acceptTerms: false,
    },
  });

  const { register, setValue, watch, handleSubmit, reset, formState } = form;
  const city = watch("city");
  const paymentMethod = watch("paymentMethod") || "cod";
  const acceptTerms = watch("acceptTerms");
  const needsReceipt = WALLET_METHODS.has(paymentMethod);
  const { quote, loading, error } = useQuote(items, city || "Other");

  const selectedMethod = paymentMethods.find((method) => method.id === paymentMethod) || null;

  useEffect(() => {
    const draft = readDraft();
    reset({
      name: draft.name || "",
      phone: draft.phone || "",
      city: draft.city || "",
      address: draft.address || "",
      notes: draft.notes || "",
      paymentMethod: ALLOWED_PAYMENTS.has(draft.paymentMethod) ? draft.paymentMethod : "cod",
      acceptTerms: false,
    });
    setReady(true);
  }, [reset]);

  useEffect(() => {
    if (!ready) return undefined;
    const subscription = watch((values) => writeDraft(values));
    return () => subscription.unsubscribe();
  }, [watch, ready]);

  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    };
  }, [receiptPreview]);

  useEffect(() => {
    if (!needsReceipt) setReceiptError("");
  }, [needsReceipt]);

  function selectPayment(methodId) {
    if (!ALLOWED_PAYMENTS.has(methodId)) return;
    setValue("paymentMethod", methodId, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  }

  async function onReceiptChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setReceiptError("");
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      setReceiptError("Please attach a JPG, PNG, or WebP screenshot of your receipt.");
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setReceiptError("Receipt is too large. Keep it under 2.5 MB.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(URL.createObjectURL(file));
      setReceiptDataUrl(dataUrl);
      setReceiptName(file.name);
    } catch (err) {
      setReceiptError(err.message || "Could not read that image.");
    }
  }

  function clearReceipt() {
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview("");
    setReceiptDataUrl("");
    setReceiptName("");
    setReceiptError("");
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-[32px] font-semibold">Checkout</h1>
        <p className="mt-3 font-display text-2xl">Your cart is empty. Pick a toy to start.</p>
      </div>
    );
  }

  async function onSubmit(values) {
    setServerError("");
    setReceiptError("");
    if (WALLET_METHODS.has(values.paymentMethod) && !receiptDataUrl) {
      setReceiptError("Please attach your JazzCash or EasyPaisa payment receipt.");
      return;
    }

    const phone = normalizePhone(values.phone);
    writeDraft({ ...values, phone });
    try {
      const data = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
          customer: {
            name: values.name,
            phone,
            city: values.city,
            address: values.address,
            notes: values.notes || "",
          },
          paymentMethod: values.paymentMethod,
          paymentReceipt: WALLET_METHODS.has(values.paymentMethod) ? receiptDataUrl : "",
          source: "web",
        }),
      });
      try {
        sessionStorage.setItem("mastimall-last-order", JSON.stringify(data.order));
      } catch {
        // ignore
      }
      clear();
      clearReceipt();
      router.push(`/order/${data.orderNumber}?placed=1`);
    } catch (err) {
      setServerError(err.message || "Could not place the order. Please try again.");
    }
  }

  const blocked = Boolean(quote?.problems?.length) || loading || formState.isSubmitting || !acceptTerms;

  return (
    <div className="mx-auto max-w-4xl px-4 py-5 pb-20 lg:py-7">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-tight lg:text-[34px]">Checkout</h1>
          <p className="mt-0.5 text-sm text-ink-muted">Delivery + payment in one short step.</p>
        </div>
        {quote ? (
          <p className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand">
            {formatPkr(quote.total)}
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0 rounded-2xl border border-line/70 bg-white p-3.5 shadow-soft sm:p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field compact label="Name" error={formState.errors.name?.message}>
              <Input className="h-11" autoComplete="name" {...register("name")} />
            </Field>
            <Field compact label="Phone" hint="03XX-XXXXXXX" error={formState.errors.phone?.message}>
              <Input className="h-11" inputMode="tel" autoComplete="tel" {...register("phone")} />
            </Field>
            <Field compact label="City" error={formState.errors.city?.message}>
              <Input className="h-11" list={citiesId} autoComplete="address-level2" {...register("city")} />
            </Field>
            <Field compact label="Landmark" hint="Optional">
              <Input className="h-11" {...register("notes")} />
            </Field>
          </div>
          <datalist id={citiesId}>
            {cities.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <div className="mt-3">
            <Field compact label="Address" error={formState.errors.address?.message}>
              <TextArea className="min-h-[3.75rem]" rows={2} autoComplete="street-address" {...register("address")} />
            </Field>
          </div>

          <div className="mt-4 border-t border-line/60 pt-3.5">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-semibold">Payment method</h2>
              <p className="text-[11px] text-ink-muted">Tap one to select</p>
            </div>

            {/* Controlled segment — avoids broken radio/label nesting crashes */}
            <div
              role="radiogroup"
              aria-label="Payment method"
              className="grid grid-cols-1 gap-2 sm:grid-cols-3"
            >
              {paymentMethods.map((method) => {
                const selected = paymentMethod === method.id;
                const accent =
                  method.accent ||
                  (method.id === "jazzcash" ? "#EE2724" : method.id === "easypaisa" ? "#00B140" : "#0F766E");
                return (
                  <button
                    key={method.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => selectPayment(method.id)}
                    className={cn(
                      "flex min-w-0 items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition",
                      selected ? "bg-white shadow-sm" : "border-line/80 bg-[#faf8f4] hover:bg-white"
                    )}
                    style={{ borderColor: selected ? accent : undefined }}
                  >
                    <PaymentLogo method={method.id} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-1">
                        <span className="truncate font-display text-sm font-semibold">{method.label}</span>
                        <span
                          className="grid h-4 w-4 shrink-0 place-items-center rounded-full border-2"
                          style={{
                            borderColor: selected ? accent : "rgba(15,23,42,0.2)",
                            background: selected ? accent : "transparent",
                          }}
                          aria-hidden
                        >
                          {selected ? <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} /> : null}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-ink-muted">
                        {method.id === "cod" ? "Pay on delivery" : "Transfer + receipt"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {needsReceipt && selectedMethod ? (
              <div className="mt-3 rounded-xl border border-dashed border-ink/15 bg-[#faf8f4] p-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Send {selectedMethod.label} payment to
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">{selectedMethod.accountName || "Masti Mall"}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-semibold tabular-nums tracking-wide">
                        {selectedMethod.accountNumber || "—"}
                      </p>
                      {selectedMethod.accountNumber ? <CopyChip value={selectedMethod.accountNumber} /> : null}
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">
                      Amount: <span className="font-semibold text-ink">{quote ? formatPkr(quote.total) : "…"}</span>
                    </p>
                  </div>

                  <div className="min-w-0 sm:w-[200px]">
                    <input
                      ref={fileRef}
                      id={receiptInputId}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={onReceiptChange}
                    />
                    {receiptPreview ? (
                      <div className="overflow-hidden rounded-xl border border-line bg-white">
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={receiptPreview}
                            alt="Receipt preview"
                            className="h-24 w-full object-contain bg-white"
                          />
                          <button
                            type="button"
                            onClick={clearReceipt}
                            className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink/85 text-white"
                            aria-label="Remove receipt"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="w-full border-t border-line px-2 py-1.5 text-xs font-semibold text-ink"
                          onClick={() => fileRef.current?.click()}
                        >
                          Replace · {receiptName || "receipt"}
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={receiptInputId}
                        className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink/20 bg-white px-2 text-center transition hover:border-ink/40"
                      >
                        <ImagePlus className="h-4 w-4 text-ink" />
                        <span className="text-xs font-semibold">Attach receipt</span>
                        <span className="text-[10px] text-ink-muted">Max 2.5 MB</span>
                      </label>
                    )}
                  </div>
                </div>
                {receiptError ? <p className="mt-2 text-xs text-danger">{receiptError}</p> : null}
              </div>
            ) : (
              <p className="mt-3 rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-800">
                COD selected — pay cash to the rider. No receipt needed.
              </p>
            )}
          </div>
        </div>

        <aside className="min-w-0 rounded-2xl border border-line/70 bg-surface p-3.5 shadow-soft lg:sticky lg:top-24">
          <h2 className="font-display text-base font-semibold">Order summary</h2>
          <div className="mt-2 max-h-40 space-y-1.5 overflow-auto text-sm">
            {items.map((item) => {
              const line = quote?.lines?.find((entry) => entry.productId === item.productId);
              return (
                <p key={item.productId} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate">
                    {item.title} × {item.qty}
                  </span>
                  <span className="shrink-0 tabular-nums">{line ? formatPkr(line.lineTotal) : ""}</span>
                </p>
              );
            })}
          </div>
          <p className="mt-3 flex justify-between border-t border-line/70 pt-2 text-sm">
            <span>Delivery</span>
            <span>{quote ? (quote.fee === 0 ? "Free" : formatPkr(quote.fee)) : "…"}</span>
          </p>
          <p className="mt-1 flex items-baseline justify-between gap-2">
            <span className="font-display font-semibold">Total</span>
            <span className="font-display text-2xl font-semibold tabular-nums">
              {quote ? formatPkr(quote.total) : "…"}
            </span>
          </p>

          <label htmlFor={termsId} className="mt-3 flex cursor-pointer items-start gap-2 rounded-xl bg-white/70 p-2.5">
            <input
              id={termsId}
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-line text-brand focus:ring-brand"
              {...register("acceptTerms")}
            />
            <span className="text-xs leading-relaxed text-ink">
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-brand underline-offset-2 hover:underline">
                Terms of Service
              </Link>
              .
            </span>
          </label>
          {formState.errors.acceptTerms?.message ? (
            <p className="mt-1.5 text-xs text-danger">{formState.errors.acceptTerms.message}</p>
          ) : null}

          {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
          {quote?.problems?.map((problem) => (
            <p key={problem} className="mt-1 text-sm text-danger">
              {problem}
            </p>
          ))}
          {serverError ? <p className="mt-2 text-sm text-danger">{serverError}</p> : null}

          <Button type="submit" className="mt-3 w-full" disabled={blocked}>
            {formState.isSubmitting ? "Placing order…" : "Place order"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
