// Subtitle helpers: IMDb lookup, OpenSubtitles listing, VTT parsing & storage.

const SERIES_QIDS = ["tvSeries", "tvMiniSeries", "tvSpecial", "tvShort"];

export const isSeriesItem = (item) =>
  !!item &&
  (SERIES_QIDS.includes(item.qid) ||
    (typeof item.q === "string" && item.q.toLowerCase().includes("series")));

export const cleanTitleForSearch = (title = "") =>
  title
    .replace(/\.(mkv|mp4|avi|mov|m4v|webm|flv|wmv|ts|m3u8|srt|vtt)$/i, " ")
    .replace(/[._]+/g, " ")
    .replace(/\b(1080p|720p|480p|2160p|4k|hdrip|webrip|web-dl|bluray|brrip|dvdrip|x264|x265|hevc|aac|hindi|dual audio)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const searchTitles = async (query) => {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Title search failed");
  const data = await res.json();
  return Array.isArray(data.d) ? data.d : [];
};

export const fetchSubtitlesList = async (imdbId, season, episode) => {
  let url = `/api/subtitles?imdbId=${encodeURIComponent(imdbId)}`;
  if (season && episode) {
    url += `&season=${encodeURIComponent(season)}&episode=${encodeURIComponent(episode)}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("Subtitle lookup failed");
  const data = await res.json();
  return Array.isArray(data.subtitles) ? data.subtitles : [];
};

export const proxiedSubtitleUrl = (url) =>
  `/api/subtitles/download?url=${encodeURIComponent(url)}`;

// ---- VTT parsing -----------------------------------------------------------

const timeToSeconds = (value) => {
  const parts = value.trim().replace(",", ".").split(":");
  if (parts.length === 3) {
    return (
      parseInt(parts[0], 10) * 3600 +
      parseInt(parts[1], 10) * 60 +
      parseFloat(parts[2])
    );
  }
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(parts[0]) || 0;
};

const stripTags = (text) =>
  text
    .replace(/<[^>]+>/g, "")
    .replace(/\{\\[^}]*\}/g, "")
    .trim();

export const parseVtt = (raw = "") => {
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/^\uFEFF/, "");

  const blocks = normalized.split(/\n{2,}/);
  const cues = [];

  blocks.forEach((block) => {
    const lines = block.split("\n").filter((line) => line.trim() !== "");
    if (!lines.length) return;

    const timeLineIndex = lines.findIndex((line) => line.includes("-->"));
    if (timeLineIndex === -1) return;

    const [startRaw, endRaw] = lines[timeLineIndex].split("-->");
    if (!startRaw || !endRaw) return;

    const text = stripTags(lines.slice(timeLineIndex + 1).join("\n"));
    if (!text) return;

    cues.push({
      start: timeToSeconds(startRaw),
      end: timeToSeconds(endRaw.trim().split(/\s+/)[0]),
      text,
    });
  });

  return cues.sort((a, b) => a.start - b.start);
};

export const loadSubtitleCues = async (src) => {
  const res = await fetch(src);
  if (!res.ok) throw new Error("Could not load subtitle file");
  return parseVtt(await res.text());
};

export const findCueText = (cues, time) => {
  if (!cues || !cues.length) return "";
  const cue = cues.find((c) => time >= c.start && time <= c.end);
  return cue ? cue.text : "";
};

// ---- Preference persistence ------------------------------------------------

const STORAGE_KEY = "subtitlePreference";

export const savePreference = (pref) => {
  try {
    if (!pref) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
  } catch (e) {
    /* storage unavailable */
  }
};

export const readPreference = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};
