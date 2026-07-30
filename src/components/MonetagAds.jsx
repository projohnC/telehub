import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  MONETAG_ZONES,
  isExcludedPath,
  loadMonetagInPagePush,
  loadMonetagOnClick,
  loadMonetagPush,
  loadMonetagVignette,
} from "../utils/monetag";

/**
 * Mounts every Monetag format that has a zone id configured in .env:
 *  - OnClick (Popunder)   VITE_MONETAG_ONCLICK_ZONE
 *  - Vignette Banner      VITE_MONETAG_VIGNETTE_ZONE
 *  - Push Notifications   VITE_MONETAG_PUSH_ZONE
 *  - In-Page Push         VITE_MONETAG_INPAGE_PUSH_ZONE
 *
 * Scripts are injected once and left in place across route changes.
 */
const MonetagAds = () => {
  const location = useLocation();

  useEffect(() => {
    if (isExcludedPath(location.pathname)) return;

    if (MONETAG_ZONES.onclick) loadMonetagOnClick();
    if (MONETAG_ZONES.vignette) loadMonetagVignette();
    if (MONETAG_ZONES.inPagePush) loadMonetagInPagePush();
    if (MONETAG_ZONES.push) loadMonetagPush();
  }, [location.pathname]);

  return null;
};

export default MonetagAds;
