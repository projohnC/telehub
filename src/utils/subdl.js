// src/utils/subdl.js
// SubDL subtitle fetcher: TMDB ID -> subtitles list -> download SRT -> VTT blob URL
// Docs: https://subdl.com/apidoc
// No external deps: ZIPs are parsed with a tiny inline reader that uses the
// browser-native DecompressionStream('deflate-raw') for DEFLATE entries.

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
 * Minimal ZIP reader: scans local file headers, finds the first .srt/.vtt
 * entry, and decompresses it. Supports stored (0) and deflate (8) methods
 * using the browser-native DecompressionStream('deflate-raw').
 * @param {ArrayBuffer} buf
 * @returns {Promise<{name:string,text:string}|null>}
 */
async function extractSubtitleFromZip(buf) {
  const bytes = new Uint8Array(buf);
  const dv = new DataView(buf);
  const td = new TextDecoder("utf-8");
  let off = 0;
  while (off + 30 <= bytes.length) {
    const sig = dv.getUint32(off, true);
    if (sig !== 0x04034b50) break; // not a local file header -> done
    const method = dv.getUint16(off + 8, true);
    const compSize = dv.getUint32(off + 18, true);
    const nameLen = dv.getUint16(off + 26, true);
    const extraLen = dv.getUint16(off + 28, true);
    const nameStart = off + 30;
    const dataStart = nameStart + nameLen + extraLen;
    const name = td.decode(bytes.subarray(nameStart, nameStart + nameLen));
    const dataEnd = dataStart + compSize;
    if (/\.(srt|vtt)$/i.test(name) && !name.endsWith("/")) {
      const chunk = bytes.subarray(dataStart, dataEnd);
      let outBuf;
      if (method === 0) {
        outBuf = chunk;
      } else if (method === 8) {
        // deflate-raw: no zlib header, matches ZIP's raw DEFLATE stream
        const ds = new DecompressionStream("deflate-raw");
        const stream = new Blob([chunk]).stream().pipeThrough(ds);
        outBuf = new Uint8Array(await new Response(stream).arrayBuffer());
      } else {
        off = dataEnd;
        continue;
      }
      return { name, text: td.decode(outBuf) };
    }
    off = dataEnd;
  }
  return null;
}

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
      const entry = await extractSubtitleFromZip(buf);
      if (!entry) throw new Error("No .srt/.vtt file inside archive");
      srtText = entry.text;
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
