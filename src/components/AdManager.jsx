// src/components/AdManager.jsx
import { useEffect, useRef } from "react";

/**
 * Professional Popunder + Direct-Link ad manager (HDhub4u-style).
 *
 * Behavior:
 *  - Network popunder scripts (URL ends in .js) are injected ONCE on mount.
 *    Networks like PopAds / PopCash / Adsterra / HilltopAds handle their own
 *    trigger, frequency capping, and popunder mechanics. Do NOT reinject per click.
 *  - Direct popunder URL (non-.js) is opened on a real user gesture using the
 *    classic "open + blur" popunder trick so the ad tab stays behind.
 *  - Direct-link ads open in a new tab on click with their own cooldown.
 *  - Cooldowns are per-ad-type and stored in localStorage.
 *  - Clicks inside modals, form fields, media controls, or on nav links with
 *    modifier keys / middle-click are ignored.
 *  - Only one ad fires per click.
 */

const POPUNDER_COOLDOWN_MS = 60 * 1000;          // 1 min
const DIRECT_COOLDOWN_MS   = 2 * 60 * 1000;      // 2 min
const IGNORED_PATHS        = ["/tg", "/dow", "/plyr"];
const IGNORED_SELECTORS = [
  ".adblock-detector-modal",
  ".domain-notice-modal",
  "[data-no-ad]",
  "input", "textarea", "select", "label",
  "video", "audio",
  ".player-modal", ".plyr",
].join(",");

const now = () => Date.now();
const readTs = (k) => parseInt(localStorage.getItem(k) || "0", 10);
const writeTs = (k) => localStorage.setItem(k, String(now()));
const cooledDown = (k, ms) => now() - readTs(k) >= ms;

/** Classic popunder: open ad, immediately push it behind the opener. */
function firePopunder(url) {
  try {
    const win = window.open("about:blank", "_blank");
    if (!win) return false; // popup blocked
    win.document.write(
      `<meta http-equiv="refresh" content="0;url=${url}">`
    );
    // Push new window behind
    win.blur();
    window.focus();
    if (window.opener) window.opener.focus?.();
    return true;
  } catch {
    return false;
  }
}

/** Inject a network popunder script tag exactly once. */
function injectPopunderScript(src) {
  if (document.querySelector(`script[data-popunder-src="${src}"]`)) return;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  s.dataset.popunderSrc = src;
  // Most networks require it in <head> or <body>; body is safest post-hydration.
  document.body.appendChild(s);
}

const AdManager = () => {
  const firedForEventRef = useRef(new WeakSet());

  useEffect(() => {
    const directAd   = import.meta.env.VITE_DIRECT_LINK_ADS;
    const popunderAd = import.meta.env.VITE_POPUNDER_ADS;

    // 1. Script-based popunder network: inject once, let it self-manage.
    if (popunderAd && popunderAd.endsWith(".js")) {
      injectPopunderScript(popunderAd);
    }

    // 2. Click-driven ads (direct link + URL popunder fallback).
    const onClick = (e) => {
      // Only trusted, primary-button clicks without modifier keys
      if (!e.isTrusted) return;
      if (e.button !== 0) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (firedForEventRef.current.has(e)) return;

      if (IGNORED_PATHS.includes(window.location.pathname)) return;

      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest(IGNORED_SELECTORS)) return;

      // Must be an interactive element (button/link/role=button)
      const interactive = t.closest("a, button, [role='button'], .clickable-ad-trigger");
      if (!interactive) return;

      firedForEventRef.current.add(e);

      // Direct-link ad first (respects its own cooldown)
      if (directAd && cooledDown("last_direct_ad_popup", DIRECT_COOLDOWN_MS)) {
        window.open(directAd, "_blank", "noopener,noreferrer");
        writeTs("last_direct_ad_popup");
        return; // one ad per click
      }

      // URL-based popunder fallback (only when NOT a script network)
      if (popunderAd && !popunderAd.endsWith(".js") &&
          cooledDown("last_popunder_ad_popup", POPUNDER_COOLDOWN_MS)) {
        if (firePopunder(popunderAd)) {
          writeTs("last_popunder_ad_popup");
        }
      }
    };

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  return null;
};

export default AdManager;
