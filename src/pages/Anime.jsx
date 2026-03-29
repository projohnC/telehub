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
        title={`Watch Anime Online - ${SITENAME}`}
        description={`Stream the latest Anime series and movies for free on ${SITENAME}. Explore a wide variety of animated content in high quality.`}
        name={SITENAME}
        type="text/html"
        keywords="watch anime online, free anime streaming, latest anime episodes, hd anime"
        link={`https://${SITENAME}.com/Anime`}
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
