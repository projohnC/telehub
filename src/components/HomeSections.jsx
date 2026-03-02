import { React } from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

import "react-lazy-load-image-component/src/effects/black-and-white.css";
import MovieCardSkeleton from "./MovieCardSkeleton";

export default function HomeSection(props) {
  return (
    <>
      <div className="mt-8 flex items-center justify-between gap-3 text-white pb-4 md:mt-10">
        <h2 className="text-2xl md:text-4xl font-bold">{props.sectionTitle}</h2>

        <Link
          to={props.sectionSeeMoreButtonLink}
          className="text-sm text-white/70 hover:text-white"
          style={{ textDecoration: "none" }}
        >
          See more
        </Link>
      </div>

      <div>
        {!props.isMovieDataLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2 md:gap-4">
            {props.movieData.map((movie, index) => {
              return (
                <div key={index} className="w-[46vw] sm:w-[34vw] md:w-[24vw] lg:w-[18vw] xl:w-[16vw] shrink-0">
                  <MovieCard movie={movie} />
                </div>
              );
            })}
          </div>
        ) : (
          <MovieCardSkeleton />
        )}
      </div>
    </>
  );
}
