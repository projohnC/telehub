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
  const uiLayerRef = useRef(null);
  const cuesRef = useRef([]);
  const location = useLocation();

  // Subtitle state
  const [isSubtitlesModalOpen, setIsSubtitlesModalOpen] = useState(false);
  const [activeSubtitleName, setActiveSubtitleName] = useState("");
  // Host element (inside .plyr) for custom controls, so they survive fullscreen.
  const [uiLayer, setUiLayer] = useState(null);
  const [uiVisible, setUiVisible] = useState(true);

  const subtitleTitle =
    props.popUpType === "episode"
      ? props.id?.name || props.id?.title || ""
      : props.id?.title || props.id?.name || "";

  // Identifies exactly what is playing right now. Changing it must reset subs.
  const contentKey = [
    props.popUpType || "",
    props.id?._id || props.id?.id || props.id?.imdb_id || subtitleTitle,
    props.seasonNumber ?? "",
    props.episodeNumber ?? "",
  ].join("|");

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

  // Same idea for the custom control layer (subtitles button).
  const ensureUiLayer = useCallback(() => {
    const host = containerRef.current?.querySelector(".plyr");
    if (!host) return null;
    if (uiLayerRef.current && host.contains(uiLayerRef.current)) {
      return uiLayerRef.current;
    }
    const el = document.createElement("div");
    el.className = "custom-ui-layer";
    host.appendChild(el);
    uiLayerRef.current = el;
    setUiLayer(el);
    return el;
  }, []);

  const renderCue = useCallback((time) => {
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
  }, []);

  // Plyr rebuilds its DOM (and the <video> element) whenever the source or
  // quality changes, which detaches any listener/overlay we attached earlier.
  // A rAF loop re-resolves both every frame, so cues keep rendering.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const overlay = ensureOverlay();
      ensureUiLayer();
      const video = getVideoEl();
      if (overlay && video) renderCue(video.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ensureOverlay, ensureUiLayer, getVideoEl, renderCue]);

  const clearSubtitles = useCallback((persist = true) => {
    cuesRef.current = [];
    setActiveSubtitleName("");
    if (overlayRef.current) {
      overlayRef.current.innerHTML = "";
      overlayRef.current.dataset.text = "";
      overlayRef.current.style.opacity = "0";
    }
    if (persist) savePreference(null);
    setIsSubtitlesModalOpen(false);
  }, []);

  // Switching to another movie / series / anime / episode must drop the
  // previously loaded cues instead of keeping them on screen.
  useEffect(() => {
    clearSubtitles(false);
  }, [contentKey, clearSubtitles]);

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
        if (persist)
          savePreference({ key: contentKey, src, label, lang: lang || "en" });
        if (!silent) toast.success(`Subtitle loaded: ${label}`);
      } catch (e) {
        console.error("Subtitle load error:", e);
        toast.error("Could not load that subtitle");
      }
    },
    [contentKey, ensureOverlay, getVideoEl, renderCue]
  );

  // Restore the last used subtitle only for the SAME title/episode.
  useEffect(() => {
    if (!sources.length) return;
    const pref = readPreference();
    if (!pref?.src || pref.src.startsWith("blob:")) return;
    if (pref.key !== contentKey) return;
    applySubtitle({ ...pref, silent: true, persist: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources.length, contentKey]);

  // ---- Auto-hiding custom controls ----------------------------------------

  const hideTimerRef = useRef(null);

  const bumpUi = useCallback(() => {
    setUiVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setUiVisible(false), 3000);
  }, []);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    const events = ["pointermove", "pointerdown", "touchstart", "mousemove"];
    events.forEach((ev) => host.addEventListener(ev, bumpUi, { passive: true }));
    document.addEventListener("keydown", bumpUi);
    bumpUi();
    return () => {
      events.forEach((ev) => host.removeEventListener(ev, bumpUi));
      document.removeEventListener("keydown", bumpUi);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [bumpUi, sources.length, isModalOpen, props.isInline]);

  // Keep it on screen while the subtitle picker is open.
  useEffect(() => {
    if (isSubtitlesModalOpen) {
      setUiVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      bumpUi();
    }
  }, [isSubtitlesModalOpen, bumpUi]);

  const subtitlesModalEl = (
    <SubtitlesModal
      isOpen={isSubtitlesModalOpen}
      onClose={() => setIsSubtitlesModalOpen(false)}
      onSelect={applySubtitle}
      onClear={() => clearSubtitles(true)}
      activeSubtitleName={activeSubtitleName}
      autoQuery={subtitleTitle}
      seasonNumber={props.seasonNumber}
      episodeNumber={props.episodeNumber}
    />
  );

  const subtitlesButtonEl = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        bumpUi();
        setIsSubtitlesModalOpen(true);
      }}
      title="Subtitles"
      className={`absolute z-40 top-3 left-3 flex items-center gap-2 rounded-full px-3 py-2 text-xs text-white backdrop-blur-md transition-opacity duration-300 hover:bg-black/80 ${
        activeSubtitleName ? "bg-primaryBtn/90" : "bg-black/60"
      } ${uiVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <MdSubtitles className="text-lg" />
      <span className="hidden sm:inline">
        {activeSubtitleName ? "Subtitles on" : "Subtitles"}
      </span>
    </button>
  );

  // Rendered inside the .plyr element (portal) so it also shows in fullscreen.
  const subtitlesButton = uiLayer
    ? createPortal(
        <>
          {subtitlesButtonEl}
          {subtitlesModalEl}
        </>,
        uiLayer
      )
    : null;

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
      bumpUi();
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
  }, [bumpUi]);

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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
