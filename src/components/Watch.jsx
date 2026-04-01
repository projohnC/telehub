import { AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { MdLanguage } from "react-icons/md";
import { FaVolumeUp } from "react-icons/fa";

export default function WatchTrailer(props) {
  const [sources, setSources] = useState([]);
  const [poster, setPoster] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const BASE = import.meta.env.VITE_BASE_URL;

  const playerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      if (props.isWatchMoviePopupOpen || props.isWatchEpisodePopupOpen || props.isInline) {
        try {
          let videoSources = [];
          let selectedPoster = "";

          const getSourceUrl = (q) => {
            let url = `${BASE}/dl/${q.id}/${q.name}`;
            if (selectedAudio !== null) {
              url += `?audio=${selectedAudio}`;
              if (playerRef.current?.plyr) {
                const currentTime = playerRef.current.plyr.currentTime;
                if (currentTime > 0) {
                  url += `&start=${Math.floor(currentTime)}`;
                }
              }
            }
            return url;
          };

          if (props.popUpType === "movie") {
            videoSources = props.id.telegram.map((q) => ({
              src: getSourceUrl(q),
              type: "video/mp4",
              size: parseInt(q.quality.replace("p", ""), 10),
            }));
            selectedPoster = props.id.backdrop;
          } else if (props.popUpType === "episode") {
            const season = props.id.seasons.find(
              (season) => season.season_number === props.seasonNumber
            );

            if (season) {
              const episode = season.episodes.find(
                (ep) => ep.episode_number === props.episodeNumber
              );

              if (episode) {
                videoSources = episode.telegram.map((q) => ({
                  src: getSourceUrl(q),
                  type: "video/mp4",
                  size: parseInt(q.quality.replace("p", ""), 10),
                }));
                selectedPoster = episode.episode_backdrop;
              }
            }
          }

          setSources(videoSources);
          setPoster(selectedPoster);
          if (!props.isInline) {
            setIsModalOpen(true);
          }
        } catch (error) {
          console.error("Error processing data:", error);
        }
      }
    };

    fetchData();
  }, [
    props.isWatchMoviePopupOpen,
    props.isWatchEpisodePopupOpen,
    props.popUpType,
    props.id,
    props.seasonNumber,
    props.episodeNumber,
    props.isInline,
    selectedAudio,
    BASE,
  ]);

  const closeModal = () => {
    setIsModalOpen(false);
    if (props.popUpType === "trailer") {
      props.setIsTrailerPopupOpen(false);
    } else if (props.popUpType === "movie") {
      props.setIsWatchMoviePopupOpen(false);
    } else {
      props.setIsWatchEpisodePopupOpen(false);
    }
  };

  const plyrProps = {
    source: {
      type: "video",
      sources: sources,
    },
    options: {
      poster: poster,
      settings: ["captions", "quality", "speed"],
      controls: [
        "play-large",
        "rewind",
        "play",
        "fast-forward",
        "progress",
        "current-time",
        "mute",
        "settings",
        "fullscreen",
      ],
      seekTime: 10,
      autoplay: (props.isInline || selectedAudio !== null) && sources.length > 0,
    },
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        // Entered fullscreen
        if (window.screen.orientation && window.screen.orientation.lock) {
          window.screen.orientation.lock("landscape").catch((err) => {
            console.warn("Screen orientation lock failed:", err);
          });
        }
      } else {
        // Exited fullscreen
        if (window.screen.orientation && window.screen.orientation.unlock) {
          window.screen.orientation.unlock();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const getAudioTracks = () => {
    let audioTracks = [];
    if (props.popUpType === "movie") {
      audioTracks = props.id.telegram?.[0]?.audio_tracks || [];
    } else if (props.popUpType === "episode") {
      const season = props.id.seasons?.find(s => s.season_number === props.seasonNumber);
      const episode = season?.episodes?.find(e => e.episode_number === props.episodeNumber);
      audioTracks = episode?.telegram?.[0]?.audio_tracks || [];
    }
    return audioTracks;
  };

  const audioTracks = getAudioTracks();

  const handleAudioChange = (index) => {
    setSelectedAudio(index);
    setShowAudioMenu(false);
  };

  if (props.isInline) {
    return (
      <div className="w-full h-full bg-black flex flex-col rounded-3xl overflow-hidden shadow-2xl relative group">
        <div className="flex-grow flex items-center justify-center relative">
          {sources.length > 0 ? (
            <Plyr ref={playerRef} {...plyrProps} id="player" />
          ) : (
            <div className="loader"></div>
          )}

          {/* Integrated Audio Selection Button */}
          {audioTracks.length > 1 && (
            <div className="absolute bottom-4 right-20 z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => setShowAudioMenu(!showAudioMenu)}
                className="p-2.5 bg-black/60 hover:bg-red-600 text-white rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95"
                title="Change Audio"
              >
                <MdLanguage size={20} />
              </button>
              
              {showAudioMenu && (
                <div className="absolute bottom-12 right-0 w-48 bg-zinc-900/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-2 border-b border-white/5 bg-white/5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2">Select Audio</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto py-1">
                    <button
                      onClick={() => handleAudioChange(null)}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center gap-2 ${selectedAudio === null ? 'bg-red-600 text-white' : 'text-zinc-300 hover:bg-white/5'}`}
                    >
                      <FaVolumeUp size={12} className={selectedAudio === null ? 'text-white' : 'text-zinc-500'} />
                      <span>Default</span>
                    </button>
                    {audioTracks.map((track) => (
                      <button
                        key={track.index}
                        onClick={() => handleAudioChange(track.index)}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center gap-2 ${selectedAudio === track.index ? 'bg-red-600 text-white' : 'text-zinc-300 hover:bg-white/5'}`}
                      >
                        <FaVolumeUp size={12} className={selectedAudio === track.index ? 'text-white' : 'text-zinc-500'} />
                        <span>{track.title || track.language || `Track ${track.index}`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-30 w-full h-screen bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
        >
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-red-600 text-white rounded-full transition-all z-50 hover:scale-110 active:scale-95"
          >
            <AiOutlineClose size={24} />
          </button>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl bg-zinc-900 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
          >
            <div className="flex flex-col relative group">
              <div className="aspect-video w-full bg-black flex items-center justify-center relative">
                {sources.length > 0 ? (
                  <Plyr ref={playerRef} {...plyrProps} id="player" />
                ) : (
                  <div className="loader"></div>
                )}

                {/* Integrated Audio Selection Button for Modal */}
                {audioTracks.length > 1 && (
                  <div className="absolute bottom-6 right-24 z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setShowAudioMenu(!showAudioMenu)}
                      className="p-3 bg-black/60 hover:bg-red-600 text-white rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95 shadow-xl"
                      title="Change Audio"
                    >
                      <MdLanguage size={24} />
                    </button>
                    
                    {showAudioMenu && (
                      <div className="absolute bottom-14 right-0 w-56 bg-zinc-900/95 border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
                        <div className="p-3 border-b border-white/5 bg-white/5">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2">Select Audio Track</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto py-1">
                          <button
                            onClick={() => handleAudioChange(null)}
                            className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center gap-3 ${selectedAudio === null ? 'bg-red-600 text-white' : 'text-zinc-300 hover:bg-white/5'}`}
                          >
                            <FaVolumeUp size={14} className={selectedAudio === null ? 'text-white' : 'text-zinc-500'} />
                            <span>Default (English)</span>
                          </button>
                          {audioTracks.map((track) => (
                            <button
                              key={track.index}
                              onClick={() => handleAudioChange(track.index)}
                              className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center gap-3 ${selectedAudio === track.index ? 'bg-red-600 text-white' : 'text-zinc-300 hover:bg-white/5'}`}
                            >
                              <FaVolumeUp size={14} className={selectedAudio === track.index ? 'text-white' : 'text-zinc-500'} />
                              <span>{track.title || track.language || `Track ${track.index}`}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
