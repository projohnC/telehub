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
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-primaryBtn text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
          {movie.media_type === "movie" ? "Movies" : "Series"}
        </div>
      </div>

      <Link
        to={
          movie.media_type === "movie"
            ? `/mov/${movie.tmdb_id}`
            : `/ser/${movie.tmdb_id}`
        }
        className="rounded-t-2xl"
      >
        <div className="flex items-center justify-center aspect-[9/13.5] w-full object-cover rounded-2xl overflow-hidden">
          <LazyLoadImage
            src={movie.poster ? movie.poster : posterPlaceholder}
            width="100%"
            effect="black-and-white"
            alt={movie.title}
            className="aspect-[9/13.5] w-full object-cover rounded-2xl transition-transform duration-500 hover:scale-110"
            onMouseEnter={showPlay}
            onMouseLeave={hidePlay}
          />
        </div>
      </Link>

      <div className="text-primaryTextColor mt-2">
        <p className="line-clamp-1 text-xs md:text-sm font-semibold">{movie.title}</p>
        <div className="flex items-center justify-between text-secondaryTextColor mt-1 text-[0.65rem]">
          {movie.release_year && <p>{movie.release_year}</p>}
          {movie.rating && (
            <div className="flex items-center gap-1 text-yellow-500">
              <PiStarFill />
              <p>{movie.rating.toFixed(1)}</p>
            </div>
          )}
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
    </div >
  );
};

export default MovieCard;
