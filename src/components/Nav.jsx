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
import { HiMiniBars3BottomRight } from "react-icons/hi2";
import { IoNotificationsOutline } from "react-icons/io5";
import { CgMenuGridO } from "react-icons/cg";
import posterPlaceholder from "../assets/images/poster-placeholder.png";
// import UserInfoBtn from "./Logout";

export default function Nav() {
  const BASE = import.meta.env.VITE_BASE_URL; // Base Url for backend
  const SITENAME = import.meta.env.VITE_SITENAME;

  const [query, setQuery] = React.useState("");
  const [debouncedVal, setDebouncedVal] = React.useState("");
  const [searcResult, setSearchResult] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [navStatus, setNavStatus] = useState("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      setNavStatus("Home");
    } else if (path.startsWith("/mov") || path.startsWith("/Movies")) {
      setNavStatus("Movies");
    } else if (path.startsWith("/ser") || path.startsWith("/Series")) {
      setNavStatus("Series");
    }
  }, [location.pathname]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${BASE}/api/search/?query=${debouncedVal}&page=1`)
      .then((search_res) => search_res.json())
      .then((search_data) => {
        setSearchResult(search_data.results || []);
        setIsLoading(false);
      })
      .catch(() => {
        setSearchResult([]);
        setIsLoading(false);
      });
  }, [BASE, debouncedVal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVal(query);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  let closeSearchResultsDropDown = useRef();
  useEffect(() => {
    let closeSearchResultsDropdownHandler = (event) => {
      if (
        closeSearchResultsDropDown.current &&
        !closeSearchResultsDropDown.current.contains(event.target)
      ) {
        setDebouncedVal("");
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", closeSearchResultsDropdownHandler);
    return () => {
      document.removeEventListener(
        "mousedown",
        closeSearchResultsDropdownHandler
      );
    };
  }, []);

  const closeMobileMenu = useRef();
  useEffect(() => {
    let closeMobileMenuHandler = (event) => {
      if (closeMobileMenu.current && !closeMobileMenu.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMobileMenuHandler);
    document.addEventListener("scroll", closeMobileMenuHandler);
    return () => {
      document.removeEventListener("mousedown", closeMobileMenuHandler);
      document.removeEventListener("scroll", closeMobileMenuHandler);
    };
  }, []);

  return (
    <>
      <div className="fixed z-30 top-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-b border-white/10 px-4 py-4 md:px-10">
        <div className="flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-6 lg:gap-10">
            <Link
              to="/"
              className="items-center gap-2 uppercase text-red-600 font-black tracking-wide text-3xl hidden sm:flex"
            >
              <p>{SITENAME}</p>
            </Link>
            <Link to="/" className="sm:hidden uppercase text-red-600 font-black tracking-wide text-2xl">
              {SITENAME}
            </Link>
            <nav className="hidden md:block">
              <ul className="flex items-center gap-8 text-sm font-semibold">
                {["Home", "Movies", "Series"].map((name) => (
                  <Link
                    key={name}
                    to={name === "Home" ? "/" : name}
                    className={
                      navStatus === name
                        ? "text-white"
                        : "text-white/70 hover:text-white transition-colors"
                    }
                    onClick={() => setNavStatus(name)}
                  >
                    <li>{name === "Series" ? "TV Series" : name}</li>
                  </Link>
                ))}
              </ul>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-5 text-2xl">
            <button onClick={() => setSearchOpen((p) => !p)} className="hover:text-white/80 transition-colors"><FiSearch /></button>
            <CgMenuGridO className="text-[1.7rem]" />
            <div className="relative">
              <IoNotificationsOutline />
              <span className="absolute -top-2 -right-2 text-[0.6rem] bg-red-600 rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="block md:hidden text-2xl text-white/90"
          >
            <HiMiniBars3BottomRight />
          </button>
        </div>

        <AnimatePresence>
          {(searchOpen || query) && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={(e) => e.preventDefault()}
              className="relative mt-4"
              ref={closeSearchResultsDropDown}
            >
              <input
                type="text"
                name="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder="Search titles..."
                className="py-2.5 px-10 outline-0 text-sm bg-[#1a1a1a] border border-white/10 rounded-md w-full"
              />
              <FiSearch className="absolute left-4 top-3.5 text-secondaryTextColor" />

              {debouncedVal && (
                <div className="absolute flex flex-col items-center py-4 z-20 bg-[#141414] w-full max-h-[60dvh] overflow-y-auto top-12 rounded-xl border border-white/10">
                  {searcResult.length > 0 && !isLoading
                    ? searcResult.map((result) => {
                        return (
                          <Link
                            className="flex items-center w-full gap-4 transition-all duration-300 ease-in-out hover:bg-white/5 py-2 px-3"
                            onClick={() => {
                              setQuery("");
                              setSearchOpen(false);
                            }}
                            to={
                              result.media_type === "movie"
                                ? `/mov/${result.tmdb_id}`
                                : `/ser/${result.tmdb_id}`
                            }
                            style={{ textDecoration: "none" }}
                            key={result.tmdb_id}
                          >
                            <div className="flex items-center w-[3rem] aspect-[9/13.5] object-cover bg-bgColor shrink-0 rounded-lg overflow-hidden">
                              <LazyLoadImage
                                alt={result.title}
                                src={result.poster || posterPlaceholder}
                                effect="black-and-white"
                                className="object-cover shrink-0 bg-bgColor rounded-lg"
                              />
                            </div>

                            <div>
                              <p className="line-clamp-1 text-sm lg:text-base text-white">{result.title}</p>
                              <div className="flex items-center gap-2 mt-1 text-secondaryTextColor text-[0.7rem]">
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black text-green-400">
                                  <BiStar className="mb-0.25 " />
                                  {result.rating && <p>{result.rating.toFixed(1)}</p>}
                                </div>
                                {result.release_year && <p>{result.release_year}</p>}
                                <p className="uppercase">{result.media_type == "tv" ? "tv" : "mov"}</p>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    : !isLoading && <p className="p-5 text-sm sm:text-base text-white">No results found for "{debouncedVal}".</p>}

                  {isLoading && (
                    <div className="p-5 flex justify-center content-center items-center ">
                      <div className="loader-search"></div>
                    </div>
                  )}
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-[#141414] border-l border-white/10 p-6"
              ref={closeMobileMenu}
            >
              <VscClose
                onClick={() => setMobileMenuOpen(false)}
                className="text-3xl absolute top-4 right-4"
              />
              <div className="pt-12 space-y-5 text-lg font-medium">
                {[
                  { icon: BiHomeAlt2, name: "Home" },
                  { icon: BiSolidMovie, name: "Movies" },
                  { icon: BsTv, name: "Series" },
                ].map((navItem, index) => (
                  <Link
                    key={index}
                    to={navItem.name === "Home" ? "/" : navItem.name}
                    className="flex items-center gap-3 text-white/90"
                    onClick={() => {
                      setNavStatus(navItem.name);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <navItem.icon className="text-xl" />
                    <p>{navItem.name}</p>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
