/**
 * Monetag ad loaders — everything is driven by environment variables so a
 * zone can be switched (or turned off) without touching code.
 *
 * .env variables (leave empty / remove to disable that format):
 *
 *   VITE_MONETAG_SDK_DOMAIN        Monetag delivery domain (default: vemtoutcheeg.com)
 *   VITE_MONETAG_ONCLICK_ZONE      OnClick (Popunder) zone id
 *   VITE_MONETAG_VIGNETTE_ZONE     Vignette Banner zone id
 *   VITE_MONETAG_PUSH_ZONE         Push Notifications zone id
 *   VITE_MONETAG_INPAGE_PUSH_ZONE  In-Page Push zone id
 *   VITE_MONETAG_SW_PATH           Service worker path (default: /monetag-sw.js)
 *   VITE_MONETAG_EXCLUDE_PATHS     Comma separated paths where ads must not load
 *                                  (default: /tg,/dow,/plyr)
 */

export const MONETAG_SDK_DOMAIN =
  String(import.meta.env.VITE_MONETAG_SDK_DOMAIN || "vemtoutcheeg.com")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");

export const MONETAG_SW_PATH =
  String(import.meta.env.VITE_MONETAG_SW_PATH || "/monetag-sw.js").trim();

const cleanZone = (value) => String(value ?? "").trim();

export const MONETAG_ZONES = {
  onclick: cleanZone(import.meta.env.VITE_MONETAG_ONCLICK_ZONE),
  vignette: cleanZone(import.meta.env.VITE_MONETAG_VIGNETTE_ZONE),
  push: cleanZone(import.meta.env.VITE_MONETAG_PUSH_ZONE),
  inPagePush: cleanZone(import.meta.env.VITE_MONETAG_INPAGE_PUSH_ZONE),
};

export const getExcludedPaths = () =>
  String(import.meta.env.VITE_MONETAG_EXCLUDE_PATHS ?? "/tg,/dow,/plyr")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

export const isExcludedPath = (pathname = window.location.pathname) =>
  getExcludedPaths().includes(pathname);

/**
 * Injects a Monetag `tag.min.js` loader once per zone.
 * This is the tag used by Vignette Banner, In-Page Push and Push Notifications.
 */
export const loadMonetagTag = (zone, format, extraAttrs = {}) => {
  if (typeof document === "undefined") return null;
  const zoneId = cleanZone(zone);
  if (!zoneId) return null;

  const selector = `script[data-monetag-format="${format}"]`;
  const existing = document.querySelector(selector);
  if (existing) return existing;

  const script = document.createElement("script");
  script.src = `https://${MONETAG_SDK_DOMAIN}/tag.min.js`;
  script.async = true;
  script.dataset.zone = zoneId;
  script.dataset.monetagFormat = format;
  script.dataset.cfasync = "false";
  Object.entries(extraAttrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) script.setAttribute(key, String(value));
  });

  (document.body || document.documentElement).appendChild(script);
  return script;
};

/**
 * OnClick (Popunder). Monetag serves this format from the /4XX/<zone> path.
 */
export const loadMonetagOnClick = (zone = MONETAG_ZONES.onclick) => {
  if (typeof document === "undefined") return null;
  const zoneId = cleanZone(zone);
  if (!zoneId) return null;

  const selector = `script[data-monetag-format="onclick"]`;
  const existing = document.querySelector(selector);
  if (existing) return existing;

  const script = document.createElement("script");
  script.src = `https://${MONETAG_SDK_DOMAIN}/400/${zoneId}`;
  script.async = true;
  script.dataset.zone = zoneId;
  script.dataset.monetagFormat = "onclick";
  script.dataset.cfasync = "false";

  (document.body || document.documentElement).appendChild(script);
  return script;
};

export const loadMonetagVignette = (zone = MONETAG_ZONES.vignette) =>
  loadMonetagTag(zone, "vignette");

export const loadMonetagInPagePush = (zone = MONETAG_ZONES.inPagePush) =>
  loadMonetagTag(zone, "inpage-push");

/**
 * Push Notifications.
 * Monetag needs a same-origin service worker that imports their worker script,
 * so `public/monetag-sw.js` forwards the zone + delivery domain it is
 * registered with.
 */
export const loadMonetagPush = (zone = MONETAG_ZONES.push) => {
  const zoneId = cleanZone(zone);
  if (!zoneId) return null;

  loadMonetagTag(zoneId, "push", { "data-sw": MONETAG_SW_PATH });

  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    const swUrl = `${MONETAG_SW_PATH}?z=${encodeURIComponent(
      zoneId
    )}&d=${encodeURIComponent(MONETAG_SDK_DOMAIN)}`;
    navigator.serviceWorker.register(swUrl, { scope: "/" }).catch(() => {});
  }

  return true;
};
