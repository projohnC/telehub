import React from "react";
import { FaCloudDownloadAlt, FaPlay } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DownloadButton = ({ movieData, btnType }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (btnType === "Download") {
      navigate("/dow", { state: { movieData, btnType } });
    } else {
      navigate("/plyr", { state: { movieData, btnType } });
    }
  };

  return (
    <button
      onClick={handleNavigate}
      className={`w-full flex justify-center items-center gap-2 uppercase font-bold text-white text-xs rounded-xl py-3 px-6 lg:text-sm shadow-xl transition-transform hover:scale-105 active:scale-95 ${
        btnType === "Download"
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
  );
};

export default DownloadButton;
