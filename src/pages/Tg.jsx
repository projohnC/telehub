import React, { useState } from "react";
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

  const [loading, setLoading] = useState({});

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
    let shortUrl = originalUrl;
    try {
      shortUrl = await shortenUrl(originalUrl);
    } catch (error) {
      console.error("Error processing URL:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [quality]: false }));
      window.open(shortUrl, "_blank", "noopener noreferrer");
    }
  };

  const renderQualityButtons = (qualityDetails) =>
    qualityDetails.map(({ quality }, index) => (
      <Button
        key={index}
        onClick={() =>
          handleButtonClick(
            `https://t.me/${USERNAME}?start=file_${movieData.tmdb_id}_${quality}`,
            quality
          )
        }
        size="lg"
        className="bg-primaryBtn rounded-full m-2 text-white font-bold px-8 shadow-lg"
        isLoading={loading[quality]}
        spinner={<Spinner />}
      >
        {quality}
      </Button>
    ));

  const renderSeasonButtons = () =>
    movieData.seasons.map((season, seasonIndex) => {
      const availableQualities = new Set();
      season.episodes.forEach((episode) => {
        episode.telegram?.forEach(({ quality }) =>
          availableQualities.add(quality)
        );
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
              {Array.from(availableQualities).map((quality, qualityIndex) => (
                <Button
                  key={qualityIndex}
                  onClick={() =>
                    handleButtonClick(
                      `https://t.me/${USERNAME}?start=file_${movieData.tmdb_id}_${season.season_number}_${quality}`,
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
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    });

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
