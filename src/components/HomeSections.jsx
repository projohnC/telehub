import { React, useState } from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";


import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { BiArrowFromLeft } from "react-icons/bi";
import MovieCardSkeleton from "./MovieCardSkeleton";

export default function HomeSection(props) {
  // States
  const [showPlayBtn, setShowPlayBtn] = useState(false);
  const [openId, setOpenId] = useState();

  // PLAY Button Show/hide Function
  const showPlay = (i) => {
    setOpenId(i);
    setShowPlayBtn(true);
  };
  const hidePlay = (i) => {
    setOpenId(i);
    setShowPlayBtn(false);
  };

  return (
    <>
      {/* Title */}
      <div className="mt-[1.5rem] flex items-center justify-between flex-wrap gap-5 text-primaryTextColor pb-[0.8rem] md:mt-[3rem]">
        <div className="pl-[1rem] border-l-4 border-primaryBtn">
          <p className="text-[0.9rem] uppercase font-extrabold sm:text-[1.1rem] tracking-wider">
            {props.sectionTitle}
          </p>
        </div>

        {/* See All Button */}
        <Link
          to={props.sectionSeeMoreButtonLink}
          className="flex gap-2 items-center py-[0.5rem] px-[1rem] text-[0.7rem] transition-all duration-300 ease-in-out text-primaryBtn hover:text-primaryBtnHower font-bold"
          style={{ textDecoration: "none" }}
        >
          <p>See more</p>
          <BiArrowFromLeft className="text-xl" />
        </Link>
      </div>

      {/* Home Sections */}
      <div className="">
        {!props.isMovieDataLoading ? (
          <div className="relative ">
            <div className="grid  gap-x-2 gap-y-6 grid-cols-2 md:grid-cols-3 bsmmd:grid-cols-4  lg:grid-cols-5 blgxl:grid-cols-6 xl:grid-cols-7">
              {props.movieData.map((movie, index) => {
                return <MovieCard key={index} movie={movie} />;
              })}
            </div>
          </div>
        ) : (
          <>
            <MovieCardSkeleton />
          </>
        )}
      </div>
    </>
  );
}

