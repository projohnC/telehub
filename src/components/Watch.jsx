import { AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useEffect, useState, useRef } from "react";

const resolveVideoType = (name = "") => {
  const lower = name.toLowerCase();

  if (lower.endsWith(".m3u8")) return "application/x-mpegURL";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".ogg")) return "video/ogg";
  return "video/mp4";
};

const buildSource = (BASE, q) => {
  const parsedQuality = Number.parseInt(String(q?.quality ?? "").replace(/\D/g, ""), 10);

  return {
    src: `${BASE}/dl/${encodeURIComponent(q?.id ?? "")}/${encodeURIComponent(
      q?.name ?? ""
    )}`,
    type: resolveVideoType(q?.name),
    ...(Number.isFinite(parsedQuality) ? { size: parsedQuality } : {}),
  };
};

export default function WatchTrailer(props) {
  const [sources, setSources] = useState([]);
  const [poster, setPoster] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const BASE = import.meta.env.VITE_BASE_URL;

  const playerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // For inline usage, we might already have sources if they are passed down, 
      // but let's keep the logic consistent for now.
      if (props.isWatchMoviePopupOpen || props.isWatchEpisodePopupOpen || props.isInline) {
        try {
          let videoSources = [];
          let selectedPoster = "";

          if (props.popUpType === "movie") {
            videoSources = (props.id.telegram ?? []).map((q) => buildSource(BASE, q));
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
                videoSources = (episode.telegram ?? []).map((q) => buildSource(BASE, q));
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
      sources,
    },
    options: {
      poster,
      autoplay: false,
      playsinline: true,
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
      autoplay: props.isInline && sources.length > 0,
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

  if (props.isInline) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center rounded-3xl overflow-hidden shadow-2xl">
        {sources.length > 0 ? (
          <Plyr ref={playerRef} {...plyrProps} id="player" />
        ) : (
          <div className="loader"></div>
        )}
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
            className="netflix-player-shell w-[94vw] max-w-6xl rounded-xl overflow-hidden shadow-2xl relative"
          >
            {sources.length > 0 ? (
              <Plyr
                ref={playerRef}
                {...plyrProps}
                id="player"
                className="netflix-player"
              />
            ) : (
              <div className="aspect-video w-full flex items-center justify-center text-zinc-300 text-sm sm:text-base px-6 text-center">
                Video source unavailable for this title right now.
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
