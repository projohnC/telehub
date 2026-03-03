import React, { useState } from "react";
import Watch from "./Watch";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { motion, AnimatePresence } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
// Import Swiper React components
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import { BiListUl, BiPlay, BiTime } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { FiCalendar } from "react-icons/fi";
import { BsListStars } from "react-icons/bs";
import { PiStarFill } from "react-icons/pi";
import { LuLanguages } from "react-icons/lu";
import TelegramButton from "./TelegramButtons";
import DownloadButton from "./Buttons";
import { MdOutlineHighQuality } from "react-icons/md";

export default function MoviesAndSeriesDetailsSections(props) {
  const [isWatchMoviePopupOpen, setIsWatchMoviePopupOpen] = useState(false);
  const [isWatchEpisodePopupOpen, setIsWatchEpisodePopupOpen] = useState(false);
  const [isSeasonsOpen, setIsSeasonspOpen] = useState(false);

  return (
    <div className="relative mt-20 bg-btnColor/40 p-3 md:p-10 rounded-3xl ">
      {!props.isMovieDataLoading ? (
        <>
          <div className="grid lg:grid-cols-2 content-center items-center gap-5 ">
            <div
              onClick={() => {
                props.detailType === "movie"
                  ? setIsWatchMoviePopupOpen(true)
                  : null;
              }}
              className="aspect-video w-full relative flex items-center shrink-0 bg-btnColor  rounded-3xl cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 "
            >
              <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-otherColor  bg-otherColor/50 cursor-pointer rounded-full text-4xl sm:text-5xl">
                {props.detailType === "movie" ? <BiPlay /> : null}
              </div>

              <LazyLoadImage
                src={props.movieData.backdrop}
                effect="black-and-white"
                alt={props.movieData.title}
                className=" aspect-video w-full rounded-3xl shrink-0 bg-btnColor"
              />
            </div>
            <div className="p-5">
              {props.movieData.genres && (
                <div className="text-otherColor flex gap-2 flex-wrap text-sm xl:text-md">
                  {props.movieData.genres.map((genre, index) => {
                    return <p key={index}>{genre}</p>;
                  })}
                </div>
              )}
              <h1 className="text-primaryTextColor font-bold text-2xl sm:text-3xl mt-2">
                {props.movieData.title}
              </h1>

              {props.movieData.media_type == "tv" ? (
                <p className="bg-otherColor/40 text-otherColor px-5 rounded-full w-fit line-clamp-1 text-sm xl:text-md">
                  {props.movieData.status}
                </p>
              ) : null}
              <p className="text-secondaryTextColor  line-clamp-2 mt-2 text-xs xl:text-sm">
                {props.movieData.description}
              </p>
              <div className="flex gap-2 text-primaryTextColor flex-wrap mt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Media Type Icon and Info */}
                  <div className="flex items-center gap-2">
                    {props.movieData.media_type === "movie" ? (
                      <BiTime className="text-secondaryTextColor text-xl xl:text-2xl" />
                    ) : (
                      <BsListStars className="text-secondaryTextColor text-xl xl:text-2xl" />
                    )}
                    {props.movieData.media_type === "movie" ? (
                      <p className="text-xs xl:text-sm">
                        {props.movieData.runtime} min
                      </p>
                    ) : (
                      <>
                        <p className="text-xs xl:text-sm">
                          {props.movieData.total_seasons} Seasons
                        </p>
                        <span className="text-xs xl:text-sm mx-2">|</span>
                        <p className="text-xs xl:text-sm">
                          {props.movieData.total_episodes} Eps
                        </p>
                      </>
                    )}
                  </div>

                  {/* Release Year */}
                  {props.movieData.media_type === "movie" &&
                    props.movieData.release_year && (
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-secondaryTextColor text-lg xl:text-xl" />
                        <p className="text-xs xl:text-sm">
                          {props.movieData.release_year}
                        </p>
                      </div>
                    )}

                  {/* Languages */}
                  {props.movieData.languages && (
                    <div className="flex items-center gap-2">
                      <LuLanguages className="text-lg xl:text-xl" />
                      <p className="text-xs xl:text-sm">
                        {props.movieData.languages
                          .map(
                            (lang) =>
                              lang.charAt(0).toUpperCase() + lang.slice(1)
                          )
                          .join("-")}
                      </p>
                    </div>
                  )}
                  {/* Quality */}
                  {props.movieData.rip && (
                    <div className="flex items-center gap-2">
                      <MdOutlineHighQuality className="text-lg xl:text-xl" />
                      <p className="text-xs xl:text-sm">
                        {props.movieData.rip}
                      </p>
                    </div>
                  )}

                  {/* View Count Mockup */}
                  <div className="flex items-center gap-2">
                    <p className="text-xs xl:text-sm text-secondaryTextColor">
                      4.5M views
                    </p>
                    <span className="text-secondaryTextColor">•</span>
                    <p className="text-xs xl:text-sm text-secondaryTextColor capitalize">
                      {props.movieData.media_type === "tv" ? "Series" : "Movie"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between w-full mt-4">
                <div className="flex items-center gap-4 text-white/80">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                    <PiStarFill className="text-xl text-white" />
                    <span className="text-sm font-bold">120.0K</span>
                  </div>
                  <div className="cursor-pointer hover:text-white transition-colors">
                    <BiTime className="text-2xl" />
                  </div>
                </div>
                <div className="text-white/80 cursor-pointer hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                </div>
              </div>
              <div className="flex items-center flex-wrap gap-2 text-primaryTextColor mt-3">

                <TelegramButton movieData={props.movieData} />
                <DownloadButton
                  movieData={props.movieData}
                  btnType="Download"
                />
              </div>
              <div className="mt-3 flex">
                <DownloadButton
                  movieData={props.movieData}
                  btnType="MX Player"
                />
              </div>
            </div>
          </div>
          {/* Epsiodes */}
          {props.detailType === "series" && (
            <div className="text-primaryTextColor flex flex-col gap-2 content-center items-start lg:mt-4 ">
              <div className=" col-span-1 flex items-center">
                <div className="relative bg-btnColor/70 px-5 py-2 rounded-md">
                  <button
                    onClick={() => setIsSeasonspOpen((prev) => !prev)}
                    className="relative uppercase text-xs sm:text-md flex items-center gap-3"
                  >
                    <BiListUl className="text-2xl text-secondaryTextColor" />
                    Season {props.seasonNumber}
                    <IoIosArrowDown className="text-2xl text-secondaryTextColor" />
                  </button>
                  <AnimatePresence>
                    {isSeasonsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }} // Smooth exit animation
                        transition={{
                          type: "tween",
                          duration: 0.3,
                        }}
                        className="absolute top-11  border-2 border-secondaryTextColor/10 left-0 right-0 z-10 max-h-[30dvh] overflow-y-scroll py-4 text-secondaryTextColor text-md rounded-lg bg-btnColor"
                      >
                        {props.movieData.seasons
                          .sort((a, b) => a.season_number - b.season_number)
                          .map((season, index) => {
                            return (
                              season.season_number !== 0 && (
                                <div
                                  key={index} // Unique key for seasons
                                  onClick={() => {
                                    props.setSeasonNumber(season.season_number);
                                    setIsSeasonspOpen(false);
                                  }}
                                  className="py-1 px-3 flex items-center gap-2 transition-all duration-300 ease-in-out cursor-pointer hover:bg-otherColor/20 hover:text-primaryTextColor"
                                >
                                  <BiListUl />
                                  <span>Season {season.season_number}</span>
                                </div>
                              )
                            );
                          })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="w-full mt-4 p-5 bg-bgColorSecondary/30 border border-white/5 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-bold text-white">Total Episodes</h2>
                  <span className="text-sm text-secondaryTextColor">({props.episodes ? props.episodes.length : 0})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!props.isEpisodesLoading ? (
                    props.episodes &&
                    props.episodes
                      .sort((a, b) => a.episode_number - b.episode_number)
                      .map((eps, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            props.setEpisodeNumber(eps.episode_number);
                            setIsWatchEpisodePopupOpen(true);
                          }}
                          className={`flex flex-col items-center justify-center w-24 h-16 rounded-md cursor-pointer transition-all duration-300 ${props.episodeNumber === eps.episode_number
                              ? "bg-otherColor text-white"
                              : "bg-bgColorSecondary text-secondaryTextColor hover:bg-bgColorSecondary/80"
                            }`}
                        >
                          <span className="text-xs font-bold leading-none">{eps.episode_number}</span>
                          <span className="text-[0.6rem] mt-1 line-clamp-1 px-1 text-center font-medium opacity-80">{eps.title}</span>
                        </div>
                      ))
                  ) : (
                    <div className="w-full flex justify-center py-10">
                      <div className="loader-episode"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="min-h-[50dvh] flex justify-center content-center items-center ">
          <div className="loader"></div>
        </div>
      )}

      {/* Watch Movie Popup */}
      {props.detailType === "movie" && (
        <Watch
          isWatchMoviePopupOpen={isWatchMoviePopupOpen}
          id={props.movieData}
          setIsWatchMoviePopupOpen={setIsWatchMoviePopupOpen}
          popUpType="movie"
        />
      )}

      {/* Watch Episode Popup */}
      {props.detailType === "series" && (
        <Watch
          isWatchEpisodePopupOpen={isWatchEpisodePopupOpen}
          id={props.movieData}
          setIsWatchEpisodePopupOpen={setIsWatchEpisodePopupOpen}
          popUpType="episode"
          seasonNumber={props.seasonNumber}
          episodeNumber={props.episodeNumber}
        />
      )}
    </div>
  );
}
