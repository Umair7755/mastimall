"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Home, MapPin, Navigation, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { getGoogleMapsKey, loadGoogleMapsPlaces } from "@/lib/googleMaps";

function pickCityFromComponents(components = [], allowed = []) {
  const list = Array.isArray(components) ? components : [];
  const byType = (type) => {
    const hit = list.find((c) => {
      const types = c.types || c.addressComponentTypes || [];
      return Array.isArray(types) && types.includes(type);
    });
    return hit?.longText || hit?.long_name || hit?.text || "";
  };

  const candidates = [
    byType("locality"),
    byType("administrative_area_level_2"),
    byType("administrative_area_level_1"),
  ].filter(Boolean);

  const normalizedAllowed = allowed.map((c) => ({
    raw: c,
    key: String(c).trim().toLowerCase(),
  }));

  for (const name of candidates) {
    const key = name.trim().toLowerCase();
    const hit = normalizedAllowed.find(
      (c) => c.key === key || key.includes(c.key) || c.key.includes(key)
    );
    if (hit) return hit.raw;
  }
  return candidates[0] || "";
}

function joinAddress(house, place) {
  const h = String(house || "").trim();
  const p = String(place || "").trim();
  if (h && p) return `${h}, ${p}`;
  return h || p;
}

/** Split saved address into house + place when possible. */
function splitAddress(full) {
  const text = String(full || "").trim();
  if (!text) return { house: "", place: "" };
  const comma = text.indexOf(",");
  if (comma > 0 && comma < 40) {
    return {
      house: text.slice(0, comma).trim(),
      place: text.slice(comma + 1).trim(),
    };
  }
  return { house: "", place: text };
}

/**
 * Google area search + house/flat number.
 * Final address = "House …, Society / area …"
 */
