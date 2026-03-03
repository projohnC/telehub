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

  const [selectedSeason, setSelectedSeason] = useState(new Set([]));
  const [selectedEpisode, setSelectedEpisode] = useState(new Set([]));
  const [selectedQuality, setSelectedQuality] = useState(new Set([]));
  const [episodes, setEpisodes] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    const seasonVal = Array.from(selectedSeason)[0];
    if (seasonVal) {
      const season = movieData.seasons.find(
        (s) => s.season_number === parseInt(seasonVal)
      );
      if (season) {
        setEpisodes(season.episodes);
        setSelectedEpisode(new Set([]));
        setQualities([]);
      }
    }
  }, [selectedSeason, movieData.seasons]);

  useEffect(() => {
    const episodeVal = Array.from(selectedEpisode)[0];
    if (episodeVal) {
      const episode = episodes.find(
        (e) => e.episode_number === parseInt(episodeVal)
      );
      if (episode) {
        setQualities(episode.telegram);
        setSelectedQuality(new Set([]));
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
        className={`${btnType === "Download" ? "bg-purple-gradient" : "bg-dark-premium"} btn-hover-effect text-white rounded-xl shadow-lg font-bold`}
        isLoading={loading[q.quality]}
        spinner={<Spinner />}
      >
        {q.quality}
      </Button>
    ));

  const renderShowSelectors = () => (
    <div className="px-1 py-2 flex flex-col gap-2">
      <Select
        isRequired
        variant="bordered"
        aria-label="Select season"
        placeholder="Select season"
        className="w-40 mb-2"
        classNames={{
          value: "text-white",
          trigger: "border-white/20",
        }}
        onSelectionChange={setSelectedSeason}
        selectedKeys={selectedSeason}
      >
        {movieData.seasons
          .sort((a, b) => a.season_number - b.season_number)
          .map((s) => (
            <SelectItem key={s.season_number} textValue={`Season ${s.season_number}`}>
              Season {s.season_number}
            </SelectItem>
          ))}
      </Select>
      <Select
        isRequired
        variant="bordered"
        aria-label="Select episode"
        placeholder="Select episode"
        className="w-40 mb-2"
        classNames={{
          value: "text-white",
          trigger: "border-white/20",
        }}
        onSelectionChange={setSelectedEpisode}
        selectedKeys={selectedEpisode}
        isDisabled={selectedSeason.size === 0}
      >
        {episodes
          .sort((a, b) => a.episode_number - b.episode_number)
          .map((e) => (
            <SelectItem key={e.episode_number} textValue={`Episode ${e.episode_number}`}>
              Episode {e.episode_number}
            </SelectItem>
          ))}
      </Select>
      <Select
        isRequired
        variant="bordered"
        aria-label="Select quality"
        placeholder="Select quality"
        className="w-40 mb-2"
        classNames={{
          value: "text-white",
          trigger: "border-white/20",
        }}
        onSelectionChange={setSelectedQuality}
        selectedKeys={selectedQuality}
        isDisabled={selectedEpisode.size === 0}
      >
        {qualities?.map((q) => (
          <SelectItem key={q.quality} textValue={q.quality}>
            {q.quality}
          </SelectItem>
        ))}
      </Select>
      <Button
        onClick={() => {
          const qualityVal = Array.from(selectedQuality)[0];
          const q = qualities.find((q) => q.quality === qualityVal);
          if (q) handleButtonClick(q.id, q.name, q.quality);
        }}
        size="sm"
        className={`${btnType === "Download" ? "bg-purple-gradient" : "bg-dark-premium"} btn-hover-effect text-white rounded-xl shadow-lg font-bold`}
        isDisabled={selectedQuality.size === 0}
        isLoading={loading[Array.from(selectedQuality)[0]]}
        spinner={<Spinner />}
      >
        {btnType === "Download" ? "Download Now" : "Play in Player"}
      </Button>
    </div>
  );

  return (
    <Popover placement="bottom" showArrow={true}>
      <PopoverTrigger>
        <button className={`uppercase flex items-center justify-center gap-2 max-w-full grow text-white text-xs rounded-2xl py-2 px-3 lg:text-sm sm:px-5 sm:max-w-[15rem] sm:py-3 font-bold shadow-lg btn-hover-effect ${btnType === "Download" ? "bg-purple-gradient" : "bg-dark-premium"}`}>
          {btnType === "Download" ? (
            <>
              <FaCloudDownloadAlt className="text-xl" /> Download
            </>
          ) : (
            <>
              <FaPlay className="text-xl" /> Player
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-btnColor">
        {movieData.media_type === "movie"
          ? <div className="px-1 py-2 flex gap-1 flex-wrap">{renderMovieButtons()}</div>
          : renderShowSelectors()}
      </PopoverContent>
    </Popover>
  );
};

export default DownloadButton;
