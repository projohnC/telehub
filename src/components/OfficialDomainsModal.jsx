import React, { useState, useEffect } from "react";

export default function OfficialDomainsModal() {
  const [isOpen, setIsOpen] = useState(false);

  const rawMainDomain = import.meta.env.Vite_Main_Domain || import.meta.env.VITE_MAIN_DOMAIN || "9xflix.com";
  const rawTelegramChannel = import.meta.env.Vite_Join_Telegram_Channel || import.meta.env.VITE_JOIN_TELEGRAM_CHANNEL || "";

  // Helper to ensure redirect URLs have protocol
  const formatRedirectUrl = (url) => {
    if (!url) return "#";
    return url.includes("://") ? url : `https://${url}`;
  };

  // Helper to clean up domain for clean visual display
  const getDisplayDomain = (url) => {
    if (!url) return "9xflix.com";
    try {
      const cleanUrl = url.includes("://") ? url : `https://${url}`;
      const parsed = new URL(cleanUrl);
      return parsed.hostname.replace(/^www\./, "");
    } catch (e) {
      return url;
    }
  };

  const mainDomainUrl = formatRedirectUrl(rawMainDomain);
  const mainDomainDisplay = getDisplayDomain(rawMainDomain);
  const telegramUrl = formatRedirectUrl(rawTelegramChannel);

  useEffect(() => {
    const dismissedTime = localStorage.getItem("official_domains_notice_dismissed");
    if (dismissedTime) {
      const parsedTime = parseInt(dismissedTime, 10);
      if (!isNaN(parsedTime)) {
        const hoursPassed = (Date.now() - parsedTime) / (1000 * 60 * 60);
        if (hoursPassed < 24) {
          setIsOpen(false);
          return;
        }
      }
    }
    setIsOpen(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("official_domains_notice_dismissed", Date.now().toString());
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] transition-opacity duration-300"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-[420px] bg-[#13111c] border border-[#23202e] rounded-2xl p-6 shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#22202e] hover:bg-[#2d2a3d] p-1.5 rounded-lg transition-colors cursor-pointer"
          aria-label="Close Notice"
        >
          {/* Close Icon (X) */}
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            height="18"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
        </button>

        {/* Header Notice Banner */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f4b300]"></span>
          <span className="text-[11px] font-extrabold tracking-widest text-[#f4b300] uppercase">
            Official Notice
          </span>
        </div>

        {/* Heading */}
        <h2 className="mt-4 text-xl font-bold tracking-wide text-white leading-snug">
          Always Remember our{" "}
          <span className="text-[#f4b300] italic font-semibold">Official</span>{" "}
          Domains
        </h2>

        {/* Cards container */}
        <div className="mt-6 flex flex-col gap-4">
          {/* Card 1: Main Domain */}
          <a
            href={mainDomainUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDismiss}
            className="flex items-center justify-between p-4 bg-[#1b1926] border border-[#262335] rounded-xl hover:border-[#f4b300]/50 hover:bg-[#201d2e] transition-all duration-300 group cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold tracking-widest text-[#f4b300] uppercase">
                Main Domain
              </span>
              <span className="text-[#d670ef] text-base font-semibold tracking-wide font-mono transition-colors group-hover:text-pink-400">
                {mainDomainDisplay}
              </span>
            </div>
            <div className="flex items-center justify-center w-9 h-9 bg-[#f4b300] hover:bg-[#ffc524] text-black rounded-lg transition-all duration-300 group-hover:scale-105 shadow-md shadow-[#f4b300]/10">
              {/* Arrow Icon */}
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                height="16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </a>

          {/* Card 2: Telegram */}
          {rawTelegramChannel && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDismiss}
              className="flex items-center justify-between p-4 bg-[#1b1926] border border-[#262335] rounded-xl hover:border-[#f4b300]/50 hover:bg-[#201d2e] transition-all duration-300 group cursor-pointer"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold tracking-widest text-[#f4b300] uppercase">
                  Telegram Notification
                </span>
                <span className="text-[#a3b8cc] text-base font-semibold tracking-wide transition-colors group-hover:text-white">
                  Join Telegram channel
                </span>
              </div>
              <div className="flex items-center justify-center w-9 h-9 bg-[#f4b300] hover:bg-[#ffc524] text-black rounded-lg transition-all duration-300 group-hover:scale-105 shadow-md shadow-[#f4b300]/10">
                {/* Arrow Icon */}
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  height="16"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </a>
          )}
        </div>

        {/* Separator line */}
        <div className="h-[1px] bg-[#22202e] my-5" />

        {/* Bottom actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium focus:outline-none cursor-pointer"
          >
            Dismiss Notice
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-white transition-colors duration-200 text-xs font-semibold uppercase tracking-wider focus:outline-none cursor-pointer"
          >
            Hide For 24hr
          </button>
        </div>
      </div>
    </div>
  );
}
