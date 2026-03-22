import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { PiTelegramLogo } from "react-icons/pi";
import { Button } from "@nextui-org/button";

const TelegramButton = ({ movieData }) => {
  const USERNAME = import.meta.env.VITE_TG_USERNAME;

  const handleButtonClick = (originalUrl) => {
    const encodedUrl = encodeURIComponent(originalUrl);
    window.open(`/tg?url=${encodedUrl}`, "_blank", "noopener noreferrer");
  };

  const renderQualityButtons = (qualityDetails) =>
    qualityDetails.map(({ quality }, index) => (
      <Button
        key={index}
        onClick={() =>
          handleButtonClick(
            `https://t.me/${USERNAME}?start=file_${movieData.tmdb_id}_${quality}`
          )
        }
        size="sm"
        className="bg-primaryBtn rounded-full"
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
        <Popover
          key={seasonIndex}
          placement="left"
          showArrow={true}
          offset={20}
        >
          <PopoverTrigger>
            <button className="text-left bg-otherColor text-bgColor py-1 px-3 rounded-full border-2 border-otherColor">
              Season {season.season_number}
            </button>
          </PopoverTrigger>
          <PopoverContent className="bg-btnColor">
            <div className="px-1 py-2 flex gap-1 flex-wrap">
              {Array.from(availableQualities).map((quality, qualityIndex) => (
                <Button
                  key={qualityIndex}
                  onClick={() =>
                    handleButtonClick(
                      `https://t.me/${USERNAME}?start=file_${movieData.tmdb_id}_${season.season_number}_${quality}`
                    )
                  }
                  size="sm"
                  className="bg-primaryBtn rounded-full"
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
    <Popover placement="bottom" showArrow={true}>
      <PopoverTrigger className="w-full">
        <button className="w-full uppercase flex items-center justify-center gap-2 bg-telegramColor text-white font-bold text-xs rounded-xl py-3 px-6 lg:text-sm shadow-lg transition-transform hover:scale-105 active:scale-95">
          <PiTelegramLogo className="text-xl" /> TELEGRAM
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-btnColor">
        <div className="px-1 py-2 flex gap-1 flex-wrap flex-col">
          {movieData.media_type === "movie"
            ? renderQualityButtons(movieData.telegram || [])
            : renderSeasonButtons()}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TelegramButton;
