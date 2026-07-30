import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isExcludedPath, loadAllMonetag } from "../utils/monetag";

/**
 * Mounts every Monetag format once:
 *  - OnClick (Popunder)
 *  - Vignette Banner
 *  - Push Notifications
 *  - In-Page Push
 *
 * Scripts are injected once and left in place across route changes.
 * Paths listed in VITE_MONETAG_EXCLUDE_PATHS are skipped.
 */
const MonetagAds = () => {
  const location = useLocation();

  useEffect(() => {
    if (isExcludedPath(location.pathname)) return;
    loadAllMonetag();
  }, [location.pathname]);

  return null;
};

export default MonetagAds;
