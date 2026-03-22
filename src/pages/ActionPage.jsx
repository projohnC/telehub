import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@nextui-org/button";
import axios from "axios";
import Spinner from "../components/svg/Spinner";
import VerificationPage from "../components/VerificationPage";

const ActionPage = ({ actionType }) => {
  const location = useLocation();
  const movieData = location.state?.movieData;
  const btnType = location.state?.btnType || actionType;

  const BASE = import.meta.env.VITE_BASE_URL;
  const API_URL = import.meta.env.VITE_API_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedEpisode, setSelectedEpisode] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    if (selectedSeason && movieData?.seasons) {
      const season = movieData.seasons.find(
        (s) => s.season_number === parseInt(selectedSeason)
      );
      if (season) {
        setEpisodes(season.episodes);
        setSelectedEpisode("");
        setQualities([]);
      }
    }
  }, [selectedSeason, movieData]);

  useEffect(() => {
    if (selectedEpisode && episodes.length > 0) {
      const episode = episodes.find(
        (e) => e.episode_number === parseInt(selectedEpisode)
      );
      if (episode) {
        setQualities(episode.telegram);
        setSelectedQuality("");
      }
    }
  }, [selectedEpisode, episodes]);

  if (!movieData) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>No movie data found. Please go back.</p>
      </div>
    );
  }

  const shortenUrl = async (url) => {
    try {
      if (!API_URL) return url;
      const response = await axios.get(API_URL, {
        params: { key: API_KEY, link: url },
      });
      const data = response.data;
      return data?.shortenedUrl || data?.short || data?.url || url;
    } catch (error) {
      console.error("Error shortening URL:", error);
      return url;
    }
  };

  const generateUrl = (id, name) => {
    const downloadUrl = `${BASE}/dl/${id}/${encodeURIComponent(name)}`;
    if (btnType === "Download") return downloadUrl;
    return `intent:${downloadUrl}#Intent;type=video/x-matroska;action=android.intent.action.VIEW;end;`;
  };

  const handleButtonClick = async (id, name, quality) => {
    setLoading((prev) => ({ ...prev, [quality]: true }));
    const rawUrl = generateUrl(id, name);
    const shortUrl = await shortenUrl(rawUrl);
    setLoading((prev) => ({ ...prev, [quality]: false }));
    window.open(shortUrl, "_blank", "noopener noreferrer");
  };

  const renderMovieButtons = () =>
    movieData.telegram?.map((q, i) => (
      <Button
        key={i}
        onClick={() => handleButtonClick(q.id, q.name, q.quality)}
        size="lg"
        className="bg-black/60 hover:bg-black/80 text-white font-bold border border-white/20 rounded-xl min-w-[120px] m-2 shadow-lg"
        isLoading={loading[q.quality]}
        spinner={<Spinner />}
      >
        {q.quality}
      </Button>
    ));

  const renderShowSelectors = () => (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <div className="flex flex-col gap-2">
        <label className="text-sm uppercase font-bold text-white/60 ml-1">Season</label>
        <div className="relative">
          <select
            className="w-full bg-black/60 border border-white/20 text-white text-lg rounded-2xl px-5 py-4 outline-none appearance-none cursor-pointer focus:border-primaryBtn/50 transition-all font-bold shadow-inner"
            onChange={(e) => setSelectedSeason(e.target.value)}
            value={selectedSeason}
          >
            <option value="" disabled className="bg-[#08090b]">Select season</option>
            {movieData.seasons
              .sort((a, b) => a.season_number - b.season_number)
              .map((s) => (
                <option key={s.season_number} value={s.season_number} className="bg-[#08090b]">
                  Season {s.season_number}
                </option>
              ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm uppercase font-bold text-white/60 ml-1">Episode</label>
        <div className="relative">
          <select
            className="w-full bg-black/60 border border-white/20 text-white text-lg rounded-2xl px-5 py-4 outline-none appearance-none cursor-pointer focus:border-primaryBtn/50 transition-all font-bold disabled:opacity-30 shadow-inner"
            onChange={(e) => setSelectedEpisode(e.target.value)}
            value={selectedEpisode}
            disabled={!selectedSeason}
          >
            <option value="" disabled className="bg-[#08090b]">Select episode</option>
            {episodes
              .sort((a, b) => a.episode_number - b.episode_number)
              .map((e) => (
                <option key={e.episode_number} value={e.episode_number} className="bg-[#08090b]">
                  Episode {e.episode_number}
                </option>
              ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm uppercase font-bold text-white/60 ml-1">Quality</label>
        <div className="relative">
          <select
            className="w-full bg-black/60 border border-white/20 text-white text-lg rounded-2xl px-5 py-4 outline-none appearance-none cursor-pointer focus:border-primaryBtn/50 transition-all font-bold disabled:opacity-30 shadow-inner"
            onChange={(e) => setSelectedQuality(e.target.value)}
            value={selectedQuality}
            disabled={!selectedEpisode}
          >
            <option value="" disabled className="bg-[#08090b]">Select quality</option>
            {qualities?.map((q) => (
              <option key={q.quality} value={q.quality} className="bg-[#08090b]">
                {q.quality}
              </option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          const q = qualities.find((q) => q.quality === selectedQuality);
          if (q) handleButtonClick(q.id, q.name, q.quality);
        }}
        disabled={!selectedQuality}
        className={`w-full mt-4 disabled:opacity-30 disabled:hover:scale-100 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-2xl flex justify-center items-center text-xl hover:scale-105 ${
          btnType === "Download" 
            ? "bg-gradient-to-r from-[#E50914] to-[#B20710]" 
            : "bg-primaryBtn"
        }`}
      >
        {loading[selectedQuality] ? <Spinner /> : (btnType === "Download" ? "Download Now" : "Play in Player")}
      </button>
    </div>
  );

  return (
    <VerificationPage title={btnType === "Download" ? "Download Links" : "Player Links"}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white w-full py-10 px-2 lg:px-4">
        <h1 className="text-2xl font-bold mb-6 uppercase text-white text-center drop-shadow-md tracking-wider px-2">
          {btnType === "Download" ? "Select Download Quality" : "Select Play Quality"}
        </h1>
        <div className="flex gap-4 flex-wrap justify-center items-center w-full max-w-4xl p-6 bg-secondary/10 rounded-[2rem] shadow-2xl border border-secondary/20 backdrop-blur-md overflow-y-auto max-h-[65vh]">
          {movieData.media_type === "movie" ? (
            <div className="flex justify-center flex-wrap gap-4 w-full">
              {renderMovieButtons()}
            </div>
          ) : (
            renderShowSelectors()
          )}
        </div>
      </div>
    </VerificationPage>
  );
};

export default ActionPage;
