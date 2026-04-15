import React, { useState } from "react";
import Watch from "./Watch";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { motion, AnimatePresence } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
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
import DownloadButton from "./Buttons";
import { MdOutlineHighQuality } from "react-icons/md";

export default function MoviesAndSeriesDetailsSections(props) {
  const [isInlinePlayerActive, setIsInlinePlayerActive] = useState(false);
  const [isSeasonsOpen, setIsSeasonspOpen] = useState(false);

  // Trigger inline player
  const handleMoviePlayClick = () => {
    setIsInlinePlayerActive(true);
    // Scroll to top so user sees the player
    window.scrollTo({ top: 0, behavior: "smooth" });

    // For series, if no episode is selected, default to the first one
    if (
      props.detailType === "series" &&
      !props.episodeNumber &&
      props.episodes &&
      props.episodes.length > 0
    ) {
      props.setEpisodeNumber(props.episodes[0].episode_number);
    }
  };

  // Trigger inline player for episode
  const handleEpisodeClick = (epsNum) => {
    props.setEpisodeNumber(epsNum);
    setIsInlinePlayerActive(true);
    // Scroll to top to see the player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative mt-4 bg-btnColor/40 p-3 md:p-10 rounded-3xl ">
      {!props.isMovieDataLoading ? (
        <>
          <div className="grid lg:grid-cols-2 content-center items-center gap-5 ">
            <div
              onClick={handleMoviePlayClick}
              className={`aspect-video w-full relative flex items-center shrink-0 bg-black rounded-3xl overflow-hidden transition-all duration-300 ease-in-out ${!isInlinePlayerActive ? 'hover:scale-[1.02] cursor-pointer' : ''}`}
            >
              {isInlinePlayerActive ? (
                <Watch
                  isInline={true}
                  id={props.movieData}
                  popUpType={props.detailType === "movie" ? "movie" : "episode"}
                  seasonNumber={props.seasonNumber}
                  episodeNumber={props.episodeNumber}
                />
              ) : (
                <>
                  <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-primaryBtn cursor-pointer rounded-full text-5xl sm:text-6xl p-2 shadow-2xl transition hover:scale-110 active:scale-95">
                    <BiPlay />
                  </div>

                  <LazyLoadImage
                    src={props.movieData.backdrop}
                    effect="black-and-white"
                    alt={props.movieData.title}
                    className=" aspect-video w-full rounded-3xl shrink-0 bg-btnColor object-cover"
                  />
                </>
              )}
            </div>

            <div className="p-5">
              {props.movieData.genres && (
                <div className="text-secondaryTextColor flex gap-2 flex-wrap text-sm xl:text-md mb-2">
                  {props.movieData.genres.map((genre, index) => {
                    return <p key={index} className="bg-white/5 px-3 py-1 rounded-full">{genre}</p>;
                  })}
                </div>
              )}

              <h1 className="text-primaryTextColor font-extrabold line-clamp-1 text-2xl xl:text-4xl tracking-tight">
                {props.movieData.title}
              </h1>

              {props.movieData.media_type === "tv" ? (
                <p className="bg-primaryBtn/20 text-primaryBtn px-5 py-1 rounded-full w-fit line-clamp-1 text-sm xl:text-md mt-2 font-bold">
                  {props.movieData.status}
                </p>
              ) : null}

              <p className="text-secondaryTextColor line-clamp-3 mt-4 text-sm xl:text-base leading-relaxed opacity-80">
                {props.movieData.description}
              </p>

              {/* Calculate available seasons and episodes */}
              {(() => {
                const availableSeasons = props.movieData.seasons?.filter(s => 
                  s.season_number !== 0 && 
                  (s.episode_count > 0 || (s.episodes && s.episodes.length > 0))
                ) || [];
                const availableSeasonsCount = availableSeasons.length;
                const availableEpisodesCount = availableSeasons.reduce((acc, s) => acc + (s.episode_count || s.episodes?.length || 0), 0);

                return (
                  <div className="flex gap-4 text-primaryTextColor flex-wrap mt-6">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Media Type Icon and Info */}
                      <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                        {props.movieData.media_type === "movie" ? (
                          <BiTime className="text-primaryBtn text-xl xl:text-2xl" />
                        ) : (
                          <BsListStars className="text-primaryBtn text-xl xl:text-2xl" />
                        )}
                        {props.movieData.media_type === "movie" ? (
                          <p className="text-xs xl:text-sm font-bold uppercase tracking-wider">
                            {props.movieData.runtime} min
                          </p>
                        ) : (
                          <>
                            <p className="text-xs xl:text-sm font-bold uppercase tracking-wider">
                              {availableSeasonsCount} {availableSeasonsCount === 1 ? "Season" : "Seasons"}
                            </p>
                            <span className="text-white/20 mx-1">|</span>
                            <p className="text-xs xl:text-sm font-bold uppercase tracking-wider">
                              {availableEpisodesCount} {availableEpisodesCount === 1 ? "Ep" : "Eps"}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Release Year */}
                      {(props.movieData.media_type === "movie" || props.movieData.release_year) && (
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                          <FiCalendar className="text-primaryBtn text-lg xl:text-xl" />
                          <p className="text-xs xl:text-sm font-bold">
                            {props.movieData.release_year}
                          </p>
                        </div>
                      )}

                      {/* Languages */}
                      {props.movieData.languages && (
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                          <LuLanguages className="text-primaryBtn text-lg xl:text-xl" />
                          <p className="text-xs xl:text-sm font-bold uppercase tracking-wide">
                            {props.movieData.languages
                              .map((lang) => lang.charAt(0).toUpperCase() + lang.slice(1))
                              .join("-")}
                          </p>
                        </div>
                      )}

                      {/* Quality */}
                      {props.movieData.rip && (
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-primaryBtn/20">
                          <MdOutlineHighQuality className="text-primaryBtn text-lg xl:text-xl" />
                          <p className="text-xs xl:text-sm font-black uppercase text-primaryBtn">
                            {props.movieData.rip}
                          </p>
                        </div>
                      )}

                      {/* Rating */}
                      {props.movieData.rating && (
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-yellow-500/20">
                          <PiStarFill className="text-yellow-500 text-lg xl:text-xl" />
                          <p className="text-xs xl:text-sm font-black">
                            {props.movieData.rating.toFixed(1)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-col gap-3 text-primaryTextColor mt-8">
                <div className="grid grid-cols-1 gap-3">
                  <DownloadButton
                    movieData={props.movieData}
                    btnType="Download"
                  />
                </div>
                <div className="w-full">
                  <DownloadButton
                    movieData={props.movieData}
                    btnType="Player"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Episodes */}
          {props.detailType === "series" && (
            <div className="text-primaryTextColor flex flex-col gap-2 content-center items-start lg:mt-4 w-full">
              <div className="flex items-center">
                <div className="relative bg-btnColor/70 px-5 py-2 rounded-xl border border-white/5 shadow-sm">
                  <button
                    onClick={() => setIsSeasonspOpen((prev) => !prev)}
                    className="relative uppercase text-xs sm:text-md font-bold flex items-center gap-3 tracking-wider"
                  >
                    <BiListUl className="text-2xl text-primaryBtn" />
                    Season {props.seasonNumber}
                    <IoIosArrowDown className="text-2xl text-secondaryTextColor/50" />
                  </button>
                  <AnimatePresence>
                    {isSeasonsOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-12 left-0 right-0 z-50 max-h-[300px] overflow-y-auto py-2 text-secondaryTextColor text-md rounded-xl bg-btnColor border border-white/10 shadow-2xl backdrop-blur-xl"
                      >
                        {props.movieData.seasons
                          .sort((a, b) => a.season_number - b.season_number)
                          .map((season, index) => (
                            season.season_number !== 0 && (
                              <div
                                key={index}
                                onClick={() => {
                                  props.setSeasonNumber(season.season_number);
                                  setIsSeasonspOpen(false);
                                }}
                                className={`py-3 px-5 flex items-center gap-3 transition-colors cursor-pointer hover:bg-primaryBtn/10 hover:text-white ${props.seasonNumber === season.season_number ? "text-primaryBtn font-bold bg-primaryBtn/5" : ""}`}
                              >
                                <BiListUl />
                                <span>Season {season.season_number}</span>
                              </div>
                            )
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-5 w-full bg-bgColorSecondary/30 p-4 md:p-8 rounded-[2rem] border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-white/90">
                    Total Episodes <span className="text-white/40 text-lg font-medium ml-1">({props.episodes?.length || 0})</span>
                  </h2>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {!props.isEpisodesLoading ? (
                    props.episodes &&
                    props.episodes
                      .sort((a, b) => a.episode_number - b.episode_number)
                      .map((eps, index) => (
                        <div
                          key={index}
                          onClick={() => handleEpisodeClick(eps.episode_number)}
                          className={`group relative flex flex-col items-center justify-center py-4 px-2 rounded-2xl border transition-all duration-300 cursor-pointer ${props.episodeNumber === eps.episode_number
                            ? "bg-[#E50914] text-white border-[#E50914] shadow-lg shadow-[#E50914]/20 scale-105 z-10"
                            : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                            }`}
                        >
                          <span className={`${props.episodeNumber === eps.episode_number ? "text-white" : "text-white/90"} text-lg font-black mb-1`}>{eps.episode_number}</span>
                          <span className={`${props.episodeNumber === eps.episode_number ? "text-white/90" : "text-white/50"} text-[0.65rem] font-bold text-center w-full break-words leading-tight`}>
                            {eps.name || eps.title || `Episode ${eps.episode_number}`}
                          </span>
                        </div>
                      ))
                  ) : (
                    <div className="col-span-full py-20 flex justify-center w-full">
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
    </div>
  );
}
