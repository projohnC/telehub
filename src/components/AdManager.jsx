// src/components/AdManager.jsx
import { useEffect, useRef } from "react";

// Ad-network script (Adsterra/PropellerAds-style). Injected as <script>.
const POPUNDER_SCRIPT =
  import.meta.env.VITE_POPUNDER_ADS ||
  "";

// Optional: a real landing-page URL you open yourself (manual popunder).
// Leave empty if you're only using the network script above.
const POPUNDER_URL = import.meta.env.VITE_POPUNDER_URL || "";

// Optional: direct-link URL for click-triggered opens.
const DIRECT_LINK_URL = import.meta.env.VITE_DIRECT_LINK_URL || "https://omg10.com/4/11223473";

const COOLDOWN_MS = 60 * 1000;
const MIN_CLICK_GAP_MS = 800;
const STORAGE_KEY = "hs_pop_last";

const now = () => Date.now();
const getLastPop = () => {
  try { return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) || 0; }
  catch { return 0; }
};
const setLastPop = (t) => {
  try { localStorage.setItem(STORAGE_KEY, String(t)); } catch {}
};

// Reject anything that isn't a genuine primary click on a safe element.
function isRealUserClick(e) {
  if (!e.isTrusted || e.button !== 0) return false;
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return false;
  const t = e.target;
  if (!(t instanceof Element)) return false;
  if (t.closest("[data-no-ad]")) return false;
  if (t.closest("input, textarea, select, video, audio, [contenteditable='true']")) return false;
  return true;
}

// Guard: only accept real http(s) landing pages, never a .js asset.
function isValidLandingUrl(url) {
  try {
    const u = new URL(url, window.location.origin);
    if (!/^https?:$/.test(u.protocol)) return false;
    if (/\.js(\?|$)/i.test(u.pathname)) return false;
    return true;
  } catch { return false; }
}

// Tab-swap popunder: ad ends up in a background tab, user stays on your site.
function firePopunder(adUrl) {
  if (!isValidLandingUrl(adUrl)) {
    console.warn("[AdManager] VITE_POPUNDER_URL must be a landing page, not a script:", adUrl);
    return false;
  }
  try {
    const here = window.location.href;
    const decoy = window.open("about:blank", "_blank");
    if (!decoy) return false; // popup blocked
    decoy.location.href = here;
    const adWin = window.open(adUrl, "_blank");
    if (adWin) { try { adWin.blur(); } catch {} try { window.focus(); } catch {} }
    else { window.location.href = adUrl; }
    return true;
  } catch (err) {
    console.warn("[AdManager] popunder failed:", err);
    return false;
  }
}

function fireDirectLink(url) {
  if (!isValidLandingUrl(url)) return false;
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (w) { try { w.blur(); } catch {} try { window.focus(); } catch {} }
    return !!w;
  } catch { return false; }
}

export default function AdManager() {
  const lastClickAt = useRef(0);
  const handledEvents = useRef(new WeakSet());

  // 1) Inject the network's popunder script once. The network handles firing.
  useEffect(() => {
    if (!POPUNDER_SCRIPT) return;
    const src = POPUNDER_SCRIPT.startsWith("//") ? `https:${POPUNDER_SCRIPT}` : POPUNDER_SCRIPT;
    if (document.querySelector(`script[data-ad-popunder="1"]`)) return;
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.adPopunder = "1";
    s.onerror = () => console.warn("[AdManager] popunder script blocked (ad-blocker or CSP):", src);
    document.body.appendChild(s);
    return () => { s.remove(); };
  }, []);

  // 2) Manual popunder / direct-link on real user clicks (only if URLs are set).
  useEffect(() => {
    if (!POPUNDER_URL && !DIRECT_LINK_URL) return;
    const onClick = (e) => {
      if (handledEvents.current.has(e) || !isRealUserClick(e)) return;
      const t = now();
      if (t - lastClickAt.current < MIN_CLICK_GAP_MS) return;
      lastClickAt.current = t;

      if (POPUNDER_URL && t - getLastPop() >= COOLDOWN_MS) {
        if (firePopunder(POPUNDER_URL)) {
          setLastPop(t);
          handledEvents.current.add(e);
          return;
        }
      }
      if (DIRECT_LINK_URL && fireDirectLink(DIRECT_LINK_URL)) {
        handledEvents.current.add(e);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
