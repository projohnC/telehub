import React from "react";
import { PiTelegramLogo } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const TelegramButton = ({ movieData }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/tg", { state: { movieData } });
  };

  return (
    <button
      onClick={handleNavigate}
      className="w-full uppercase flex items-center justify-center gap-2 bg-telegramColor text-white font-bold text-xs rounded-xl py-3 px-6 lg:text-sm shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <PiTelegramLogo className="text-xl" /> TELEGRAM
    </button>
  );
};

export default TelegramButton;
