let loadPromise = null;

export function getGoogleMapsKey() {
  return String(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim();
}

/** Load Maps JavaScript API once (Places loaded via importLibrary). */
export function loadGoogleMapsPlaces() {
  const key = getGoogleMapsKey();
  if (!key) return Promise.resolve(null);
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google);

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-masti-google-maps]");
      if (existing) {
        existing.addEventListener(
          "load",
          () => resolve(window.google),
          { once: true }
        );
        existing.addEventListener(
          "error",
          () => reject(new Error("Google Maps failed to load")),
          { once: true }
        );
        return;
      }

      // Official bootstrap loader — supports importLibrary("places") for Places API (New).
      window.__mastiGoogleMapsReady = () => resolve(window.google);
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&callback=__mastiGoogleMapsReady`;
      script.async = true;
      script.defer = true;
      script.dataset.mastiGoogleMaps = "1";
      script.onerror = () => {
        loadPromise = null;
        reject(new Error("Google Maps failed to load"));
      };
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}
