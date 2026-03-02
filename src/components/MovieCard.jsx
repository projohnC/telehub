import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { PiStarFill } from "react-icons/pi";
import { BsPlayFill, BsPlusLg } from "react-icons/bs";
import { BiLike } from "react-icons/bi";
import { IoChevronDown } from "react-icons/io5";
import posterPlaceholder from "../assets/images/poster-placeholder.png";

const MovieCard = ({ movie }) => {
  const [showPlayBtn, setShowPlayBtn] = useState(false);

  const detailPath = movie.media_type === "movie" ? `/mov/${movie.tmdb_id}` : `/ser/${movie.tmdb_id}`;

  return (
    <div className="relative" onMouseEnter={() => setShowPlayBtn(true)} onMouseLeave={() => setShowPlayBtn(false)}>
      <Link to={detailPath} className="block rounded-md overflow-hidden">
        <div className="flex items-center justify-center aspect-video w-full object-cover rounded-md overflow-hidden bg-zinc-900">
          <LazyLoadImage
            src={movie.backdrop || movie.poster || posterPlaceholder}
            width="100%"
            effect="black-and-white"
            alt={movie.title}
            className="aspect-video w-full object-cover rounded-md transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>

      <div className="text-white mt-2">
        <p className="line-clamp-1 text-sm sm:text-base font-semibold">{movie.title}</p>
      </div>

      <AnimatePresence>
        {showPlayBtn && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="hidden md:block absolute z-20 left-0 right-0 top-0 rounded-lg overflow-hidden bg-[#1a1a1a] border border-white/10 shadow-2xl"
          >
            <Link to={detailPath}>
              <LazyLoadImage
                src={movie.backdrop || movie.poster || posterPlaceholder}
                width="100%"
                alt={movie.title}
                className="aspect-video w-full object-cover"
              />
            </Link>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link to={detailPath} className="bg-white text-black rounded-full p-2 text-xl"><BsPlayFill /></Link>
                  <button className="rounded-full border border-white/40 p-2"><BsPlusLg /></button>
                  <button className="rounded-full border border-white/40 p-2"><BiLike /></button>
                </div>
                <button className="rounded-full border border-white/40 p-2"><IoChevronDown /></button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-white/90">
                <span className="text-green-400 font-semibold">{movie.rating ? `${Math.round(movie.rating * 10)}% match` : "New"}</span>
                {movie.release_year && <span>{movie.release_year}</span>}
                <span className="uppercase border border-white/30 px-1 rounded">{movie.media_type || "HD"}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1 absolute top-2 left-2 bg-black/70 text-yellow-300 py-1 px-2 rounded-full font-semibold text-[0.65rem]">
        <PiStarFill />
        <p>{movie.rating ? movie.rating.toFixed(1) : "0.0"}</p>
      </div>
    </div>
  );
};

export default MovieCard;
