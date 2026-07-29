import { AiOutlineClose } from "react-icons/ai";
import { MdClosedCaption, MdClosedCaptionOff } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { buildTracks, fileToSubtitleUrl } from "../utils/subtitles";

export default function WatchTrailer(props) {
  const [sources, setSources] = useState([]);
  const [poster, setPoster] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [captionError, setCaptionError] = useState("");
  const fileInputRef = useRef(null);
  const BASE = import.meta.env.VITE_BASE_URL;

  const playerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      // For inline usage, we might already have sources if they are passed down, 
      // but let's keep the logic consistent for now.
      if (props.isWatchMoviePopupOpen || props.isWatchEpisodePopupOpen || props.isInline) {
        try {
          let videoSources = [];
          let videoTracks = [];
          let selectedPoster = "";

          if (props.popUpType === "movie") {
            videoSources = props.id.telegram.map((q) => ({
              src: `${BASE}/dl/${q.id}/${q.name}`,
              type: "video/mp4",
              size: parseInt(q.quality.replace("p", ""), 10),
            }));
            selectedPoster = props.id.backdrop;
            videoTracks = await buildTracks(
              props.id.subtitles || props.id.captions
            );
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
                  size: parseInt(q.quality.replace("p", ""), 10),
                }));
                selectedPoster = episode.episode_backdrop;
                videoTracks = await buildTracks(
                  episode.subtitles || episode.captions
                );
              }
            }
          }

          setSources(videoSources);
          setTracks(videoTracks);
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

  // Load a user-provided .srt/.vtt subtitle file and attach it as a caption track.
  const handleSubtitleUpload = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;

    if (!/\.(srt|vtt)$/i.test(file.name)) {
      setCaptionError("Please select a .srt or .vtt subtitle file");
      return;
    }

    try {
      const src = await fileToSubtitleUrl(file);
      setCaptionError("");
      setTracks((prev) => [
        ...prev.map((t) => ({ ...t, default: false })),
        {
          kind: "captions",
          label: file.name.replace(/\.(srt|vtt)$/i, ""),
          srcLang: "en",
          src,
          default: true,
        },
      ]);
      setCaptionsOn(true);
    } catch (error) {
      console.error("Error loading subtitle file:", error);
      setCaptionError("Could not read that subtitle file");
    }
  };

  const toggleCaptions = () => {
    const player = playerRef.current && playerRef.current.plyr;
    const next = !captionsOn;
    setCaptionsOn(next);
    if (player && player.captions) {
      try {
        player.toggleCaptions(next);
      } catch (error) {
        console.warn("Caption toggle failed:", error);
      }
    }
  };

  const captionControls = (
    <div className="flex flex-wrap items-center gap-3 px-3 py-2 bg-black/60 text-white text-sm">
      <button
        type="button"
        onClick={toggleCaptions}
        disabled={tracks.length === 0}
        className="flex items-center gap-1 disabled:opacity-40"
        aria-label="Toggle captions"
      >
        {captionsOn && tracks.length > 0 ? (
          <MdClosedCaption className="text-xl" />
        ) : (
          <MdClosedCaptionOff className="text-xl" />
        )}
        <span>{captionsOn && tracks.length > 0 ? "Captions On" : "Captions Off"}</span>
      </button>

      <button
        type="button"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className="underline underline-offset-2 opacity-90 hover:opacity-100"
      >
        Add subtitle (.srt / .vtt)
      </button>

      {tracks.length > 0 && (
        <span className="opacity-70">
          {tracks.length} track{tracks.length > 1 ? "s" : ""} available
        </span>
      )}
      {captionError && <span className="text-red-400">{captionError}</span>}

      <input
        ref={fileInputRef}
        type="file"
        accept=".srt,.vtt,text/vtt"
        onChange={handleSubtitleUpload}
        className="hidden"
      />
    </div>
  );

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
      tracks: tracks,
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
      captions: { active: captionsOn && tracks.length > 0, update: true, language: "auto" },
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
      <div className="w-full h-full bg-black flex flex-col rounded-3xl overflow-hidden shadow-2xl">
        {sources.length > 0 ? (
          <>
            <div className="flex-1 flex items-center justify-center">
              <Plyr ref={playerRef} {...plyrProps} id="player" />
            </div>
            {captionControls}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="loader"></div>
          </div>
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
            className="w-full max-w-4xl rounded-lg overflow-hidden shadow-lg relative"
          >
            <Plyr ref={playerRef} {...plyrProps} id="player" />
            {captionControls}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
