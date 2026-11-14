/** Calendar day key in Asia/Karachi (YYYY-MM-DD). */
export function karachiDayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** List of day keys from oldest → newest covering `days` calendar days ending today (Karachi). */
export function karachiDayRange(days = 30) {
  const keys = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i -= 1) {
    keys.push(karachiDayKey(new Date(now - i * 24 * 60 * 60 * 1000)));
  }
  return keys;
}

export function newTrackingId() {
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}
