import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Autoplay, Navigation, A11y } from "swiper/modules";

import "swiper/css";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { BsArrowLeftCircle, BsArrowRightCircle } from "react-icons/bs";
import { FaInfoCircle, FaPlay } from "react-icons/fa";

export default function HeroSlider({ movieData, isMovieDataLoading }) {
  return (
    <div className="pt-20 md:pt-24">
      {!isMovieDataLoading ? (
        <>
          <Swiper
            modules={[Autoplay, Navigation, A11y]}
            grabCursor={true}
            loop={true}
            navigation={{
              prevEl: ".heroSlidePrev",
              nextEl: ".heroSlideNext",
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            spaceBetween={20}
            keyboard={{ enabled: true }}
          >
            {movieData.map((movie, index) => (
              <SwiperSlide key={index}>
                <div className="relative rounded-xl overflow-hidden min-h-[62vh] sm:min-h-[70vh] md:min-h-[76vh]">
                  <LazyLoadImage
                    src={movie.backdrop}
                    className="absolute inset-0 h-full w-full object-cover"
                    effect="black-and-white"
                    alt={movie.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-black/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/20" />

                  <div className="relative z-10 px-4 pb-14 pt-20 sm:px-8 sm:pt-24 md:w-2/3 lg:w-1/2 md:pt-32">
                    <p className="text-red-600 font-extrabold text-2xl sm:text-4xl mb-2">NETFLIX</p>
                    {movie.title && (
                      <h1 className="line-clamp-2 text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
                        {movie.title}
                      </h1>
                    )}
                    {movie.languages?.length > 0 && (
                      <p className="mt-3 text-lg sm:text-4xl text-white/90 font-semibold line-clamp-1">
                        Watch in {movie.languages.map((l) => l.charAt(0).toUpperCase() + l.slice(1)).join(", ")}
                      </p>
                    )}
                    {movie.description && (
                      <p className="mt-4 text-white/90 max-w-2xl text-sm sm:text-xl line-clamp-3">{movie.description}</p>
                    )}
                    <div className="mt-6 flex items-center gap-3 flex-wrap">
                      <Link
                        className="flex items-center gap-2 bg-white text-black font-semibold text-base py-2 px-6 rounded-md hover:bg-white/90"
                        to={`/mov/${movie.tmdb_id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <FaPlay />
                        Play
                      </Link>
                      <Link
                        className="flex items-center gap-2 bg-white/25 text-white font-semibold text-base py-2 px-6 rounded-md hover:bg-white/35"
                        to={`/mov/${movie.tmdb_id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <FaInfoCircle />
                        More Info
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="hidden md:flex items-center gap-3 mt-4 pl-2 text-white/70">
            <BsArrowLeftCircle className="heroSlidePrev text-[2.4rem] p-2 cursor-pointer rounded-full hover:bg-white/10" />
            <BsArrowRightCircle className="heroSlideNext text-[2.4rem] p-2 cursor-pointer rounded-full hover:bg-white/10" />
          </div>
        </>
      ) : (
        <div className="bg-zinc-900 rounded-xl min-h-[70vh]" />
      )}
    </div>
  );
}
