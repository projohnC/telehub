VITE_API_URL=
VITE_API_KEY=
VITE_BASE_URL=
VITE_TG_USERNAME=
VITE_SITENAME=
VITE_TG_URL=
VITE_BANNER_AD=
VITE_POPUNDER_ADS=
VITE_DIRECT_LINK_ADS=
VITE_HIDE_DOWNLOAD=
VITE_HIDE_PLAYER=
VITE_MAIN_DOMAIN=
VITE_JOIN_TELEGRAM_CHANNEL=

## Monetag ads

All Monetag formats are enabled through environment variables — set a zone id to
turn a format on, leave it empty to turn it off.

| Variable | Format |
| --- | --- |
| `VITE_MONETAG_ONCLICK_ZONE` | OnClick (Popunder) |
| `VITE_MONETAG_VIGNETTE_ZONE` | Vignette Banner |
| `VITE_MONETAG_PUSH_ZONE` | Push Notifications |
| `VITE_MONETAG_INPAGE_PUSH_ZONE` | In-Page Push |
| `VITE_MONETAG_SDK_DOMAIN` | Monetag delivery domain (default `vemtoutcheeg.com`) |
| `VITE_MONETAG_SW_PATH` | Push service worker path (default `/sw.js`) |
| `VITE_MONETAG_DEBUG` | `true` to log Monetag activity in the console |
| `VITE_MONETAG_EXCLUDE_PATHS` | Routes with no ads (default `/tg,/dow,/plyr`) |

Code: `src/utils/monetag.js` (loaders), `src/components/MonetagAds.jsx` (mounted in
`App.jsx`), `public/monetag-sw.js` (push service worker, receives zone/domain via
query params).

### If ads don't show

1. Zone ids must be filled in `.env`, then **restart `npm run dev`** (Vite inlines
   `VITE_*` at build time). On Vercel add the same variables in
   Project Settings -> Environment Variables and redeploy.
2. Disable your ad blocker and test on the deployed domain (the domain must be
   approved in Monetag).
3. Quick test without a rebuild — add to `index.html` before `</body>`:
   `<script>window.MONETAG_ZONES={onclick:"ZONE",vignette:"ZONE",push:"ZONE",inPagePush:"ZONE"}</script>`
4. With `VITE_MONETAG_DEBUG=true` the console shows each zone being injected and
   warns when a script is blocked.
