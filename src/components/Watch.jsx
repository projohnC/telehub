import { AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { MdSubtitles } from "react-icons/md";
import { toast } from "react-toastify";

import SubtitlesModal from "./SubtitlesModal";
import {
  findCueText,
  loadSubtitleCues,
  readPreference,
  savePreference,
} from "../utils/subtitles";

export default function WatchTrailer(props) {
  const [sources, setSources] = useState([]);
  const [poster, setPoster] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const BASE = import.meta.env.VITE_BASE_URL;

  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const cuesRef = useRef([]);
  const location = useLocation();

  // Subtitle state
  const [isSubtitlesModalOpen, setIsSubtitlesModalOpen] = useState(false);
  const [activeSubtitleName, setActiveSubtitleName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // For inline usage, we might already have sources if they are passed down, 
      // but let's keep the logic consistent for now.
      if (props.isWatchMoviePopupOpen || props.isWatchEpisodePopupOpen || props.isInline) {
        try {
          let videoSources = [];
          let selectedPoster = "";

          if (props.popUpType === "movie") {
            videoSources = props.id.telegram.map((q) => ({
              src: `${BASE}/dl/${q.id}/${q.name}`,
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
                  src: `${BASE}/dl/${q.id}/${q.name}`,
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


  // ---- Subtitles -----------------------------------------------------------

  const getVideoEl = useCallback(
    () => containerRef.current?.querySelector("video") || null,
    []
  );

  // Caption overlay lives inside the Plyr container so it stays visible in fullscreen.
  const ensureOverlay = useCallback(() => {
    const host =
      containerRef.current?.querySelector(".plyr") || containerRef.current;
    if (!host) return null;
    if (overlayRef.current && host.contains(overlayRef.current)) {
      return overlayRef.current;
    }
    const el = document.createElement("div");
    el.className = "custom-subtitle-overlay";
    host.appendChild(el);
    overlayRef.current = el;
    return el;
  }, []);

  const renderCue = useCallback(
    (time) => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const text = findCueText(cuesRef.current, time);
      if (overlay.dataset.text === text) return;
      overlay.dataset.text = text;
      overlay.innerHTML = text
        ? text
            .split("\n")
            .map((line) => `<span>${line}</span>`)
            .join("")
        : "";
      overlay.style.opacity = text ? "1" : "0";
    },
    []
  );

  // Plyr rebuilds its DOM (and the <video> element) whenever the source or
  // quality changes, which detaches any listener/overlay we attached earlier.
  // A rAF loop re-resolves both every frame, so cues keep rendering.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const overlay = ensureOverlay();
      const video = getVideoEl();
      if (overlay && video) renderCue(video.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ensureOverlay, getVideoEl, renderCue]);


  const clearSubtitles = useCallback(() => {
    cuesRef.current = [];
    setActiveSubtitleName("");
    if (overlayRef.current) {
      overlayRef.current.innerHTML = "";
      overlayRef.current.dataset.text = "";
      overlayRef.current.style.opacity = "0";
    }
    savePreference(null);
    setIsSubtitlesModalOpen(false);
  }, []);

  const applySubtitle = useCallback(
    async ({ src, label, lang, persist = true, silent = false }) => {
      try {
        const cues = await loadSubtitleCues(src);
        if (!cues.length) {
          toast.error("Subtitle file is empty or unsupported");
          return;
        }
        cuesRef.current = cues;
        ensureOverlay();
        const video = getVideoEl();
        renderCue(video ? video.currentTime : 0);
        setActiveSubtitleName(`${label} (${(lang || "en").toUpperCase()})`);
        setIsSubtitlesModalOpen(false);
        if (persist) savePreference({ src, label, lang: lang || "en" });
        if (!silent) toast.success(`Subtitle loaded: ${label}`);
      } catch (e) {
        console.error("Subtitle load error:", e);
        toast.error("Could not load that subtitle");
      }
    },
    [ensureOverlay, getVideoEl, renderCue]
  );

  // Restore the last used subtitle once a video is ready.
  useEffect(() => {
    if (!sources.length) return;
    const pref = readPreference();
    if (!pref?.src || pref.src.startsWith("blob:")) return;
    applySubtitle({ ...pref, silent: true, persist: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources.length]);

  const subtitleTitle =
    props.popUpType === "episode"
      ? props.id?.name || props.id?.title || ""
      : props.id?.title || props.id?.name || "";

  // Track Plyr host + auto-hide the subtitle button with the player controls.
  const [plyrHost, setPlyrHost] = useState(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    const find = () => {
      const host = containerRef.current?.querySelector(".plyr");
      if (host && host !== plyrHost) setPlyrHost(host);
      raf = requestAnimationFrame(find);
    };
    raf = requestAnimationFrame(find);
    return () => cancelAnimationFrame(raf);
  }, [plyrHost]);

  useEffect(() => {
    if (!plyrHost) return;

    const show = () => {
      setControlsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 2500);
    };
    const hideNow = () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setControlsVisible(false);
    };

    show();
    plyrHost.addEventListener("mousemove", show);
    plyrHost.addEventListener("mousedown", show);
    plyrHost.addEventListener("touchstart", show);
    plyrHost.addEventListener("mouseleave", hideNow);
    window.addEventListener("keydown", show);

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      plyrHost.removeEventListener("mousemove", show);
      plyrHost.removeEventListener("mousedown", show);
      plyrHost.removeEventListener("touchstart", show);
      plyrHost.removeEventListener("mouseleave", hideNow);
      window.removeEventListener("keydown", show);
    };
  }, [plyrHost]);

  const subtitlesButtonEl = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setIsSubtitlesModalOpen(true);
      }}
      title="Subtitles"
      className={`absolute z-40 top-3 left-3 flex items-center gap-2 rounded-full px-3 py-2 text-xs text-white backdrop-blur-md transition-opacity duration-300 hover:bg-black/80 ${
        activeSubtitleName ? "bg-primaryBtn/90" : "bg-black/60"
      } ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <MdSubtitles className="text-lg" />
      <span className="hidden sm:inline">
        {activeSubtitleName ? "Subtitles on" : "Subtitles"}
      </span>
    </button>
  );

  // Render inside the Plyr host so it stays visible when the player enters
  // native fullscreen (fullscreen only elevates the .plyr element).
  const subtitlesButton = plyrHost ? createPortal(subtitlesButtonEl, plyrHost) : null;

  const subtitlesModal = (
    <SubtitlesModal
      isOpen={isSubtitlesModalOpen}
      onClose={() => setIsSubtitlesModalOpen(false)}
      onSelect={applySubtitle}
      onClear={clearSubtitles}
      activeSubtitleName={activeSubtitleName}
      autoQuery={subtitleTitle}
      seasonNumber={props.seasonNumber}
      episodeNumber={props.episodeNumber}
    />
  );

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
      <div
        ref={containerRef}
        className="w-full h-full bg-black flex items-center justify-center rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {sources.length > 0 ? (
          <>
            <Plyr ref={playerRef} {...plyrProps} id="player" />
            {subtitlesButton}
          </>
        ) : (
          <div className="loader"></div>
        )}
        {subtitlesModal}
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
            ref={containerRef}
          >
            <Plyr ref={playerRef} {...plyrProps} id="player" />
            {sources.length > 0 && subtitlesButton}
            {subtitlesModal}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
