import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button } from "@nextui-org/button";
import axios from "axios";
import Spinner from "../components/svg/Spinner";
import VerificationPage from "../components/VerificationPage";

const Tg = () => {
  const location = useLocation();
  const movieData = location.state?.movieData;

  const USERNAME = import.meta.env.VITE_TG_USERNAME;
  const API_URL = import.meta.env.VITE_API_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;
  const rawBase = import.meta.env.VITE_BASE_URL || "";
  const BASE = rawBase
    ? (rawBase.startsWith("http://") || rawBase.startsWith("https://")
      ? rawBase
      : (rawBase === "0.0.0.0" || rawBase.includes("localhost") || rawBase.includes("127.0.0.1")
        ? `http://${rawBase}`
        : `https://${rawBase}`))
    : window.location.origin;

  const [loading, setLoading] = useState({});
  const [seasonsEpisodes, setSeasonsEpisodes] = useState({});
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    let active = true;
    if (movieData && movieData.media_type !== "movie" && movieData.seasons) {
      setLoadingEpisodes(true);
      const promises = movieData.seasons
        .filter((s) => s.season_number !== 0)
        .map((s) =>
          axios
            .get(`${BASE}/api/id/${movieData.tmdb_id}`, {
              params: { season_number: s.season_number },
            })
            .then((res) => ({ season_number: s.season_number, episodes: res.data?.episodes || [] }))
            .catch(() => ({ season_number: s.season_number, episodes: [] }))
        );

      Promise.all(promises).then((results) => {
        if (active) {
          const mapping = {};
          results.forEach((res) => {
            mapping[res.season_number] = res.episodes;
          });
          setSeasonsEpisodes(mapping);
          setLoadingEpisodes(false);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [movieData, BASE]);

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

  const handleButtonClick = async (originalUrl, quality) => {
    setLoading((prev) => ({ ...prev, [quality]: true }));
    let newWindow = null;
    if (API_URL) {
      newWindow = window.open("", "_blank");
    }

    try {
      const shortUrl = await shortenUrl(originalUrl);
      setLoading((prev) => ({ ...prev, [quality]: false }));
      if (newWindow) {
        newWindow.location.href = shortUrl;
      } else {
        window.open(shortUrl, "_blank", "noopener noreferrer");
      }
    } catch (error) {
      console.error("Error processing URL in Tg:", error);
      setLoading((prev) => ({ ...prev, [quality]: false }));
      if (newWindow) {
        newWindow.close();
      }
      window.open(originalUrl, "_blank", "noopener noreferrer");
    }
  };

  const renderQualityButtons = (qualityDetails) =>
    qualityDetails.map((q, index) => (
      <Button
        key={index}
        onClick={() =>
          handleButtonClick(
            q.custom_download_url || `https://t.me/${USERNAME}?start=file_${movieData.tmdb_id}_${q.quality}`,
            q.quality
          )
        }
        size="lg"
        className="bg-primaryBtn rounded-full m-2 text-white font-bold px-8 shadow-lg"
        isLoading={loading[q.quality]}
        spinner={<Spinner />}
      >
        {q.quality}
      </Button>
    ));

  const renderSeasonButtons = () => {
    if (loadingEpisodes) {
      return (
        <div className="flex justify-center w-full py-10">
          <Spinner />
        </div>
      );
    }

    return movieData.seasons
      .filter((s) => s.season_number !== 0)
      .map((season, seasonIndex) => {
        const qualityMap = new Map();
        const eps = seasonsEpisodes[season.season_number] || [];
        eps.forEach((episode) => {
          episode.telegram?.forEach((q) => {
            qualityMap.set(q.quality, q.custom_download_url || qualityMap.get(q.quality) || null);
          });
        });

        return (
          <Popover key={seasonIndex} placement="bottom" showArrow={true} offset={20}>
            <PopoverTrigger>
              <button className="bg-otherColor text-bgColor py-2 px-6 rounded-full border-2 border-otherColor m-2 text-lg font-bold shadow-md hover:scale-105 transition-transform">
                Season {season.season_number}
              </button>
            </PopoverTrigger>
            <PopoverContent className="bg-btnColor">
              <div className="px-2 py-4 flex gap-2 flex-wrap max-w-sm justify-center">
                {Array.from(qualityMap.keys()).map((quality, qualityIndex) => {
                  const customUrl = qualityMap.get(quality);
                  return (
                    <Button
                      key={qualityIndex}
                      onClick={() =>
                        handleButtonClick(
                          customUrl || `https://t.me/${USERNAME}?start=file_${movieData.tmdb_id}_${season.season_number}_${quality}`,
                          quality
                        )
                      }
                      size="md"
                      className="bg-primaryBtn rounded-full text-white font-bold"
                      isLoading={loading[quality]}
                      spinner={<Spinner />}
                    >
                      {quality}
                    </Button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        );
      });
  };

  return (
    <VerificationPage title="Telegram Links">
      <div className="flex flex-col items-center justify-center text-white w-full py-4 px-2 lg:px-4">
        <h1 className="text-xl md:text-2xl font-bold mb-4 uppercase text-white text-center drop-shadow-md">
          Select Quality
        </h1>
        <div className="flex gap-4 flex-wrap justify-center max-w-4xl p-6 bg-secondary/10 rounded-3xl shadow-2xl w-full border border-secondary/20 backdrop-blur-sm overflow-y-auto max-h-[65vh]">
          {movieData.media_type === "movie"
            ? renderQualityButtons(movieData.telegram || [])
            : renderSeasonButtons()}
        </div>
      </div>
    </VerificationPage>
  );
};

export default Tg;
