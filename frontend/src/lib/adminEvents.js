/** Ask AdminShell to refresh nav badges immediately (orders / carts / support). */
export const ADMIN_BADGES_REFRESH = "mastimall:admin-badges-refresh";

export function refreshAdminBadges() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_BADGES_REFRESH));
}
