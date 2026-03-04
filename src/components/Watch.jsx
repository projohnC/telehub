import { AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function WatchTrailer(props) {
  const [sources, setSources] = useState([]);
  const [poster, setPoster] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(0); // 0 means not yet initialized
  const BASE = import.meta.env.VITE_BASE_URL;

  const playerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      if (props.isWatchMoviePopupOpen || props.isWatchEpisodePopupOpen) {
        try {
          let videoSources = [];
          let selectedPoster = "";

          if (props.popUpType === "movie") {
            videoSources = props.id.telegram.map((q) => ({
              src: `${BASE}/dl/${q.id}/${q.name}`,
              type: "video/mp4",
              size: q.quality ? parseInt(q.quality.match(/\d+/)?.[0] || "720", 10) : 720,
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
                  src: `${BASE}/dl/${q.id}/${q.name}`,
                  type: "video/mp4",
                  size: q.quality ? parseInt(q.quality.match(/\d+/)?.[0] || "720", 10) : 720,
                }));
                selectedPoster = episode.episode_backdrop;
              }
            }
          }

          setSources(videoSources);
          setPoster(selectedPoster);
          setIsModalOpen(true);
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
    BASE,
  ]);

  // Handle initial quality selection once sources are loaded
  useEffect(() => {
    if (sources.length > 0 && currentQuality === 0) {
      const defaultQuality = [1080, 720, 480].find(q => sources.some(s => s.size === q)) || (sources[0]?.size || 720);
      setCurrentQuality(defaultQuality);
    }
  }, [sources, currentQuality]);

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
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      quality: {
        default: currentQuality || 720,
        options: [...new Set(sources.map(s => s.size))].sort((a, b) => b - a),
        forced: true,
        onChange: (newSize) => {
          const size = parseInt(newSize, 10);
          if (isNaN(size)) return;

          if (playerRef.current && playerRef.current.plyr) {
            const newSource = sources.find(s => s.size === size);
            if (newSource) {
              const currentTime = playerRef.current.plyr.currentTime;
              const isPlaying = !playerRef.current.plyr.paused;

              // Update the state so the next render uses the correct default
              setCurrentQuality(size);

              playerRef.current.plyr.source = {
                type: "video",
                sources: sources.map((s) => ({
                  src: s.src,
                  type: s.type,
                  size: s.size,
                })),
              };

              // Ensure the selected quality is applied immediately
              playerRef.current.plyr.quality = size;

              // Restore state after source change
              playerRef.current.plyr.once('canplay', () => {
                playerRef.current.plyr.currentTime = currentTime;
                if (isPlaying) playerRef.current.plyr.play();
              });
            }
          }
        },
      },
      controls: [
        "play-large",
        "rewind",
        "play",
        "fast-forward",
        "progress",
        "current-time",
        "duration",
        "mute",
        "captions",
        "settings",
        "quality",
        "fullscreen",
      ],
      seekTime: 10,
    },
  };

  useEffect(() => {
    const handleFullscreen = () => {
      if (document.fullscreenElement && window.screen.orientation && window.screen.orientation.lock) {
        window.screen.orientation.lock("landscape").catch(err => console.log("Orientation lock failed:", err));
      } else if (window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  return (
    <>
      {props.inline ? (
        <div className="w-full aspect-video rounded-3xl overflow-hidden relative bg-black">
          {sources.length > 0 ? (
            <Plyr key={JSON.stringify(sources)} ref={playerRef} {...plyrProps} />
          ) : (
            <div className="flex items-center justify-center w-full aspect-video">
              <div className="loader"></div>
            </div>
          )}
        </div>
      ) : (
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-30 w-full h-screen bg-black/90 backdrop-blur-md flex items-center justify-center"
            >
              <button
                onClick={closeModal}
                className="absolute top-5 right-5 text-white text-2xl z-50"
              >
                <AiOutlineClose />
              </button>

              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-lg relative"
              >
                <Plyr key={JSON.stringify(sources)} ref={playerRef} {...plyrProps} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
