import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { PiStarFill } from "react-icons/pi";

import { BsPlayFill } from "react-icons/bs";
import posterPlaceholder from "../assets/images/poster-placeholder.png";

const MovieCard = ({ movie }) => {
  const [showPlayBtn, setShowPlayBtn] = useState(false);
  const [openId, setOpenId] = useState();

  const showPlay = () => {
    setOpenId(movie.tmdb_id);
    setShowPlayBtn(true);
  };

  const hidePlay = () => {
    setOpenId(movie.tmdb_id);
    setShowPlayBtn(false);
  };

  return (
    <div className="relative">
      <Link
        to={
          movie.media_type === "movie"
            ? `/mov/${movie.tmdb_id}`
            : `/ser/${movie.tmdb_id}`
        }
        className="rounded-t-2xl"
      >
        <div className="flex items-center justify-center aspect-[9/13.5] w-full object-cover rounded-2xl ">
          <LazyLoadImage
            src={movie.poster ? movie.poster : posterPlaceholder}
            width="100%"
            effect="black-and-white"
            alt={movie.title}
            className="aspect-[9/13.5] w-full object-cover rounded-2xl "
            onMouseEnter={showPlay}
            onMouseLeave={hidePlay}
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            <div className="bg-otherColor text-white text-[0.63rem] font-bold px-2 py-0.5 rounded shadow-sm uppercase">
              {movie.media_type === "tv" ? "Series" : "Movies"}
            </div>
          </div>
          <div className="absolute bottom-3 left-3 z-10">
            {movie.media_type === "tv" ? (
              <div className="bg-black/60 backdrop-blur-sm text-white text-[0.63rem] font-bold px-2 py-0.5 rounded shadow-sm">
                {movie.total_episodes || "7"} EP
              </div>
            ) : (
              <div className="bg-black/60 backdrop-blur-sm text-white text-[0.63rem] font-bold px-2 py-0.5 rounded shadow-sm">
                {movie.duration || "1:51:24"}
              </div>
            )}
          </div>
          <div className="absolute bottom-3 right-3 z-10">
            {movie.media_type === "tv" && (
              <div className="bg-black/60 backdrop-blur-sm text-white text-[0.63rem] font-bold px-2 py-0.5 rounded shadow-sm">
                {movie.total_episodes_info || "62"} Episodes
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-2.5 px-1 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-otherColor flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md">
            {movie.title ? movie.title.charAt(0).toUpperCase() : "M"}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="line-clamp-1 text-[0.85rem] font-bold text-primaryTextColor leading-snug">{movie.title}</p>
            <p className="text-[0.65rem] text-secondaryTextColor uppercase font-medium tracking-wide">
              {movie.release_year} • {movie.media_type === "tv" ? "Series" : "Movie"}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {openId === movie.tmdb_id && showPlayBtn && (
          <Link
            to={
              movie.media_type === "movie"
                ? `/mov/${movie.tmdb_id}`
                : `/ser/${movie.tmdb_id}`
            }
            onMouseEnter={showPlay}
            onMouseLeave={hidePlay}
            className="hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primaryBtn sm:block"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: -20 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{
                type: "tween",
                duration: 0.3,
              }}
              className="text-3xl p-1 rounded-full border-4 border-primaryBtn"
            >
              <BsPlayFill />
            </motion.div>
          </Link>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieCard;
