// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import HeroSlider from "../components/HomeHero";
import HomeSections from "../components/HomeSections";
import SEO from "../components/SEO";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const BASE = import.meta.env.VITE_BASE_URL; // Base Url for backend
  const SITENAME = import.meta.env.VITE_SITENAME;

  // States
  const [heroPopularMovies, setHeroPopularMovies] = useState([]);
  const [latestContent, setLatestContent] = useState([]);
  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const [isLatestLoading, setIsLatestLoading] = useState(true);

  useEffect(() => {
    setIsHeroLoading(true);
    window.scrollTo(0, 0);
    axios
      .get(`${BASE}/api/movies`, {
        params: {
          sort_by: "updated_on:desc",
          page: 1,
          page_size: 10,
        },
      })
      .then((response) => {
        setHeroPopularMovies(response.data.movies);
        setIsHeroLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching hero popular movies:", error);
        setIsHeroLoading(false);
      });
  }, [BASE]);

  useEffect(() => {
    setIsLatestLoading(true);

    const fetchLatest = async () => {
      try {
        const [moviesRes, tvRes] = await Promise.all([
          axios.get(`${BASE}/api/movies`, {
            params: { sort_by: "updated_on:desc", page: 1, page_size: 20 },
          }),
          axios.get(`${BASE}/api/tvshows`, {
            params: { sort_by: "updated_on:desc", page: 1, page_size: 20 },
          })
        ]);

        const combined = [
          ...moviesRes.data.movies.map(m => ({ ...m, type: 'movie' })),
          ...tvRes.data.tv_shows.map(t => ({ ...t, type: 'tv' }))
        ];

        // Sort by updated_on descending
        combined.sort((a, b) => new Date(b.updated_on) - new Date(a.updated_on));

        setLatestContent(combined.slice(0, 24));
        setIsLatestLoading(false);
      } catch (error) {
        console.error("Error fetching latest content:", error);
        setIsLatestLoading(false);
      }
    };

    fetchLatest();
  }, [BASE]);

  return (
    <div>
      <ToastContainer style={{ fontSize: "0.8rem" }} />
      {/* SEO SECTION */}
      <SEO
        title={SITENAME}
        description={`Discover a world of entertainment where every show, movie, and exclusive content takes you on a journey beyond the screen. ${SITENAME} offers endless options for every mood, helping you relax, escape, and imagine more. Stream your favorites, dream big, and repeat the experience, only with ${SITENAME}.`}
        name={SITENAME}
        type="text/html"
        keywords="watch movies online, watch hd movies, watch full movies, streaming movies online, free streaming movie, watch movies free, watch hd movies online, watch series online, watch hd series free, free tv series, free movies online, tv online, tv links, tv links movies, free tv shows, watch tv shows online, watch tv shows online free, free hd movies, New Movie Releases, Top Movies of the Year, Watch Movies Online, Streaming Services, Movie Reviews, Upcoming Films, Best Movie Scenes, Classic Movies, HD Movie Streaming, Film Trailers, Action Movies, Drama Films, Comedy Movies, Sci-Fi Films, Horror Movie Picks, Family-Friendly Movies, Award-Winning Films, Movie Recommendations, Cinematic Experiences, Behind-the-Scenes, Director Spotlights, Actor Interviews, Film Festivals, Cult Classics, Top Box Office Hits, Celebrity News, Movie Soundtracks, Oscar-Winning Movies, Movie Trivia, Exclusive Film Content, Best Cinematography, Must-Watch Movies, Film Industry News, Filmmaking Tips, Top Movie Blogs, Latest Movie Gossip, Interactive Movie Quizzes, Red Carpet Moments, IMDb Ratings, Movie Fan Communities, fmovies, fmovies.to, fmovies to, fmovies is, fmovie, free movies, online movie, movie online, free movies online, watch movies online free, free hd movies, watch movies online"
        link={`https://${SITENAME}.com`}
      />

      {/* HEADER - Hero and boxoffice */}
      <div className="col-span-1 lg:col-span-2">
        <HeroSlider
          movieData={heroPopularMovies}
          isMovieDataLoading={isHeroLoading}
          dataType="heroPopularMovies"
          sliderTypePrev="slideHeroTrendingMovies-prev"
          sliderTypeNext="slideHeroTrendingMovies-next"
        />
      </div>

      {/* Combined Latest Releases Section */}
      <HomeSections
        movieData={latestContent}
        isMovieDataLoading={isLatestLoading}
        sectionTitle="Latest Releases"
        sectionSeeMoreButtonLink="/Movies"
        dataType="latestContent"
      />
    </div>
  );
}
