/** Join class names, skipping empty values. */
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}
