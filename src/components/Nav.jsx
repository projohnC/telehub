// import Cookies from "universal-cookie";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/black-and-white.css";

import { FiSearch } from "react-icons/fi";
import { VscClose } from "react-icons/vsc";
import { BiHomeAlt2, BiSolidMovie, BiStar } from "react-icons/bi";

import { BsTv } from "react-icons/bs";
import { FaPlay } from "react-icons/fa";
import posterPlaceholder from "../assets/images/poster-placeholder.png";

export default function Nav() {
  const BASE = import.meta.env.VITE_BASE_URL;
  const SITENAME = import.meta.env.VITE_SITENAME;

  const [query, setQuery] = useState("");
  const [debouncedVal, setDebouncedVal] = useState("");
  const [searcResult, setSearchResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [navStatus, setNavStatus] = useState("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setNavStatus("Home");
    else if (path.startsWith("/mov") || path.startsWith("/movie")) setNavStatus("Movies");
    else if (path.startsWith("/ser") || path.startsWith("/series")) setNavStatus("Series");
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedVal(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!debouncedVal) {
        setSearchResult([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE}/api/search/?query=${debouncedVal}&page=1`);
        const search_data = await response.json();
        setSearchResult(search_data.results || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSearch();
  }, [debouncedVal, BASE]);

  const closeSearchResultsDropDown = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (closeSearchResultsDropDown.current && !closeSearchResultsDropDown.current.contains(event.target)) {
        setDebouncedVal("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobileMenu = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (closeMobileMenu.current && !closeMobileMenu.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-[#000000]/80 backdrop-blur-2xl border-b border-white/5 py-3 px-5 md:px-10 flex items-center justify-between text-white">
      {/* Left: Mobile Toggle + Logo */}
      <div className={`flex items-center gap-4 ${isSearchOpen ? "hidden md:flex" : "flex"}`}>
        <div className="md:hidden relative" ref={closeMobileMenu}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col gap-1.5 p-1"
          >
            <div className={`h-[2px] w-6 bg-white/70 rounded-full transition-all ${mobileMenuOpen ? "rotate-45 translate-y-[8px]" : ""}`}></div>
            <div className={`h-[2px] w-4 bg-white/70 rounded-full transition-all ${mobileMenuOpen ? "opacity-0" : ""}`}></div>
            <div className={`h-[2px] w-5 bg-white/70 rounded-full transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-[8px]" : ""}`}></div>
          </button>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: -20, y: 10 }}
                className="absolute top-12 -left-2 w-64 bg-[#101216] border border-white/10 rounded-[2rem] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] z-[110]"
              >
                <div className="flex flex-col gap-2">
                  {[
                    { icon: BiHomeAlt2, name: "Home", path: "/" },
                    { icon: BiSolidMovie, name: "Movies", path: "/Movies" },
                    { icon: BsTv, name: "Series", path: "/Series" },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${navStatus === item.name ? "text-red-500 bg-red-500/10 font-black shadow-inner shadow-red-500/5" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                      onClick={() => {
                        setNavStatus(item.name);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <item.icon className={`text-2xl ${navStatus === item.name ? "text-red-500" : "text-white/20"}`} />
                      <span className="text-sm font-bold tracking-tight">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-[#E50914] p-1.5 md:p-2 rounded-full text-white text-[10px] md:text-xs shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform duration-300">
            <FaPlay />
          </div>
          <span className="font-black text-lg md:text-2xl tracking-tighter uppercase whitespace-nowrap">{SITENAME}</span>
        </Link>
      </div>

      {/* Center: Desktop Links */}
      <nav className="hidden md:block">
        <ul className="flex items-center gap-10">
          {[
            { name: "Home", path: "/" },
            { name: "Movies", path: "/Movies" },
            { name: "Series", path: "/Series" },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-300 ${navStatus === item.name ? "text-red-600 translate-y-[-2px]" : "text-white/30 hover:text-white"}`}
              onClick={() => setNavStatus(item.name)}
            >
              <li>{item.name}</li>
            </Link>
          ))}
        </ul>
      </nav>

      {/* Right: Search Toggle */}
      <div className={`relative flex items-center gap-3 transition-all duration-300 ${isSearchOpen ? "flex-1 justify-end md:flex-none" : ""}`} ref={closeSearchResultsDropDown}>
        <AnimatePresence>
          {isSearchOpen && (
            <motion.form
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="relative overflow-hidden flex items-center flex-1 md:flex-none"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, actors, genres..."
                className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs rounded-xl px-4 py-2.5 outline-none w-full md:w-[320px] focus:border-red-600/50 transition-all placeholder:text-white/30 font-medium shadow-inner"
              />
            </motion.form>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            if (!isSearchOpen) setQuery("");
          }}
          className={`p-2.5 md:p-3 rounded-xl transition-all active:scale-95 border duration-500 shrink-0 ${isSearchOpen ? "bg-red-600 border-red-600 text-white rotate-0 shadow-[0_0_20px_rgba(229,9,20,0.4)]" : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20"}`}
        >
          {isSearchOpen ? <VscClose className="text-xl" /> : <FiSearch className="text-xl" />}
        </button>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isSearchOpen && debouncedVal && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute top-[calc(100%+0.8rem)] right-0 w-[calc(100vw-2.5rem)] md:w-[440px] bg-[#0A0C0F]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden z-[120]"
            >
              <div className="max-h-[60vh] md:max-h-[65vh] overflow-y-auto custom-scrollbar p-3">
                {searcResult.length > 0 && !isLoading ? (
                  searcResult.map((result) => (
                    <Link
                      key={result.tmdb_id}
                      to={result.media_type === "movie" ? `/mov/${result.tmdb_id}` : `/ser/${result.tmdb_id}`}
                      className="flex items-center gap-4 p-3 rounded-[1.5rem] hover:bg-white/5 transition-all duration-300 group"
                      onClick={() => {
                        setQuery("");
                        setIsSearchOpen(false);
                      }}
                    >
                      <div className="w-12 md:w-14 aspect-[2/3] bg-white/5 rounded-xl overflow-hidden shrink-0 border border-white/5 shadow-lg">
                        <LazyLoadImage
                          alt={result.title}
                          src={result.poster || posterPlaceholder}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-black truncate group-hover:text-red-500 transition-colors duration-300">{result.title}</p>
                        <div className="flex items-center gap-3 mt-1 md:mt-2">
                          <span className="text-[8px] md:text-[9px] text-white/40 uppercase font-black tracking-[0.15em] bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                            {result.media_type === "tv" ? "TV" : "Movie"}
                          </span>
                          {result.release_year && (
                            <span className="text-[9px] md:text-10px text-white/30 font-bold">{result.release_year}</span>
                          )}
                          <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-yellow-500/70 font-black bg-yellow-500/5 px-2 py-0.5 rounded-lg border border-yellow-500/10">
                            <BiStar className="text-xs" />
                            {result.rating?.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : !isLoading && (
                  <div className="p-12 md:p-16 text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-5 border border-white/5">
                      <FiSearch className="text-white/20 text-xl md:text-2xl" />
                    </div>
                    <p className="text-white/30 text-xs font-bold tracking-tight italic">No matches for "{debouncedVal}"</p>
                  </div>
                )}

                {isLoading && (
                  <div className="p-12 md:p-16 flex justify-center">
                    <div className="loader-search scale-75 opacity-40"></div>
                  </div>
                )}
              </div>

              {searcResult.length > 5 && !isLoading && (
                <Link
                  to={`/search/${debouncedVal}`}
                  className="block p-4 md:p-5 bg-white/5 hover:bg-white/10 text-center text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-white/30 transition-all border-t border-white/5 hover:text-white"
                  onClick={() => setIsSearchOpen(false)}
                >
                  Explore All Results
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
