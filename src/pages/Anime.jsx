// src/pages/Anime.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import MoviesAndSeriesSections from "../components/MoviesAndSeriesSections";
import SEO from "../components/SEO";

export default function Anime() {
  const BASE = import.meta.env.VITE_BASE_URL;
  const SITENAME = import.meta.env.VITE_SITENAME;

  const [anime, setAnime] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("updated_on");
  const [filterVal, setFilterVal] = useState("updated_on");

  useEffect(() => {
    setIsLoading(true);
    window.scrollTo(0, 0);

    // Assuming the backend has an /api/anime endpoint for animated content
    axios.get(`${BASE}/api/anime`, {
      params: {
        sort_by: `${filter}:desc`,
        page: currentPage,
        page_size: 20
      }
    })
    .then(response => {
      // Handle potential different response structures
      const data = response.data.anime || response.data.results || response.data.movies || response.data.tv_shows || [];
      setAnime(data);
      setTotalCount(response.data.total_count || data.length);
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error fetching anime:", error);
      setIsLoading(false);
    });
  }, [filter, currentPage, BASE]);

  return (
    <div>
      <SEO
        title={`${SITENAME} - Watch Anime Online in HD`}
        description={`Hubstream offers a growing collection of anime series and movies in HD. Browse the latest releases, classic favorites, and trending titles with English subtitles and dubbed versions. Find action, fantasy, romance, comedy, mystery, horror, and adventure anime for every fan.`}
        name={SITENAME}
        type="text/html"
        keywords="hubstream, hubstream art, hubstream.site, hubstream site, hdmovies.in, hubstream in, hubstream south hindi dubbed, hubstream pro, hubstream apk, all hubstream, South movies, Hubstream.art, hubstream apk, hubstream app, hubstream movies, hubstream streaming, hubstream watch online, hubstream hd, hubstream premium, hubstream online streaming, hubstream fast streaming, movie streaming platform, best movie website, 720p movies, 1080p movies, full hd movies, free movie streaming, online movie streaming, fast anime streaming, watch anime online, free anime streaming, latest anime episodes, hd anime, online anime streaming, best anime streaming, anime watch online, anime streaming hd, best anime streaming, hubstream anime, hubstream anime site, hubstream anime watch online, hubstream anime streaming, anime streaming platform, watch anime online"
        link={`https://${SITENAME}.site`}
      />
      
      <MoviesAndSeriesSections
        movieData={anime}
        isMovieDataLoading={isLoading}
        dataType="series" // Reuse series layout for anime
        sectionTitle="Browse Anime"
        setMovieFilter={setFilter}
        movieFilterVal={filterVal}
        setMovieFilterVal={setFilterVal}
      />

      <Pagination
        currentPage={currentPage}
        total={totalCount}
        pagesNum={Math.ceil(totalCount / 20) || 1}
        onPageChange={(p) => setCurrentPage(p)}
        limit={20}
      />
    </div>
  );
}
