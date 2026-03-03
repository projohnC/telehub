import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Autoplay, Navigation, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-creative";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { BsArrowLeftCircle, BsArrowRightCircle } from "react-icons/bs";
import { FaPlay, FaRegClock } from "react-icons/fa";
import { PiStarFill } from "react-icons/pi";
import { BiTime } from "react-icons/bi";

export default function HeroSlider({ movieData, isMovieDataLoading }) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <div className="pt-20">
      {!isMovieDataLoading ? (
        <>
          <Swiper
            modules={[Autoplay, Navigation, A11y]}
            grabCursor={true}
            lazy="true"
            loop={true}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            navigation={{
              prevEl: ".heroSlidePrev",
              nextEl: ".heroSlideNext",
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
                  <div className="rounded-t-2xl aspect-video md:h-96 mask md:aspect-auto">
                    <LazyLoadImage
                      src={movie.backdrop}
                      className="rounded-t-2xl"
                      effect="black-and-white"
                      alt={movie.title}
                    />
                  </div>
                  <div className="absolute bottom-4 left-4 right-0 flex flex-col gap-1 xs:gap-2  sm:left-8 text-secondaryTextColor">
                    {movie.title && (
                      <h1 className="line-clamp-2 w-[90%] text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-primaryTextColor leading-tight">
                        {movie.title}
                      </h1>
                    )}
                    <div className="flex items-center gap-2 -mt-2">
                      {movie.release_year && (
                        <p className="text-[0.6rem] lg:text-[0.7rem] xl:text-[0.9rem] ">
                          {movie.release_year}
                        </p>
                      )}
                      <span>•</span>
                      <p className="text-[0.6rem] lg:text-[0.7rem] xl:text-[0.9rem]">
                        {movie.languages
                          .map(
                            (lang) =>
                              lang.charAt(0).toUpperCase() + lang.slice(1)
                          ) // Capitalize each language code
                          .join("-")}{" "}
                      </p>
                      <span>|</span>
                      <p className="text-[0.6rem] lg:text-[0.7rem] xl:text-[0.9rem]">
                        {movie.rip}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 text-sm text-bgColor">
                      <div className="flex items-center gap-1 capitalize flex-wrap">
                        {movie.genres.map((genreId, index) => (
                          <div
                            className=" text-[0.6rem] py-0.5 px-2.5 bg-primaryBtn rounded-full sm:text-sm"
                            key={index}
                          >
                            {[genreId] || ""}
                          </div>
                        ))}
                      </div>
                    </div>

                    {movie.description && (
                      <p className="font-extralight line-clamp-1 w-[80%] text-xs sm:line-clamp-2 sm:text-sm md:text-md">
                        {movie.description}
                      </p>
                    )}
                    <div className=" flex items-center gap-3 mt-4 ">
                      <Link
                        className="flex items-center gap-2 bg-white text-black text-sm font-bold py-2.5 px-8 rounded-full sm:text-lg transition-all duration-300 ease-in-out hover:bg-gray-200"
                        to={`/mov/${movie.tmdb_id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <FaPlay className="text-xs" />
                        Play Now
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="flex items-center justify-center gap-2 mt-8">
            {movieData.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === activeIndex ? "w-8 bg-otherColor" : "w-4 bg-gray-600"
                  }`}
              ></div>
            ))}
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
