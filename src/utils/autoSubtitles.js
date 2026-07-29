// Automatic subtitle fetching using TMDB / IMDB ids.
// Uses the free Wyzie Subs API (OpenSubtitles mirror) which accepts either
// a TMDB id or an IMDB id and returns ready-to-use subtitle files.

import { remoteSubtitleToUrl } from "./subtitles";

const WYZIE = "https://sub.wyzie.ru/search";
const TMDB_API = "https://api.themoviedb.org/3";

/** Pick a TMDB / IMDB id out of a media object coming from the backend. */
export function extractIds(media) {
  if (!media || typeof media !== "object") return {};
  const imdb =
    media.imdb_id || media.imdbId || media.imdb || media.external_ids?.imdb_id;
  const tmdb =
    media.tmdb_id || media.tmdbId || media.tmdb || media.movie_id || media.id;

  return {
    imdbId: typeof imdb === "string" && /^tt\d+$/.test(imdb) ? imdb : undefined,
    tmdbId: tmdb !== undefined && tmdb !== null && `${tmdb}`.match(/^\d+$/)
      ? `${tmdb}`
      : undefined,
  };
}

/** Optional: resolve an IMDB id from TMDB when an API key is configured. */
async function resolveImdbId(tmdbId, mediaType) {
  const key = import.meta.env.VITE_TMDB_API_KEY;
  if (!key || !tmdbId) return undefined;
  try {
    const path = mediaType === "episode" ? "tv" : "movie";
    const res = await fetch(
      `${TMDB_API}/${path}/${tmdbId}/external_ids?api_key=${key}`
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.imdb_id || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Fetch English subtitles for a title.
 * @param {object} opts
 * @param {string} [opts.imdbId]  - e.g. "tt1375666"
 * @param {string} [opts.tmdbId]  - e.g. "27205"
 * @param {number} [opts.season]
 * @param {number} [opts.episode]
 * @param {string} [opts.language="en"]
 * @returns {Promise<Array>} Plyr track objects
 */
export async function fetchAutoSubtitles({
  imdbId,
  tmdbId,
  season,
  episode,
  language = "en",
  limit = 3,
} = {}) {
  const id = imdbId || tmdbId;
  if (!id) return [];

  const params = new URLSearchParams({ id: String(id), language, format: "srt" });
  if (season !== undefined && season !== null) params.set("season", String(season));
  if (episode !== undefined && episode !== null) params.set("episode", String(episode));

  let list = [];
  try {
    const res = await fetch(`${WYZIE}?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    list = Array.isArray(data) ? data : [];
  } catch {
    return [];
  }

  const picked = list
    .filter((s) => s && s.url)
    .sort((a, b) => (b.encoding === "utf-8" ? 1 : 0) - (a.encoding === "utf-8" ? 1 : 0))
    .slice(0, limit);

  const tracks = await Promise.all(
    picked.map(async (s, index) => ({
      kind: "captions",
      label: `${s.display || "English"}${picked.length > 1 ? ` ${index + 1}` : ""} (auto)`,
      srcLang: s.language || language,
      src: await remoteSubtitleToUrl(s.url),
      default: index === 0,
    }))
  );

  return tracks;
}

/**
 * Convenience wrapper: derive ids from the media object (falling back to a
 * TMDB -> IMDB lookup) and return English tracks.
 */
export async function autoSubtitlesForMedia(media, {
  mediaType = "movie",
  season,
  episode,
  language = "en",
} = {}) {
  const { imdbId, tmdbId } = extractIds(media);
  const resolvedImdb = imdbId || (await resolveImdbId(tmdbId, mediaType));
  return fetchAutoSubtitles({
    imdbId: resolvedImdb,
    tmdbId,
    season,
    episode,
    language,
  });
}
