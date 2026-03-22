import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Autoplay, Navigation, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-creative";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { BsArrowLeftCircle, BsArrowRightCircle } from "react-icons/bs";
import { FaPlay } from "react-icons/fa";
import { PiStarFill } from "react-icons/pi";

export default function HeroSlider({ movieData, isMovieDataLoading }) {
  return (
    <div className="pt-20 md:pt-24">
      {!isMovieDataLoading ? (
        <>
          <Swiper
            modules={[Autoplay, Navigation, Pagination, A11y]}
            grabCursor={true}
            lazy="true"
            loop={true}
            navigation={{
              prevEl: ".heroSlidePrev",
              nextEl: ".heroSlideNext",
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={30}
            keyboard={{
              enabled: true,
            }}
          >
            {movieData.map((movie, index) => (
              <SwiperSlide key={index}>
                <div className="relative">
                  <div className="rounded-t-2xl aspect-video md:h-[22rem] mask md:aspect-auto">
                    <LazyLoadImage
                      src={movie.backdrop}
                      className="rounded-t-2xl"
                      effect="black-and-white"
                      alt={movie.title}
                    />
                  </div>
                  <div className="absolute bottom-4 left-4 right-0 flex flex-col gap-1 xs:gap-2  sm:left-8 text-secondaryTextColor">
                    {movie.title && (
                      <h1 className="line-clamp-1 w-[90%] text-xl sm:text-2xl md:text-3xl font-extrabold text-primaryTextColor uppercase tracking-tight">
                        {movie.title}
                      </h1>
                    )}
                    <div className="flex items-center gap-2 -mt-1 sm:-mt-2 text-secondaryTextColor/80">
                      {movie.release_year && (
                        <p className="text-[0.65rem] md:text-[0.8rem]">
                          {movie.release_year}
                        </p>
                      )}
                      <span className="text-[0.6rem]">•</span>
                      <p className="text-[0.65rem] md:text-[0.8rem]">
                        {movie.languages
                          ? movie.languages
                            .map(
                              (lang) =>
                                lang.charAt(0).toUpperCase() + lang.slice(1)
                            )
                            .join("-")
                          : "En-Hi"}
                      </p>
                      <span className="text-secondaryTextColor/40">|</span>
                      <p className="text-[0.65rem] md:text-[0.8rem]">
                        {movie.rip || "HD-Rip"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {movie.genres &&
                        movie.genres.slice(0, 3).map((genreName, index) => (
                          <div
                            className="text-[0.6rem] md:text-[0.7rem] py-0.5 px-3 bg-primaryBtn text-black font-bold rounded-sm uppercase"
                            key={index}
                          >
                            {genreName}
                          </div>
                        ))}
                    </div>

                    {movie.description && (
                      <p className="font-extralight line-clamp-1 w-[90%] text-[0.7rem] sm:line-clamp-2 sm:text-xs md:text-sm mt-1 opacity-70">
                        {movie.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-3">
                        <Link
                          className="flex items-center gap-2 bg-white text-black font-bold text-xs py-2.5 px-8 rounded-full sm:text-sm transition-all duration-300 ease-in-out hover:scale-105"
                          to={`/mov/${movie.tmdb_id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <FaPlay className="text-[10px]" />
                          Play Now
                        </Link>
                      </div>

                      {/* Rating Label */}
                      <div className="flex gap-1 items-center bg-bgColorSecondary/80 text-yellow-400 text-[0.7rem] py-1 px-3 rounded-full border border-white/5">
                        <PiStarFill />
                        <p className="font-bold">
                          {movie.rating ? movie.rating.toFixed(1) : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="flex items-center justify-between gap-3 mt-5 px-4 sm:px-8">
            <div className="flex items-center gap-3">
              <BsArrowLeftCircle className="heroSlidePrev text-[2.4rem] text-secondaryTextColor p-2 cursor-pointer rounded-full transition-all duration-300 ease-in-out hover:bg-bgColorSecondary hover:text-primaryTextColor " />
              <BsArrowRightCircle className="heroSlideNext text-[2.4rem] text-secondaryTextColor p-2 cursor-pointer rounded-full transition-all duration-300 ease-in-out hover:bg-bgColorSecondary hover:text-primaryTextColor" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="relative">
            <div className=" bg-bgColorSecondary rounded-t-2xl aspect-video rounded-2xl md:h-96 md:aspect-auto">
              <LazyLoadImage className="rounded-2xl" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
