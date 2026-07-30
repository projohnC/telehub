/*
 * Monetag Push Notifications service worker.
 *
 * Registered by src/utils/monetag.js as:
 *   /monetag-sw.js?z=<VITE_MONETAG_PUSH_ZONE>&d=<VITE_MONETAG_SDK_DOMAIN>
 *
 * The zone and delivery domain arrive as query params so nothing is hardcoded
 * and the same file works for every environment.
 */
(function () {
  var params = new URLSearchParams(self.location.search);
  var zone = params.get("z");
  var domain = (params.get("d") || "vemtoutcheeg.com").replace(/^https?:\/\//i, "");

  if (zone) {
    try {
      importScripts("https://" + domain + "/sw.check.js?z=" + encodeURIComponent(zone));
    } catch (e) {
      // Monetag worker unavailable (blocked/offline) — keep the SW harmless.
    }
  }
})();
