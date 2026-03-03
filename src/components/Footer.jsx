import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const TG_URL = import.meta.env.VITE_TG_URL;
  const SITENAME = import.meta.env.VITE_SITENAME;


  const location = useLocation();

  return (
    <>

      <section className="relative pt-10 border-t-2 border-btnColor xxl:container m-auto">
        {/* TOP OF FOOTER */}
        <div className="flex flex-col items-start justify-between w-11/12 gap-6 m-auto md:flex-row ">
          {/* LEFT */}
          <div className="p-0 w-full md:w-1/2 lg:p-6">
            <div className="flex items-center text-secondaryTextColor uppercase gap-4 mb-4 font-bold text-2xl">
              <a href="/" className="-space-y-1">
                <p className="text-2xl text-otherColor">{SITENAME}</p>
              </a>
            </div>
            <p className="text-sm text-secondaryTextColor lg:text-md leading-relaxed">
              <strong className="text-white block mb-2">
                (HubStream does not host, upload, or store any media content on its servers.)
              </strong>
              All content available on this platform is sourced from publicly accessible third-party services.
              HubStream simply indexes and provides links to media files that are hosted externally,
              including Telegram and other platforms.
            </p>
            <div className="flex items-center gap-3 mt-6 ">
              <a
                href={TG_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer w-8"
                >
                  <path
                    d="M12,24c6.629,0 12,-5.371 12,-12c0,-6.629 -5.371,-12 -12,-12c-6.629,0 -12,5.371 -12,12c0,6.629 5.371,12 12,12zM5.491,11.74l11.57,-4.461c0.537,-0.194 1.006,0.131 0.832,0.943l0.001,-0.001l-1.97,9.281c-0.146,0.658 -0.537,0.818 -1.084,0.508l-3,-2.211l-1.447,1.394c-0.16,0.16 -0.295,0.295 -0.605,0.295l0.213,-3.053l5.56,-5.023c0.242,-0.213 -0.054,-0.333 -0.373,-0.121l-6.871,4.326l-2.962,-0.924c-0.643,-0.204 -0.657,-0.643 0.136,-0.953z"
                    fill="#50B498"
                  />
                </svg>
              </a>
            </div>
          </div>
          {/* RIGHT - QUICK MENU */}
          <div className="p-0 w-full text-primaryTextColor md:w-1/2 lg:p-6">
            <button className="border-b-2 border-otherColor text-xl cursor-default mb-6 md:text-2xl">
              Quick Menu
            </button>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="px-6 py-2 rounded-full bg-bgColorSecondary border border-secondaryTextColor/20 text-sm font-bold transition-all duration-300 hover:bg-otherColor hover:text-white"
              >
                Home
              </Link>
              <Link
                to="/movies"
                className="px-6 py-2 rounded-full bg-bgColorSecondary border border-secondaryTextColor/20 text-sm font-bold transition-all duration-300 hover:bg-otherColor hover:text-white"
              >
                Movies
              </Link>
              <Link
                to="/series"
                className="px-6 py-2 rounded-full bg-bgColorSecondary border border-secondaryTextColor/20 text-sm font-bold transition-all duration-300 hover:bg-otherColor hover:text-white"
              >
                Series
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t-2 border-btnColor  py-6  mt-5 ">
          <div className="flex flex-col gap-5 items-center  justify-center md:items-center w-11/12 m-auto sm:text-center  sm:flex-row sm:items-start">
            {/* BOTTOM FOOTER LEFT */}
            <div className="flex items-center gap-1 text-sm text-secondaryTextColor md:text-md">
              <button className="relative text-sm w-4 h-4 rounded-full border-2 border-secondaryTextColor p-2">
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  C
                </p>
              </button>
              <p className="uppercase">{SITENAME}. All Rights Reserved</p>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
