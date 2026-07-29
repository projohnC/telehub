import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AdManager = () => {
    const location = useLocation();
    useEffect(() => {
        const popunderAdLink = import.meta.env.VITE_POPUNDER_ADS;
        const directAdLink = import.meta.env.VITE_DIRECT_LINK_ADS;

        const isMobile =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ) ||
            window.innerWidth <= 768 ||
            window.matchMedia("(max-width: 768px)").matches;

        // Customizable interval (seconds) between popunders. Defaults to 30s.
        // Set VITE_POPUNDER_INTERVAL=60 in .env to change (value in seconds).
        const popunderIntervalSec = Number(
            import.meta.env.VITE_POPUNDER_INTERVAL
        ) || 30;
        const popunderCooldownMs = Math.max(1, popunderIntervalSec) * 1000;

        const directIntervalSec = Number(
            import.meta.env.VITE_DIRECT_LINK_INTERVAL
        ) || 60;
        const directCooldownMs = Math.max(1, directIntervalSec) * 1000;

        // ------------------------------------------------------------------
        // about:blank redirect helper.
        // Important: never fall back to window.open(url), because that opens
        // the ad URL directly and skips the about:blank step.
        // ------------------------------------------------------------------
        const escapeHtmlAttr = (value) =>
            String(value)
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

        const normalizeAdUrl = (value) => {
            const url = String(value || "").trim();
            if (!url) return "";
            if (url.startsWith("//")) return `${window.location.protocol}${url}`;
            return url;
        };

        const originalWindowOpen =
            window.__adManagerOriginalOpen || window.open.bind(window);

        if (!window.__adManagerOriginalOpen) {
            window.__adManagerOriginalOpen = originalWindowOpen;
        }

        const openAboutBlankThenRedirect = (value) => {
            const url = normalizeAdUrl(value);
            if (!/^https?:\/\//i.test(url)) return null;

            const redirectDelayMs = Math.max(
                0,
                Number(import.meta.env.VITE_POPUNDER_REDIRECT_DELAY_MS ?? 250) || 250
            );

            try {
                // Opening about:blank MUST happen synchronously inside the
                // user-gesture callback, otherwise popup blockers kill it.
                const newTab = originalWindowOpen("about:blank", "_blank");
                if (!newTab || newTab.closed) return false;

                try { newTab.blur(); } catch (_) {}
                try { window.focus(); } catch (_) {}
                try { newTab.opener = null; } catch (_) {}

                // Defer the document.write + navigation to the next task so
                // the current click's default action (link nav, play, modal
                // open, etc.) is NOT blocked by the popup writing/loading.
                // Result: both tabs load together instead of the main tab
                // getting stuck while the popup takes over.
                const htmlUrl = escapeHtmlAttr(url);
                const scriptUrl = JSON.stringify(url);
                const scriptDelay = JSON.stringify(redirectDelayMs);

                setTimeout(() => {
                    try {
                        if (!newTab || newTab.closed) return;
                        newTab.document.open();
                        newTab.document.write(
                            `<!doctype html><html><head><meta charset="utf-8">` +
                            `<meta name="referrer" content="no-referrer">` +
                            `<title>Loading…</title></head>` +
                            `<body style="margin:0;background:#fff">` +
                            `<a href="${htmlUrl}" rel="noreferrer" style="display:none">Continue</a>` +
                            `<script>` +
                            `var target=${scriptUrl};` +
                            `setTimeout(function(){window.location.replace(target);},${scriptDelay});` +
                            `<\/script></body></html>`
                        );
                        newTab.document.close();
                        try { newTab.blur(); } catch (_) {}
                        try { window.focus(); } catch (_) {}
                    } catch (_) {}
                }, 0);

                return newTab;
            } catch (_) {
                return null;
            }
        };

        // Some .js popunder ad networks call window.open(adUrl) themselves.
        // Patch window.open before loading their script so those popups also
        // open about:blank first, then redirect from inside that blank tab.
        if (!window.__adManagerAboutBlankPatched) {
            window.open = function patchedWindowOpen(url, target, features) {
                const normalizedUrl = normalizeAdUrl(url);

                if (
                    normalizedUrl &&
                    normalizedUrl !== "about:blank" &&
                    /^https?:\/\//i.test(normalizedUrl)
                ) {
                    return openAboutBlankThenRedirect(normalizedUrl);
                }

                return originalWindowOpen(url, target, features);
            };

            window.__adManagerAboutBlankPatched = true;
        }

        // ------------------------------------------------------------------
        // Script-based popunder networks (Adsterra / Propeller / etc.)
        // These scripts install their OWN listeners and use their OWN
        // frequency capping. We inject once after patching window.open so the
        // script's own popup is forced through about:blank first.
        // ------------------------------------------------------------------
        const isScriptPopunder = popunderAdLink && (
            popunderAdLink.toLowerCase().includes(".js") ||
            popunderAdLink.toLowerCase().includes("/js/")
        );
        const isActionPage = () =>
            ["/tg", "/dow", "/plyr"].includes(window.location.pathname);

        if (isScriptPopunder && !isActionPage()) {
            const already = document.querySelector(
                `script[data-popunder-src="${popunderAdLink}"]`
            );
            if (!already) {
                const s = document.createElement("script");
                s.src = popunderAdLink;
                s.async = true;
                s.setAttribute("data-popunder-src", popunderAdLink);
                document.body.appendChild(s);
            }
        }

        // ------------------------------------------------------------------
        // Interval-based trigger. Browsers require a user gesture to open a
        // new tab, so we can't call window.open() from a bare setInterval —
        // it will be blocked. Instead we mark the ad as "ready" every N
        // seconds, and the very next user click fires the popunder. This
        // gives the "one popup every 30s" behaviour without triggering on
        // every click.
        // ------------------------------------------------------------------
        let popunderReady = false;
        let directReady = false;

        // Prime the first popup: ready on the first click after mount.
        popunderReady = true;
        directReady = true;

        const popunderTimer = setInterval(() => {
            popunderReady = true;
        }, popunderCooldownMs);

        const directTimer = setInterval(() => {
            directReady = true;
        }, directCooldownMs);

        const handleGlobalClick = (e) => {
            if (isMobile) {
                return;
            }

            if (
                e.target.closest(".adblock-detector-modal") ||
                e.target.closest(".domain-notice-modal")
            ) return;

            if (isActionPage()) return;

            const target = e.target.closest("button, a, [role='button']");
            if (!target) return;

            // Direct Link Ads — also route through about:blank first.
            if (directAdLink && directReady) {
                openAboutBlankThenRedirect(directAdLink);
                directReady = false;
                return;
            }

            // URL-based popunder (non-.js). Script-based popunders manage
            // their own frequency and are handled by the injected script.
            if (popunderAdLink && !isScriptPopunder && popunderReady) {
                openAboutBlankThenRedirect(popunderAdLink);
                popunderReady = false;
            }
        };

        window.addEventListener("click", handleGlobalClick, true);

        return () => {
            window.removeEventListener("click", handleGlobalClick, true);
            clearInterval(popunderTimer);
            clearInterval(directTimer);
            // Leave the injected popunder script in place across route changes.
        };
    }, []);

    // Back-button hijack for mobile devices
    useEffect(() => {
        const popunderAdLink = import.meta.env.VITE_POPUNDER_ADS;
        const directAdLink = import.meta.env.VITE_DIRECT_LINK_ADS;

        const isMobile =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ) ||
            window.innerWidth <= 768 ||
            window.matchMedia("(max-width: 768px)").matches;

        if (!isMobile) return;

        const openAboutBlankThenRedirect = (value) => {
            const url = String(value || "").trim();
            if (!url) return null;
            const normalizedUrl = url.startsWith("//") ? `${window.location.protocol}${url}` : url;
            if (!/^https?:\/\//i.test(normalizedUrl)) return null;

            try {
                const originalWindowOpen = window.__adManagerOriginalOpen || window.open;
                const newTab = originalWindowOpen("about:blank", "_blank");
                if (!newTab || newTab.closed) return false;

                try { window.focus(); } catch (_) {}
                try { newTab.blur(); } catch (_) {}
                try { newTab.opener = null; } catch (_) {}

                const htmlUrl = String(normalizedUrl).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                const scriptUrl = JSON.stringify(normalizedUrl);

                // Defer write so main tab is not blocked by the popup.
                setTimeout(() => {
                    try {
                        if (!newTab || newTab.closed) return;
                        newTab.document.open();
                        newTab.document.write(
                            `<!doctype html><html><head><meta charset="utf-8">` +
                            `<meta name="referrer" content="no-referrer">` +
                            `<title>Loading…</title></head>` +
                            `<body style="margin:0;background:#fff">` +
                            `<a href="${htmlUrl}" rel="noreferrer" style="display:none">Continue</a>` +
                            `<script>` +
                            `var target=${scriptUrl};` +
                            `setTimeout(function(){window.location.replace(target);},250);` +
                            `<\/script></body></html>`
                        );
                        newTab.document.close();
                        try { newTab.blur(); } catch (_) {}
                        try { window.focus(); } catch (_) {}
                    } catch (_) {}
                }, 0);

                return newTab;
            } catch (_) {
                return null;
            }
        };

        const pushAdState = () => {
            if (!window.history.state || !window.history.state.adHijacked) {
                window.history.pushState({ adHijacked: true }, "", window.location.href);
            }
        };

        pushAdState();

        const handlePopState = (e) => {
            if (!window.history.state || !window.history.state.adHijacked) {
                const isScriptPopunder = popunderAdLink && (
                    popunderAdLink.toLowerCase().includes(".js") ||
                    popunderAdLink.toLowerCase().includes("/js/")
                );
                const adLink = (!isScriptPopunder && popunderAdLink) || directAdLink;
                if (adLink) {
                    const opened = openAboutBlankThenRedirect(adLink);
                    if (!opened) {
                        const targetUrl = adLink.startsWith("//") ? `${window.location.protocol}${adLink}` : adLink;
                        window.location.href = targetUrl;
                        return;
                    }
                }
                window.history.go(-1);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [location.pathname, location.search]);

    return null;
};

export default AdManager;
