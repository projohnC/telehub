// src/utils/subdl.js
// SubDL subtitle fetcher: TMDB ID -> subtitles list -> download SRT -> VTT blob URL
// Docs: https://subdl.com/apidoc
import JSZip from "jszip";

const API_BASE = "https://api.subdl.com/api/v1/subtitles";
const DL_HOST = "https://dl.subdl.com";
// Optional CORS proxy for the zip download. Set VITE_SUBDL_PROXY to a URL
// prefix like "https://your-proxy.example.com/?url=" if the browser blocks
// direct zip downloads from dl.subdl.com.
const PROXY = import.meta.env.VITE_SUBDL_PROXY || "";
const API_KEY = import.meta.env.VITE_SUBDL_API_KEY;

// In-memory caches (per session)
const listCache = new Map(); // key -> [{ id, language, url, release_name, ... }]
const vttCache = new Map(); // subtitle url -> object URL (blob:)

const cacheKey = ({ tmdbId, type, season, episode, languages }) =>
  [tmdbId, type || "movie", season ?? "", episode ?? "", (languages || []).join(",")].join("|");

/**
 * List subtitles from SubDL for a given TMDB id.
 * @param {Object} opts
 * @param {number|string} opts.tmdbId
 * @param {"movie"|"tv"} [opts.type]
 * @param {number} [opts.season]
 * @param {number} [opts.episode]
 * @param {string[]} [opts.languages] - e.g. ["EN","AR","ES"] (SubDL uses uppercase codes)
 * @returns {Promise<Array>}
 */
export async function listSubtitles({
  tmdbId,
  type = "movie",
  season,
  episode,
  languages,
} = {}) {
  if (!tmdbId) return [];
  if (!API_KEY) {
    console.warn("[subdl] VITE_SUBDL_API_KEY is not set");
    return [];
  }

  const key = cacheKey({ tmdbId, type, season, episode, languages });
  if (listCache.has(key)) return listCache.get(key);

  const params = new URLSearchParams({
    api_key: API_KEY,
    tmdb_id: String(tmdbId),
    type,
    subs_per_page: "30",
  });
  if (languages && languages.length) params.set("languages", languages.join(","));
  if (type === "tv") {
    if (season != null) params.set("season_number", String(season));
    if (episode != null) params.set("episode_number", String(episode));
  }

  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) throw new Error(`SubDL API HTTP ${res.status}`);
    const json = await res.json();
    if (!json || json.status === false) {
      console.warn("[subdl] API returned no results:", json?.error || json);
      listCache.set(key, []);
      return [];
    }
    const subs = Array.isArray(json.subtitles) ? json.subtitles : [];
    listCache.set(key, subs);
    return subs;
  } catch (err) {
    console.error("[subdl] listSubtitles failed:", err);
    return [];
  }
}

/**
 * Group subtitles by language (keeps first/best per language).
 */
export function groupByLanguage(subs) {
  const map = new Map();
  for (const s of subs) {
    const code = (s.language || s.lang || "UNK").toUpperCase();
    if (!map.has(code)) map.set(code, { code, name: s.language_name || code, items: [] });
    map.get(code).items.push(s);
  }
  return Array.from(map.values());
}

/**
 * Download a subtitle entry (usually a .zip containing .srt) and return a
 * VTT blob URL suitable for <track src=...>.
 */
export async function getSubtitleVttUrl(subtitle) {
  if (!subtitle?.url) return null;
  if (vttCache.has(subtitle.url)) return vttCache.get(subtitle.url);

  const zipUrl = subtitle.url.startsWith("http")
    ? subtitle.url
    : `${DL_HOST}${subtitle.url}`;
  const finalUrl = PROXY ? `${PROXY}${encodeURIComponent(zipUrl)}` : zipUrl;

  try {
    const res = await fetch(finalUrl);
    if (!res.ok) throw new Error(`Subtitle download HTTP ${res.status}`);
    const buf = await res.arrayBuffer();

    let srtText = null;
    // Sniff zip magic "PK"
    const head = new Uint8Array(buf, 0, Math.min(2, buf.byteLength));
    if (head[0] === 0x50 && head[1] === 0x4b) {
      const zip = await JSZip.loadAsync(buf);
      const entry = Object.values(zip.files).find(
        (f) => !f.dir && /\.(srt|vtt)$/i.test(f.name)
      );
      if (!entry) throw new Error("No .srt/.vtt file inside archive");
      srtText = await entry.async("string");
      if (/\.vtt$/i.test(entry.name)) {
        const blob = new Blob([srtText], { type: "text/vtt" });
        const url = URL.createObjectURL(blob);
        vttCache.set(subtitle.url, url);
        return url;
      }
    } else {
      // Plain text (SRT or VTT)
      srtText = new TextDecoder("utf-8").decode(buf);
    }

    const vtt = srtToVtt(srtText);
    const blob = new Blob([vtt], { type: "text/vtt" });
    const url = URL.createObjectURL(blob);
    vttCache.set(subtitle.url, url);
    return url;
  } catch (err) {
    console.error("[subdl] getSubtitleVttUrl failed:", err);
    return null;
  }
}

/**
 * Convert SRT text to WebVTT.
 */
export function srtToVtt(srt) {
  if (!srt) return "WEBVTT\n\n";
  let text = srt.replace(/^\uFEFF/, "").replace(/\r+/g, "");
  // Replace "HH:MM:SS,mmm" -> "HH:MM:SS.mmm"
  text = text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  // Drop numeric cue indices on their own line
  text = text.replace(/^\d+\s*$\n/gm, "");
  return `WEBVTT\n\n${text.trim()}\n`;
}

/**
 * Clear caches (call when unmounting a session if desired).
 */
export function clearSubdlCache() {
  for (const url of vttCache.values()) URL.revokeObjectURL(url);
  vttCache.clear();
  listCache.clear();
}
