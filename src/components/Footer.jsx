import React from "react";
import { Link, useLocation } from "react-router-dom";
import { PiTelegramLogo } from "react-icons/pi";

export default function Footer() {
  const TG_URL = import.meta.env.VITE_TG_URL;
  const SITENAME = import.meta.env.VITE_SITENAME;

  const location = useLocation();

  const isVerificationPage = ["/tg", "/dow", "/plyr"].includes(location.pathname);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Movies", path: "/movies" },
    { name: "Series", path: "/series" },
  ];

  return (
    <footer className={`w-full pt-10 pb-8 border-t border-white/5 mt-10 ${isVerificationPage ? "bg-transparent mt-0 py-4" : "bg-[#08090b]"}`}>
      <div className="w-11/12 max-w-7xl mx-auto flex flex-col items-start gap-8">
        {!isVerificationPage && (
          <>
            {/* Quick Menu Section */}
            <div className="flex flex-col items-start gap-4 w-full">
              <div className="inline-block">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Quick Menu
                </h2>
                <div className="mt-1 h-[2.5px] w-full bg-[#E50914]"></div>
              </div>

              <div className="flex flex-wrap gap-3 mt-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="px-6 py-2 rounded-full bg-[#1a1c21] border border-white/5 text-white font-bold text-xs md:text-sm hover:bg-white/10 transition-all active:scale-95"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Branding & Disclaimer Section */}
            <div className="flex flex-col items-start gap-4 w-full">
              <h1 className="text-3xl font-black text-[#E50914] tracking-tighter uppercase">
                {SITENAME}
              </h1>

              <div className="space-y-4 max-w-5xl">
                <p className="text-lg font-bold text-white leading-tight">
                  {SITENAME} does not host, upload, or store any media content on its servers.
                </p>
                <p className="text-sm text-secondaryTextColor/60 lg:text-md leading-relaxed font-medium">
                  All content available on this platform is sourced from publicly accessible third-party services. {SITENAME} simply indexes and provides links to media files that are hosted externally, including Telegram and other platforms.
                </p>
              </div>
            </div>

            {/* Telegram Button Section - Centered */}
            <div className="w-full flex justify-center mt-2">
              <a
                href={TG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-[#0a1b1d] border border-[#1a3b3d] hover:bg-[#0f2a2d] text-[#50B498] px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-xl group"
              >
                <div className="bg-[#50B498]/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <PiTelegramLogo className="text-xl text-[#50B498]" />
                </div>
                <span>Join Telegram Channel</span>
              </a>
            </div>
          </>
        )}

        {/* Bottom Bar */}
        <div className={`w-full pt-6 border-t border-white/5 ${isVerificationPage ? "mt-0 pt-0 border-none" : "mt-2"}`}>
          <div className="flex items-center justify-center gap-2 text-secondaryTextColor/40 font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase">
            <div className="w-6 h-6 rounded-full border border-secondaryTextColor/20 flex items-center justify-center text-[8px] text-secondaryTextColor/60">
              ©
            </div>
            <p>{SITENAME}. ALL RIGHTS RESERVED</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
