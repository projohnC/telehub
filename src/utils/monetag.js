/**
 * Monetag ad loaders.
 *
 * Each Monetag format has its OWN delivery domain and script, exactly as given
 * in the Monetag dashboard. The defaults below are the live tags for this site:
 *
 *   Push Notifications : https://5gvci.com/act/files/tag.min.js?z=11459297
 *   Vignette Banner    : https://n6wxm.com/vignette.min.js   zone 11459004
 *   OnClick (Popunder) : https://al5sm.com/tag.min.js        zone 11458975
 *   In-Page Push       : https://nap5k.com/tag.min.js        zone 11142279
 *
 * Optional .env overrides (all optional — defaults above are already live):
 *   VITE_MONETAG_PUSH_SRC
 *   VITE_MONETAG_VIGNETTE_SRC     / VITE_MONETAG_VIGNETTE_ZONE
 *   VITE_MONETAG_ONCLICK_SRC      / VITE_MONETAG_ONCLICK_ZONE
 *   VITE_MONETAG_INPAGE_PUSH_SRC  / VITE_MONETAG_INPAGE_PUSH_ZONE
 *   VITE_MONETAG_DEBUG=true
 *   VITE_MONETAG_EXCLUDE_PATHS=/tg,/dow,/plyr
 */

const env = import.meta.env;

const clean = (value) => String(value ?? "").trim();

export const MONETAG_DEBUG =
  clean(env.VITE_MONETAG_DEBUG) === "true" ||
  (typeof window !== "undefined" && window.MONETAG_DEBUG === true);

const log = (...args) => {
  if (MONETAG_DEBUG) console.log("[monetag]", ...args);
};

const runtime = () =>
  (typeof window !== "undefined" && window.MONETAG_TAGS) || {};

/** format -> { src, zone } */
export const MONETAG_TAGS = {
  push: {
    src: clean(
      runtime().push?.src ||
        env.VITE_MONETAG_PUSH_SRC ||
        "https://5gvci.com/act/files/tag.min.js?z=11459297"
    ),
    zone: clean(runtime().push?.zone || env.VITE_MONETAG_PUSH_ZONE),
  },
  vignette: {
    src: clean(
      runtime().vignette?.src ||
        env.VITE_MONETAG_VIGNETTE_SRC ||
        "https://n6wxm.com/vignette.min.js"
    ),
    zone: clean(
      runtime().vignette?.zone || env.VITE_MONETAG_VIGNETTE_ZONE || "11459004"
    ),
  },
  onclick: {
    src: clean(
      runtime().onclick?.src ||
        env.VITE_MONETAG_ONCLICK_SRC ||
        "https://al5sm.com/tag.min.js"
    ),
    zone: clean(
      runtime().onclick?.zone || env.VITE_MONETAG_ONCLICK_ZONE || "11458975"
    ),
  },
  inPagePush: {
    src: clean(
      runtime().inPagePush?.src ||
        env.VITE_MONETAG_INPAGE_PUSH_SRC ||
        "https://nap5k.com/tag.min.js"
    ),
    zone: clean(
      runtime().inPagePush?.zone ||
        env.VITE_MONETAG_INPAGE_PUSH_ZONE ||
        "11142279"
    ),
  },
};

export const getExcludedPaths = () =>
  String(env.VITE_MONETAG_EXCLUDE_PATHS ?? "/tg,/dow,/plyr")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

export const isExcludedPath = (pathname = window.location.pathname) =>
  getExcludedPaths().includes(pathname);

/**
 * Injects one Monetag tag, replicating the dashboard snippet exactly:
 *   (function(s){s.dataset.zone='<zone>',s.src='<src>'})(
 *     [document.documentElement, document.body].filter(Boolean).pop()
 *       .appendChild(document.createElement('script')))
 */
export const loadMonetagScript = (format) => {
  if (typeof document === "undefined") return null;

  const tag = MONETAG_TAGS[format];
  if (!tag || !tag.src) {
    log(`skipped ${format}: no src configured`);
    return null;
  }

  if (document.querySelector(`script[data-monetag-format="${format}"]`)) {
    return null;
  }

  const host = [document.documentElement, document.body].filter(Boolean).pop();
  const script = host.appendChild(document.createElement("script"));
  script.dataset.monetagFormat = format;
  script.setAttribute("data-cfasync", "false");
  if (tag.zone) script.dataset.zone = tag.zone;
  script.onerror = () =>
    console.warn(
      `[monetag] ${format} failed to load (ad blocker or wrong domain): ${tag.src}`
    );
  script.onload = () => log(`${format} loaded`);
  script.src = tag.src;

  log(`injecting ${format}`, tag);
  return script;
};

export const loadMonetagOnClick = () => loadMonetagScript("onclick");
export const loadMonetagVignette = () => loadMonetagScript("vignette");
export const loadMonetagInPagePush = () => loadMonetagScript("inPagePush");
export const loadMonetagPush = () => loadMonetagScript("push");

export const loadAllMonetag = () => {
  loadMonetagOnClick();
  loadMonetagVignette();
  loadMonetagInPagePush();
  loadMonetagPush();
};
