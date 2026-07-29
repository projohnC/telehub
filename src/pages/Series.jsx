// src/pages/Series.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import MoviesAndSeriesSections from "../components/MoviesAndSeriesSections";
import SEO from "../components/SEO"; // import SEO

export default function Series() {
  const BASE = import.meta.env.VITE_BASE_URL; // Base URL for backend
  const SITENAME = import.meta.env.VITE_SITENAME;


  // States
  const [series, setSeries] = useState([]);
  const [isSeriesDataLoading, setIsSeriesDataLoading] = useState(true); 
  const [seriesDataForPageCount, setSeriesDataForPageCount] = useState("");
  const [currentPage, setCurrentPage] = useState(1); 
  const [seriesFilter, setSeriesFilter] = useState("updated_on"); 
  const [seriesFilterVal, setSeriesFilterVal] = useState("updated_on"); 

  // FETCH SERIES DATA SECTION
  useEffect(() => {
    setIsSeriesDataLoading(true); 
    window.scrollTo(0, 0); 

    axios.get(`${BASE}/api/tvshows`, {
      params: {
        sort_by: `${seriesFilter}:desc`,
        page: currentPage,
        page_size: 20
      }
    })
    .then(response => {
      setSeries(response.data.tv_shows);
      setSeriesDataForPageCount(response.data.total_count);
      setIsSeriesDataLoading(false); 
    })
    .catch(error => {
      console.error("Error fetching series:", error);
      setIsSeriesDataLoading(false); // Set loading state to false even if there is an error
    });
  }, [seriesFilter, currentPage, BASE]); // Added BASE as a dependency

  return (
    <div>
      {/* SEO SECTION */}
      <SEO
        title={`${SITENAME} - Watch Latest Web Series & TV Shows in HD`}
        description={`Hubstream brings you a huge collection of web series and TV shows in HD. Browse the latest OTT releases, popular Netflix series, Prime Video originals, Disney+ shows, Korean dramas, anime, and Hindi-dubbed series. Find trending episodes and complete seasons across multiple genres.`}
        name={SITENAME}
        type="text/html"
        keywords="hubstream, hubstream art, hubstream.site, hubstream site, hdmovies.in, hubstream in, hubstream south hindi dubbed, hubstream pro, hubstream apk, all hubstream, South movies, Hubstream.art, hubstream apk, hubstream app, hubstream movies, hubstream streaming, hubstream watch online, hubstream hd, hubstream premium, hubstream online streaming, hubstream fast streaming, movie streaming platform, best movie website, 720p movies, 1080p movies, full hd movies, free movie streaming, online movie streaming, watch movies online, watch hd movies, watch full movies, streaming movies online, free streaming movie, watch movies free, watch hd movies online, watch series online, watch hd series free, free tv series, free movies online, tv online, tv links, tv links movies, free tv shows, watch tv shows online, watch tv shows online free, free hd movies, New Movie Releases, Top Movies of the Year, Watch Movies Online, Streaming Services, Movie Reviews, Upcoming Films, Best Movie Scenes, Classic Movies, HD Movie Streaming, Film Trailers, Action Movies, Drama Films, Comedy Movies, Sci-Fi Films, Horror Movie Picks, Family-Friendly Movies, Award-Winning Films, Movie Recommendations, Cinematic Experiences, Behind-the-Scenes, Director Spotlights, Actor Interviews, Film Festivals, Cult Classics, Top Box Office Hits, Celebrity News, Movie Soundtracks, Oscar-Winning Movies, Movie Trivia, Exclusive Film Content, Best Cinematography, Must-Watch Movies, Film Industry News, Filmmaking Tips, Top Movie Blogs, Latest Movie Gossip, Interactive Movie Quizzes, Red Carpet Moments, IMDb Ratings, Movie Fan Communities, fmovies, fmovies.to, fmovies to, fmovies is, fmovie, free movies, online movie, movie online, free movies online, watch movies online free, free hd movies, watch movies online"
        link={`https://${SITENAME}.site`}
      />
      {/* Series component */}
      <MoviesAndSeriesSections
        movieData={series}
        isMovieDataLoading={isSeriesDataLoading}
        dataType="series"
        sectionTitle="Browse Series"
        setMovieFilter={setSeriesFilter}
        movieFilterVal={seriesFilterVal}
        setMovieFilterVal={setSeriesFilterVal}
      />

      {/* Call Pagination Component */}
      <Pagination
        currentPage={currentPage}
        total={seriesDataForPageCount} 
        pagesNum={Math.ceil(seriesDataForPageCount / 20)} 
        onPageChange={(p) => {
          setCurrentPage(p); 
        }}
        limit={20}
      />
    </div>
  );
}
