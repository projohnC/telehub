import { AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  listSubtitles,
  groupByLanguage,
  getSubtitleVttUrl,
} from "../utils/subdl";

// Preferred subtitle languages (SubDL uppercase codes). Adjust as you like.
const DEFAULT_LANGS = ["EN", "AR", "ES", "FR", "DE", "PT", "IT", "TR", "HI"];

export default function WatchTrailer(props) {
  const [sources, setSources] = useState([]);
  const [poster, setPoster] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const BASE = import.meta.env.VITE_BASE_URL;

  // Subtitles state
  const [subGroups, setSubGroups] = useState([]); // [{code,name,items:[]}]
  const [tracks, setTracks] = useState([]); // [{kind,label,srclang,src,default?}]
  const [activeLang, setActiveLang] = useState(null);
  const [subsLoading, setSubsLoading] = useState(false);

  const playerRef = useRef(null);
  const location = useLocation();

  // Extract TMDB id + type + season/episode from props (or props.tmdbId override)
  const subQuery = useMemo(() => {
    const p = props || {};
    const tmdbId =
      p.tmdbId ||
      p.id?.tmdb_id ||
      p.id?.tmdbId ||
      p.id?.tmdb ||
      p.id?.id ||
      null;
    if (!tmdbId) return null;
    if (p.popUpType === "episode") {
      return {
        tmdbId,
        type: "tv",
        season: p.seasonNumber,
        episode: p.episodeNumber,
      };
    }
    if (p.popUpType === "movie") return { tmdbId, type: "movie" };
    return null; // trailer or unknown -> no subs
  }, [
    props.id,
    props.popUpType,
    props.seasonNumber,
    props.episodeNumber,
    props.tmdbId,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (
        props.isWatchMoviePopupOpen ||
        props.isWatchEpisodePopupOpen ||
        props.isInline
      ) {
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
              (s) => s.season_number === props.seasonNumber
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
          if (!props.isInline) setIsModalOpen(true);
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

  // Fetch subtitles once we know the TMDB id + type
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setSubGroups([]);
      setTracks([]);
      setActiveLang(null);
      if (!subQuery) return;
      setSubsLoading(true);
      try {
        const subs = await listSubtitles({
          ...subQuery,
          languages: DEFAULT_LANGS,
        });
        if (cancelled) return;
        const groups = groupByLanguage(subs);
        setSubGroups(groups);
        // Auto-select the first available language so the CC option is
        // immediately visible after an episode change.
        if (groups.length > 0) {
          const preferred =
            groups.find((g) => g.code === "EN") || groups[0];
          const vttUrl = await getSubtitleVttUrl(preferred.items[0]);
          if (!cancelled && vttUrl) {
            setActiveLang(preferred.code);
            setTracks([
              {
                kind: "captions",
                label: preferred.name || preferred.code,
                srclang: preferred.code.toLowerCase(),
                src: vttUrl,
                default: true,
              },
            ]);
          }
        }
      } catch (e) {
        console.error("[subdl] fetch failed", e);
      } finally {
        if (!cancelled) setSubsLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [subQuery?.tmdbId, subQuery?.type, subQuery?.season, subQuery?.episode]);

  // Select a language -> download + convert -> attach as <track>
  const selectLanguage = async (code) => {
    const group = subGroups.find((g) => g.code === code);
    if (!group) return;
    const first = group.items[0];
    const vttUrl = await getSubtitleVttUrl(first);
    if (!vttUrl) return;
    setActiveLang(code);
    setTracks([
      {
        kind: "captions",
        label: group.name || code,
        srclang: code.toLowerCase(),
        src: vttUrl,
        default: true,
      },
    ]);
  };

  const plyrProps = {
    source: {
      type: "video",
      sources,
      tracks, // <-- Plyr enables the CC button when tracks are present
    },
    options: {
      poster,
      captions: { active: tracks.length > 0, update: true, language: "auto" },
      settings: ["captions", "quality", "speed"],
      controls: [
        "play-large",
        "rewind",
        "play",
        "fast-forward",
        "progress",
        "current-time",
        "mute",
        "captions",
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
        if (window.screen.orientation && window.screen.orientation.lock) {
          window.screen.orientation.lock("landscape").catch((err) => {
            console.warn("Screen orientation lock failed:", err);
          });
        }
      } else if (
        window.screen.orientation &&
        window.screen.orientation.unlock
      ) {
        window.screen.orientation.unlock();
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

  const closeModal = () => {
    setIsModalOpen(false);
    if (props.popUpType === "trailer") props.setIsTrailerPopupOpen(false);
    else if (props.popUpType === "movie") props.setIsWatchMoviePopupOpen(false);
    else props.setIsWatchEpisodePopupOpen(false);
  };

  // Force Plyr to remount when the episode/season changes so that the
  // captions menu is rebuilt with the newly-loaded <track>.
  const playerKey = `${subQuery?.tmdbId || "x"}-${subQuery?.type || "x"}-${
    subQuery?.season ?? "x"
  }-${subQuery?.episode ?? "x"}-${tracks.length}`;

  const SubtitleBar = () => {
    // Only hide the bar for content that has no subtitle support at all
    // (e.g. trailers where subQuery is null).
    if (!subQuery) return null;
    return (
      <div className="flex flex-wrap items-center gap-2 p-2 bg-black/60 text-white text-xs">
        <span className="opacity-70 mr-1">
          {subsLoading
            ? "Loading subtitles…"
            : subGroups.length === 0
            ? "No subtitles found"
            : "Subtitles:"}
        </span>
        <button
          onClick={() => {
            setTracks([]);
            setActiveLang(null);
          }}
          className={`px-2 py-1 rounded ${
            activeLang == null ? "bg-white/20" : "hover:bg-white/10"
          }`}
        >
          Off
        </button>
        {subGroups.map((g) => (
          <button
            key={g.code}
            onClick={() => selectLanguage(g.code)}
            className={`px-2 py-1 rounded ${
              activeLang === g.code ? "bg-white/20" : "hover:bg-white/10"
            }`}
            title={g.name}
          >
            {g.code}
          </button>
        ))}
      </div>
    );
  };

  if (props.isInline) {
    return (
      <div className="w-full h-full bg-black flex flex-col rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex-1 flex items-center justify-center">
          {sources.length > 0 ? (
            <Plyr key={playerKey} ref={playerRef} {...plyrProps} id="player" />
          ) : (
            <div className="loader"></div>
          )}
        </div>
        <SubtitleBar />
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
            <Plyr key={playerKey} ref={playerRef} {...plyrProps} id="player" />
            <SubtitleBar />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
