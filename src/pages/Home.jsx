// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import HeroSlider from "../components/HomeHero";
import HomeSections from "../components/HomeSections";
import Pagination from "../components/Pagination";
import SEO from "../components/SEO";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const BASE = import.meta.env.VITE_BASE_URL; // Base Url for backend
  const SITENAME = import.meta.env.VITE_SITENAME;

  // States
  const [heroPopularMovies, setHeroPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTv, setTrendingTv] = useState([]);
  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const [isTrendingMoviesLoading, setIsTrendingMoviesLoading] = useState(true);
  const [isTrendingTvLoading, setIsTrendingTvLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMoviesCount, setTotalMoviesCount] = useState(0);
  const [totalTvShowsCount, setTotalTvShowsCount] = useState(0);

  useEffect(() => {
    setIsHeroLoading(true);
    window.scrollTo(0, 0);
    axios
      .get(`${BASE}/api/movies`, {
        params: {
          sort_by: "rating:desc",
          page: 1,
          page_size: 10,
          is_anime: true,
        },
      })
      .then((response) => {
        const rawMovies = response.data.movies || [];
        const animeMovies = rawMovies.filter((m) => m.is_anime);
        setHeroPopularMovies(animeMovies);
        setIsHeroLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching hero popular movies:", error);
        setIsHeroLoading(false);
      });
  }, [BASE]);

  useEffect(() => {
    setIsTrendingMoviesLoading(true);
    axios
      .get(`${BASE}/api/movies`, {
        params: {
          sort_by: "updated_on:desc",
          page: currentPage,
          page_size: 20,
          is_anime: true,
        },
      })
      .then((response) => {
        const rawMovies = response.data.movies || [];
        const animeMovies = rawMovies.filter((m) => m.is_anime);
        setTrendingMovies(animeMovies);
        setTotalMoviesCount(response.data.total_count || animeMovies.length);
        setIsTrendingMoviesLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trending movies:", error);
        setIsTrendingMoviesLoading(false);
      });
  }, [BASE, currentPage]);

  useEffect(() => {
    setIsTrendingTvLoading(true);
    axios
      .get(`${BASE}/api/tvshows`, {
        params: {
          sort_by: "updated_on:desc",
          page: currentPage,
          page_size: 20,
          is_anime: true,
        },
      })
      .then((response) => {
        const rawTv = response.data.tv_shows || [];
        const animeTv = rawTv.filter((t) => t.is_anime);
        setTrendingTv(animeTv);
        setTotalTvShowsCount(response.data.total_count || animeTv.length);
        setIsTrendingTvLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trending TV shows:", error);
        setIsTrendingTvLoading(false);
      });
  }, [BASE, currentPage]);

  // Combined Latest
  const [combinedLatest, setCombinedLatest] = useState([]);
  const [isCombinedLoading, setIsCombinedLoading] = useState(true);

  useEffect(() => {
    if (!isTrendingMoviesLoading && !isTrendingTvLoading) {
      const movies = Array.isArray(trendingMovies) ? trendingMovies : [];
      const tv = Array.isArray(trendingTv) ? trendingTv : [];
      const merged = [...movies, ...tv].sort((a, b) => {
        return new Date(b.updated_on) - new Date(a.updated_on);
      });
      setCombinedLatest(merged.slice(0, 24)); // Show top 24 mixed items
      setIsCombinedLoading(false);
    } else {
      setIsCombinedLoading(true);
    }
  }, [trendingMovies, trendingTv, isTrendingMoviesLoading, isTrendingTvLoading]);

  return (
    <div>
      <ToastContainer style={{ fontSize: "0.8rem" }} />
      {/* SEO SECTION */}
      <SEO
        title={`${SITENAME} Official - Watch Anime Movies & Series Online`}
        description={`Discover a world of anime entertainment where every series, movie, and exclusive animated content takes you on a journey. ${SITENAME} offers endless anime options for every mood, helping you relax, escape, and repeat. Stream your favorite anime in HD, only with ${SITENAME}.`}
        name={SITENAME}
        type="text/html"
        keywords="watch movies online, watch hd movies, watch full movies, streaming movies online, free streaming movie, watch movies free, watch hd movies online, watch series online, watch hd series free, free tv series, free movies online, tv online, tv links, tv links movies, free tv shows, watch tv shows online, watch tv shows online free, free hd movies, New Movie Releases, Top Movies of the Year, Watch Movies Online, Streaming Services, Movie Reviews, Upcoming Films, Best Movie Scenes, Classic Movies, HD Movie Streaming, Film Trailers, Action Movies, Drama Films, Comedy Movies, Sci-Fi Films, Horror Movie Picks, Family-Friendly Movies, Award-Winning Films, Movie Recommendations, Cinematic Experiences, Behind-the-Scenes, Director Spotlights, Actor Interviews, Film Festivals, Cult Classics, Top Box Office Hits, Celebrity News, Movie Soundtracks, Oscar-Winning Movies, Movie Trivia, Exclusive Film Content, Best Cinematography, Must-Watch Movies, Film Industry News, Filmmaking Tips, Top Movie Blogs, Latest Movie Gossip, Interactive Movie Quizzes, Red Carpet Moments, IMDb Ratings, Movie Fan Communities, fmovies, fmovies.to, fmovies to, fmovies is, fmovie, free movies, online movie, movie online, free movies online, watch movies online free, free hd movies, watch movies online"
        link={`https://${SITENAME}.site`}
      />

      {/* HEADER - Hero and boxoffice */}
      <div className="col-span-1 lg:col-span-2">
        <HeroSlider
          movieData={combinedLatest.slice(0, 10)}
          isMovieDataLoading={isCombinedLoading}
          dataType="heroPopularMovies"
          sliderTypePrev="slideHeroTrendingMovies-prev"
          sliderTypeNext="slideHeroTrendingMovies-next"
        />
      </div>

      {/* Combined Latest Section */}
      <HomeSections
        movieData={combinedLatest}
        isMovieDataLoading={isCombinedLoading}
        sectionTitle="Recently Added"
        sectionSeeMoreButtonLink="/Movies" // Could point to a combined page if available
        dataType="latestContent"
      />

      <Pagination
        currentPage={currentPage}
        total={totalMoviesCount + totalTvShowsCount}
        pagesNum={Math.ceil((totalMoviesCount + totalTvShowsCount) / 24)}
        onPageChange={(p) => {
          setCurrentPage(p);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        limit={24}
      />
    </div>
  );
}
