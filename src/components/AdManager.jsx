// src/components/AdManager.jsx
import { useEffect, useRef } from "react";

const POPUNDER_URL = import.meta.env.VITE_POPUNDER_URL || "https://forbesresistread.com/3b/68/10/3b6810688b6e1daed598d22eab7e84d5.js";
const DIRECT_LINK_URL = import.meta.env.VITE_DIRECT_LINK_URL || "";

const COOLDOWN_MS = 60 * 1000;         // 1 popunder per minute per user
const MIN_CLICK_GAP_MS = 800;          // debounce accidental double clicks
const STORAGE_KEY = "hs_pop_last";

function now() { return Date.now(); }

function getLastPop() {
  try { return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) || 0; }
  catch { return 0; }
}
function setLastPop(t) {
  try { localStorage.setItem(STORAGE_KEY, String(t)); } catch {}
}

function isRealUserClick(e) {
  if (!e.isTrusted) return false;
  if (e.button !== 0) return false;                 // left click only
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return false;
  const t = e.target;
  if (!(t instanceof Element)) return false;
  if (t.closest("[data-no-ad]")) return false;
  if (t.closest("input, textarea, select, video, audio, [contenteditable='true']")) return false;
  return true;
}

/**
 * HDhub4u-style popunder using the tab-swap trick.
 * - Opens a new tab to your site URL.
 * - Redirects the CURRENT tab to the ad URL.
 * - Immediately swaps: current tab back to your site, new tab focuses ad.
 * Effect: user stays on your site, ad ends up in a background tab that
 * keeps running until they close it.
 */
function firePopunder(adUrl) {
  if (!adUrl) return false;

  try {
    const currentHref = window.location.href;
    // Open a blank tab we control
    const newTab = window.open("about:blank", "_blank");
    if (!newTab) return false; // popup blocked

    // Put OUR site into the new tab
    newTab.location.href = currentHref;

    // Send THIS tab to the ad, then jump back — most browsers keep the
    // ad tab in the background because focus never moved to it.
    const adWin = window.open(adUrl, "_blank");
    if (adWin) {
      try { adWin.blur(); } catch {}
      try { window.focus(); } catch {}
    } else {
      // Fallback: swap via location if second open is blocked
      window.location.href = adUrl;
    }
    return true;
  } catch (err) {
    console.warn("[AdManager] popunder failed:", err);
    return false;
  }
}

function fireDirectLink(url) {
  if (!url) return false;
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (w) { try { w.blur(); } catch {} try { window.focus(); } catch {} }
    return !!w;
  } catch { return false; }
}

export default function AdManager() {
  const lastClickAt = useRef(0);
  const handledEvents = useRef(new WeakSet());

  useEffect(() => {
    if (!POPUNDER_URL && !DIRECT_LINK_URL) return;

    const onClick = (e) => {
      if (handledEvents.current.has(e)) return;
      if (!isRealUserClick(e)) return;

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
      if (DIRECT_LINK_URL) {
        if (fireDirectLink(DIRECT_LINK_URL)) {
          handledEvents.current.add(e);
        }
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
