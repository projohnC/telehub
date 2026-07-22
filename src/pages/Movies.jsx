// src/pages/Movies.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import MoviesAndSeriesSections from "../components/MoviesAndSeriesSections";
import Pagination from "../components/Pagination";
import SEO from "../components/SEO"; // import SEO

export default function Movies() {
  const BASE = import.meta.env.VITE_BASE_URL; // Base Url for backend
  const SITENAME = import.meta.env.VITE_SITENAME;

  // States
  const [movies, setMovies] = useState([]);
  const [isMoviesDataLoading, setIsMoviesDataLoading] = useState(true);
  const [moviesDataForPageCount, setMoviesDataForPageCount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [movieFilter, setMovieFilter] = useState("updated_on");
  const [movieFilterVal, setMovieFilterVal] = useState("updated_on");

  // FETCH MOVIE DATA SECTION
  useEffect(() => {
    setIsMoviesDataLoading(true);
    window.scrollTo(0, 0);

    const moviesPromise = axios.get(`${BASE}/api/movies`, {
      params: {
        sort_by: `${movieFilter}:desc`,
        page: currentPage,
        page_size: 20,
      },
    });

    const animePromise = axios.get(`${BASE}/api/anime`, {
      params: {
        sort_by: `${movieFilter}:desc`,
        page: currentPage,
        page_size: 20,
      },
    }).catch((error) => {
      console.error("Error fetching anime:", error);
      return { data: { anime: [], results: [], movies: [], total_count: 0 } };
    });

    Promise.all([moviesPromise, animePromise])
      .then(([moviesResponse, animeResponse]) => {
        const fetchMovies = moviesResponse.data.movies || [];
        const fetchAnime =
          animeResponse.data.anime ||
          animeResponse.data.results ||
          animeResponse.data.movies ||
          [];

        // Filter anime list to extract only animated/anime movies
        const animeMovies = fetchAnime.filter(
          (item) => item.media_type === "movie"
        );

        // Combine regular movies with anime movies
        const combined = [...fetchMovies, ...animeMovies];

        // Sort the combined list based on current filter
        combined.sort((a, b) => {
          if (movieFilter === "rating") {
            return (b.rating || 0) - (a.rating || 0);
          } else if (movieFilter === "release_year") {
            return (
              (parseInt(b.release_year) || 0) - (parseInt(a.release_year) || 0)
            );
          } else {
            // Default: updated_on (Latest)
            return new Date(b.updated_on || 0) - new Date(a.updated_on || 0);
          }
        });

        setMovies(combined);

        // Approximate total count
        const totalMoviesCount = moviesResponse.data.total_count || 0;
        const totalAnimeCount = animeResponse.data.total_count || 0;
        // Since anime contains both series and movies, approximate anime movies as 30% of total anime
        setMoviesDataForPageCount(
          totalMoviesCount + Math.ceil(totalAnimeCount * 0.3)
        );

        setIsMoviesDataLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching movies and anime:", error);
        setIsMoviesDataLoading(false);
      });
  }, [movieFilter, currentPage, BASE]);

  return (
    <div>
      {/* SEO SECTION */}
      <SEO
        title={`${SITENAME} - Watch Movies Online in HD Quality`}
        description={`Discover a world of entertainment where every show, movie, and exclusive content takes you on a journey beyond the screen. ${SITENAME} offers endless options for every mood, helping you relax, escape, and imagine more. Stream your favorites, dream big, and repeat the experience, only with ${SITENAME}.`}
        name={SITENAME}
        type="text/html"
        keywords="hubstream, hubstream art, hubstream.site, hubstream site, hdmovies.in, hubstream in, hubstream south hindi dubbed, hubstream pro, hubstream apk, all hubstream, South movies, Hubstream.art, hubstream apk, hubstream app, hubstream movies, hubstream streaming, hubstream watch online, hubstream hd, hubstream premium, hubstream online streaming, hubstream fast streaming, movie streaming platform, best movie website, 720p movies, 1080p movies, full hd movies, free movie streaming, online movie streaming, watch movies online, watch hd movies, watch full movies, streaming movies online, free streaming movie, watch movies free, watch hd movies online, watch series online, watch hd series free, free tv series, free movies online, tv online, tv links, tv links movies, free tv shows, watch tv shows online, watch tv shows online free, free hd movies, New Movie Releases, Top Movies of the Year, Watch Movies Online, Streaming Services, Movie Reviews, Upcoming Films, Best Movie Scenes, Classic Movies, HD Movie Streaming, Film Trailers, Action Movies, Drama Films, Comedy Movies, Sci-Fi Films, Horror Movie Picks, Family-Friendly Movies, Award-Winning Films, Movie Recommendations, Cinematic Experiences, Behind-the-Scenes, Director Spotlights, Actor Interviews, Film Festivals, Cult Classics, Top Box Office Hits, Celebrity News, Movie Soundtracks, Oscar-Winning Movies, Movie Trivia, Exclusive Film Content, Best Cinematography, Must-Watch Movies, Film Industry News, Filmmaking Tips, Top Movie Blogs, Latest Movie Gossip, Interactive Movie Quizzes, Red Carpet Moments, IMDb Ratings, Movie Fan Communities, fmovies, fmovies.to, fmovies to, fmovies is, fmovie, free movies, online movie, movie online, free movies online, watch movies online free, free hd movies, watch movies online"
        link={`https://${SITENAME}.site`}
      />
      {/* Movies component */}
      <MoviesAndSeriesSections
        movieData={movies}
        isMovieDataLoading={isMoviesDataLoading}
        dataType="movies"
        sectionTitle="Browse Movies"
        setMovieFilter={setMovieFilter}
        movieFilterVal={movieFilterVal}
        setMovieFilterVal={setMovieFilterVal}
      />

      {/* Call Pagination Component */}
      <Pagination
        currentPage={currentPage}
        total={moviesDataForPageCount} 
        pagesNum={Math.ceil(moviesDataForPageCount / 20)} 
        onPageChange={(p) => {
          setCurrentPage(p); 
        }}
        limit={20}
      />
    </div>
  );
}
