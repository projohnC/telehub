import { AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useEffect, useState, useRef } from "react";

const getVideoMimeType = (fileName = "") => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (ext === "mkv") return "video/x-matroska";
  if (ext === "webm") return "video/webm";
  return "video/mp4";
};

const buildVideoSource = (baseUrl, video) => ({
  src: `${baseUrl}/dl/${video.id}/${encodeURIComponent(video.name)}`,
  type: getVideoMimeType(video.name),
  size: parseInt(video.quality?.replace("p", ""), 10),
});

export default function WatchTrailer(props) {
  const [sources, setSources] = useState([]);
  const [poster, setPoster] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const BASE = import.meta.env.VITE_BASE_URL;

  const playerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (props.isWatchMoviePopupOpen || props.isWatchEpisodePopupOpen) {
        try {
          let videoSources = [];
          let selectedPoster = "";

          if (props.popUpType === "movie") {
            videoSources = props.id.telegram.map((q) => buildVideoSource(BASE, q));
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
                videoSources = episode.telegram.map((q) => buildVideoSource(BASE, q));
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
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "captions",
        "settings",
        "fullscreen",
      ],
    },
  };

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
            <Plyr
              ref={playerRef}
              {...plyrProps}
              id="player"
              className="netflix-player"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
