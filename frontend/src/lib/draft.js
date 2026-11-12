const KEY = "mastimall-checkout";

/** Remember the last checkout details on this device. */
export function readDraft() {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function writeDraft(value) {
  if (typeof window === "undefined") return;
  try {
    const safe = {
      name: String(value?.name || ""),
      phone: String(value?.phone || ""),
      city: String(value?.city || ""),
      address: String(value?.address || ""),
      notes: String(value?.notes || ""),
      paymentMethod: String(value?.paymentMethod || "cod"),
    };
    localStorage.setItem(KEY, JSON.stringify(safe));
  } catch {
    // Ignore quota / private-mode failures so checkout never crashes.
  }
}
