import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const RedirectPage = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetAd = params.get("to");
    const originalSite = params.get("ref") || window.location.origin;

    if (!targetAd) {
      window.location.replace(originalSite);
      return;
    }

    const state = window.history.state;
    if (state && state.step) {
      // User navigated back from the ad page!
      // Open the ad in a new tab
      try {
        window.open(targetAd, "_blank");
      } catch (e) {
        console.error("New tab blocked", e);
      }
      // Redirect this tab back to the original website page
      window.location.replace(originalSite);
    } else {
      // First load of the redirect helper page.
      // Push history states to intercept the back click.
      window.history.replaceState({ step: 1 }, "", window.location.href);
      window.history.pushState({ step: 2 }, "", window.location.href);
      window.history.pushState({ step: 3 }, "", window.location.href);

      const handlePopState = (event) => {
        if (event.state && event.state.step <= 2) {
          // Open ad in a new tab
          try {
            window.open(targetAd, "_blank");
          } catch (e) {
            console.error("New tab blocked", e);
          }
          // Redirect current tab to original website page
          window.location.replace(originalSite);
        }
      };

      window.addEventListener("popstate", handlePopState);

      // Navigate to the ad URL (adds to history)
      const timer = setTimeout(() => {
        window.location.href = targetAd;
      }, 150);

      return () => {
        window.removeEventListener("popstate", handlePopState);
        clearTimeout(timer);
      };
    }
  }, [location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f19] text-white">
      <div className="flex flex-col items-center space-y-4">
        {/* Sleek loading spinner */}
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium tracking-wide text-gray-300">
          Loading page... Please wait.
        </p>
      </div>
    </div>
  );
};

export default RedirectPage;