export function AddressAutocomplete({
  value = "",
  onChange,
  onCity,
  cities = [],
  error,
  className,
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const placesLibRef = useRef(null);
  const sessionRef = useRef(null);
  const skipSplitRef = useRef(false);
  const lastFetchedRef = useRef("");
  const selectedLockRef = useRef(false);

  const initial = splitAddress(value);
  const [house, setHouse] = useState(initial.house);
  const [place, setPlace] = useState(initial.place);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const hasKey = Boolean(getGoogleMapsKey());

  const MIN_CHARS = 4;
  const DEBOUNCE_MS = 550;

  function pushAddress(nextHouse, nextPlace) {
    skipSplitRef.current = true;
    onChange?.(joinAddress(nextHouse, nextPlace));
  }

  useEffect(() => {
    if (skipSplitRef.current) {
      skipSplitRef.current = false;
      return;
    }
    const parts = splitAddress(value);
    setHouse(parts.house);
    setPlace(parts.place);
  }, [value]);

  useEffect(() => {
    if (!hasKey) return undefined;
    let alive = true;
    loadGoogleMapsPlaces()
      .then(async (google) => {
        if (!alive || !google?.maps?.importLibrary) return;
        const places = await google.maps.importLibrary("places");
        placesLibRef.current = places;
        sessionRef.current = new places.AutocompleteSessionToken();
        setReady(true);
      })
      .catch(() => {
        if (alive) setReady(false);
      });
    return () => {
      alive = false;
    };
  }, [hasKey]);

  useEffect(() => {
    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  useEffect(() => {
    if (!hasKey || !ready || !placesLibRef.current) return undefined;

    // After a pick, don't fire another search for the filled formatted address.
    if (selectedLockRef.current) {
      selectedLockRef.current = false;
      return undefined;
    }

    const text = place.trim().replace(/\s+/g, " ");
    if (text.length < MIN_CHARS) {
      setPredictions([]);
      setLoading(false);
      lastFetchedRef.current = "";
      return undefined;
    }

    // Skip duplicate request for the same query.
    if (text === lastFetchedRef.current) return undefined;

    let cancel = false;
    const timer = setTimeout(async () => {
      if (cancel) return;
      if (text === lastFetchedRef.current) return;
      setLoading(true);
      try {
        const { AutocompleteSuggestion } = placesLibRef.current;
        const { suggestions } =
          await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: text,
            includedRegionCodes: ["pk"],
            sessionToken: sessionRef.current || undefined,
          });
        if (cancel) return;
        lastFetchedRef.current = text;
        const next = (suggestions || [])
          .map((item) => {
            const prediction = item.placePrediction;
            if (!prediction) return null;
            return {
              placeId: prediction.placeId,
              description: prediction.text?.text || "",
              main: prediction.mainText?.text || prediction.text?.text || "",
              secondary: prediction.secondaryText?.text || "",
              prediction,
            };
          })
          .filter(Boolean)
          .slice(0, 5);
        setPredictions(next);
        setOpen(Boolean(next.length));
      } catch {
        if (!cancel) setPredictions([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [place, hasKey, ready]);

  async function selectPrediction(item) {
    selectedLockRef.current = true;
    setPredictions([]);
    setOpen(false);
    setLoading(false);
    try {
      const places = placesLibRef.current;
      if (!places || !item?.prediction) {
        setPlace(item.description);
        lastFetchedRef.current = item.description.trim();
        pushAddress(house, item.description);
        return;
      }
      const selected = item.prediction.toPlace();
      await selected.fetchFields({
        fields: ["formattedAddress", "addressComponents", "displayName"],
      });
      sessionRef.current = new places.AutocompleteSessionToken();
      const nextPlace =
        selected.formattedAddress || selected.displayName || item.description;
      setPlace(nextPlace);
      lastFetchedRef.current = String(nextPlace).trim();
      pushAddress(house, nextPlace);
      const city = pickCityFromComponents(selected.addressComponents || [], cities);
      if (city) onCity?.(city);
    } catch {
      setPlace(item.description);
      lastFetchedRef.current = item.description.trim();
      pushAddress(house, item.description);
    }
  }

  if (!hasKey) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        rows={2}
        autoComplete="street-address"
        placeholder="House no, street, area…"
        className={cn(
          "min-h-[3.75rem] w-full rounded-field border-2 border-line bg-surface px-4 py-3 text-base text-ink focus:border-brand",
          className
        )}
      />
    );
  }

  const preview = joinAddress(house, place);

  return (
    <div ref={rootRef} className={cn("grid gap-2.5", className)}>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          House / flat no.
        </p>
        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl border-2 bg-white px-3 py-2 transition",
            error && !house ? "border-danger" : "border-line focus-within:border-brand"
          )}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
            <Home size={15} aria-hidden="true" />
          </span>
          <input
            value={house}
            onChange={(e) => {
              const next = e.target.value;
              setHouse(next);
              pushAddress(next, place);
            }}
            autoComplete="address-line1"
            placeholder="e.g. House 32, Street 16"
            className="h-9 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
      </div>

      <div className="relative">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          Area / society
        </p>
        <div
          className={cn(
            "flex items-start gap-2 rounded-2xl border-2 bg-gradient-to-br from-white via-white to-[#f8fafc] px-3 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition",
            error ? "border-danger" : open ? "border-brand ring-2 ring-brand/15" : "border-line focus-within:border-brand"
          )}
        >
          <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
            <MapPin size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Search size={14} className="shrink-0 text-ink-muted" aria-hidden="true" />
              <input
                value={place}
                onChange={(e) => {
                  const next = e.target.value;
                  selectedLockRef.current = false;
                  setPlace(next);
                  pushAddress(house, next);
                }}
                onFocus={() => {
                  if (predictions.length) setOpen(true);
                }}
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                autoComplete="off"
                placeholder="Search society, block, area…"
                className="h-9 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted"
              />
              {place ? (
                <button
                  type="button"
                  aria-label="Clear area"
                  onClick={() => {
                    selectedLockRef.current = false;
                    lastFetchedRef.current = "";
                    setPlace("");
                    pushAddress(house, "");
                    setPredictions([]);
                    setOpen(false);
                    setLoading(false);
                  }}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-slate-100 hover:text-ink"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              {loading
                ? "Searching places…"
                : ready
                  ? `Type at least ${MIN_CHARS} letters · searches after you pause`
                  : "Loading address search…"}
            </p>
          </div>
        </div>

        {open && (predictions.length > 0 || loading) ? (
          <div
            id={listId}
            role="listbox"
            className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-line/80 bg-white shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)]"
          >
            <ul className="max-h-72 overflow-auto py-1">
              {predictions.map((item) => (
                <li key={item.placeId}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => selectPrediction(item)}
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-brand-soft/70"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ecfdf5] text-emerald-700">
                      <Navigation size={14} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {item.main}
                      </span>
                      {item.secondary ? (
                        <span className="mt-0.5 block truncate text-xs text-ink-muted">
                          {item.secondary}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="border-t border-line/60 px-3 py-1.5 text-[10px] font-medium tracking-wide text-ink-muted">
              Places by Google · Pakistan
            </p>
          </div>
        ) : null}
      </div>

      {preview ? (
        <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200/80">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Full delivery address
          </p>
          <p className="mt-0.5 text-sm font-medium leading-snug text-ink">{preview}</p>
        </div>
      ) : null}
    </div>
  );
}
