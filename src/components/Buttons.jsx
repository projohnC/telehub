import axios from "axios";
import React, { useState, useEffect } from "react";
import { Select, SelectItem } from "@nextui-org/select";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button } from "@nextui-org/button";
import { FaCloudDownloadAlt, FaPlay } from "react-icons/fa";
import Spinner from "./svg/Spinner";

const DownloadButton = ({ movieData, btnType }) => {
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
    if (selectedSeason) {
      const season = movieData.seasons.find(
        (s) => s.season_number === parseInt(selectedSeason)
      );
      if (season) {
        setEpisodes(season.episodes);
        setSelectedEpisode("");
        setQualities([]);
      }
    }
  }, [selectedSeason, movieData.seasons]);

  useEffect(() => {
    if (selectedEpisode) {
      const episode = episodes.find(
        (e) => e.episode_number === parseInt(selectedEpisode)
      );
      if (episode) {
        setQualities(episode.telegram);
        setSelectedQuality("");
      }
    }
  }, [selectedEpisode, episodes]);

  const shortenUrl = async (url) => {
    try {
      // Flexible structure for various APIs
      const response = await axios.get(API_URL, {
        params: {
          key: API_KEY,
          link: url, // Adjust this depending on your API (link/url/etc.)
        },
      });

      const data = response.data;

      // Adjust this based on expected field in your API response
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
        size="sm"
        className="bg-black/40 hover:bg-black/60 text-white font-bold border border-white/10 rounded-lg min-w-[80px]"
        isLoading={loading[q.quality]}
        spinner={<Spinner />}
      >
        {q.quality}
      </Button>
    ));

  const renderShowSelectors = () => (
    <div className="p-3 flex flex-col gap-3 min-w-[200px]">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Season</label>
        <div className="relative">
          <select
            className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none appearance-none cursor-pointer focus:border-primaryBtn/50 transition-all font-bold"
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
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Episode</label>
        <div className="relative">
          <select
            className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none appearance-none cursor-pointer focus:border-primaryBtn/50 transition-all font-bold disabled:opacity-30"
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
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Quality</label>
        <div className="relative">
          <select
            className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none appearance-none cursor-pointer focus:border-primaryBtn/50 transition-all font-bold disabled:opacity-30"
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
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        className="w-full mt-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white font-bold py-3 rounded-xl transition-all active:scale-95 border border-white/5 shadow-xl flex justify-center items-center"
      >
        {loading[selectedQuality] ? <Spinner /> : (btnType === "Download" ? "Download Now" : "Play in Player")}
      </button>
    </div>
  );

  return (
    <Popover placement="top" offset={10} showArrow={true}>
      <PopoverTrigger className="w-full">
        <button
          className={`w-full flex justify-center items-center gap-2 uppercase font-bold text-white text-xs rounded-xl py-3 px-6 lg:text-sm shadow-xl transition-transform hover:scale-105 active:scale-95 ${btnType === "Download"
            ? "bg-gradient-to-r from-[#E50914] to-[#B20710]"
            : "bg-btnColor border border-white/10"
            }`}
        >
          {btnType === "Download" ? (
            <>
              <FaCloudDownloadAlt className="text-xl" /> DOWNLOAD
            </>
          ) : (
            <>
              <FaPlay className="text-xl" /> PLAYER
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-[#121418] border border-white/10 shadow-2xl rounded-2xl p-1">
        {movieData.media_type === "movie"
          ? <div className="px-2 py-3 flex gap-2 flex-wrap items-center justify-center max-w-[300px]">{renderMovieButtons()}</div>
          : renderShowSelectors()}
      </PopoverContent>
    </Popover>
  );
};

export default DownloadButton;
