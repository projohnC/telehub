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

import { BiListUl, BiPlay } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { FiCalendar } from "react-icons/fi";
import { PiStarFill } from "react-icons/pi";
import TelegramButton from "./TelegramButtons";
import DownloadButton from "./Buttons";
import { MdOutlineHighQuality, MdLanguage } from "react-icons/md";

export default function MoviesAndSeriesDetailsSections(props) {
  const [isWatchMoviePopupOpen, setIsWatchMoviePopupOpen] = useState(false);
  const [isWatchEpisodePopupOpen, setIsWatchEpisodePopupOpen] = useState(false);
  const [isSeasonsOpen, setIsSeasonspOpen] = useState(false);
  const [isPlayerActive, setIsPlayerActive] = useState(false);

  return (
    <div className="relative mt-20 bg-dark-premium rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
      <div className="p-3 md:p-10">
        {!props.isMovieDataLoading ? (
          <>
            <div className={`grid ${isPlayerActive ? "grid-cols-1" : "lg:grid-cols-2"} content-center items-center gap-8 `}>
              <div
                onClick={() => {
                  if (props.detailType === "movie") {
                    setIsPlayerActive(true);
                    setIsWatchMoviePopupOpen(true);
                  }
                }}
                className={`w-full relative flex items-center shrink-0 bg-black/40 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.01] border border-white/10 ${!isPlayerActive ? "aspect-video" : ""}`}
              >
                {isPlayerActive ? (
                  <div className="w-full h-full">
                    {props.detailType === "movie" ? (
                      <Watch
                        isWatchMoviePopupOpen={isWatchMoviePopupOpen}
                        id={props.movieData}
                        setIsWatchMoviePopupOpen={setIsWatchMoviePopupOpen}
                        popUpType="movie"
                        inline={true}
                      />
                    ) : (
                      <Watch
                        isWatchEpisodePopupOpen={isWatchEpisodePopupOpen}
                        id={props.movieData}
                        setIsWatchEpisodePopupOpen={setIsWatchEpisodePopupOpen}
                        popUpType="episode"
                        seasonNumber={props.seasonNumber}
                        episodeNumber={props.episodeNumber}
                        inline={true}
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-purple-gradient/80 p-4 cursor-pointer rounded-full text-4xl sm:text-5xl shadow-lg btn-hover-effect">
                      {props.detailType === "movie" ? <BiPlay /> : null}
                    </div>

                    <LazyLoadImage
                      src={props.movieData.backdrop}
                      effect="black-and-white"
                      alt={props.movieData.title}
                      className="aspect-video w-full rounded-3xl shrink-0 object-cover"
                    />
                  </>
                )}
              </div>
              <div className="p-2 sm:p-5 flex flex-col gap-4">
                {props.movieData.genres && (
                  <div className="flex gap-2 flex-wrap text-sm">
                    {props.movieData.genres.map((genre, index) => {
                      return <p key={index} className="bg-white/10 px-3 py-1 rounded-full text-secondaryTextColor text-xs">{genre}</p>;
                    })}
                  </div>
                )}
                <h1 className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight">
                  {props.movieData.title}
                </h1>

                {props.movieData.media_type == "tv" ? (
                  <p className="bg-orange-gradient text-white px-4 py-1 rounded-full w-fit text-xs font-bold uppercase tracking-wider">
                    {props.movieData.status}
                  </p>
                ) : null}

                <p className="text-secondaryTextColor line-clamp-3 text-sm leading-relaxed opacity-80">
                  {props.movieData.description}
                </p>

                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-wrap items-center gap-4 text-secondaryTextColor border-y border-white/5 py-3">
                    {/* Release Year */}
                    {props.movieData.release_year && (
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-lg" />
                        <p className="text-xs font-medium">{props.movieData.release_year}</p>
                      </div>
                    )}

                    <span className="opacity-20 hidden sm:inline">|</span>

                    {/* Quality */}
                    {props.movieData.rip && (
                      <div className="flex items-center gap-2">
                        <MdOutlineHighQuality className="text-xl" />
                        <p className="text-xs font-medium uppercase">{props.movieData.rip}</p>
                      </div>
                    )}
                    <span className="opacity-20 hidden sm:inline">|</span>

                    {/* Languages */}
                    {props.movieData.languages && (
                      <div className="flex items-center gap-2">
                        <MdLanguage className="text-xl" />
                        <p className="text-xs font-medium">
                          {props.movieData.languages
                            .map(
                              (lang) =>
                                lang.charAt(0).toUpperCase() + lang.slice(1)
                            )
                            .join(" - ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4 w-full sm:max-w-md">
                  <div className="flex gap-3 w-full">
                    <TelegramButton movieData={props.movieData} />
                    <DownloadButton
                      movieData={props.movieData}
                      btnType="Download"
                    />
                  </div>
                  <DownloadButton
                    movieData={props.movieData}
                    btnType="Player"
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
                  <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
                    {!props.isEpisodesLoading ? (
                      props.episodes &&
                      props.episodes
                        .sort((a, b) => a.episode_number - b.episode_number)
                        .map((eps, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              props.setEpisodeNumber(eps.episode_number);
                              setIsPlayerActive(true);
                              setIsWatchEpisodePopupOpen(true);
                            }}
                            className={`flex flex-col items-center justify-center w-full sm:w-24 h-16 rounded-md cursor-pointer transition-all duration-300 ${props.episodeNumber === eps.episode_number
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

        {/* Modal Fallbacks (for compatibility if needed, though predominantly inline now) */}
        {!isPlayerActive && (
          <>
            {props.detailType === "movie" && (
              <Watch
                isWatchMoviePopupOpen={isWatchMoviePopupOpen}
                id={props.movieData}
                setIsWatchMoviePopupOpen={setIsWatchMoviePopupOpen}
                popUpType="movie"
              />
            )}

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
          </>
        )}
      </div>
    </div>
  );
}
