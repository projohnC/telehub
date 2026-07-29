/**
 * Converts a string into a clean, URL-safe slug.
 */
export const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word chars, non-space, non-hyphen
    .replace(/[\s_-]+/g, "-")  // replace spaces, underscores, and hyphens with a single hyphen
    .replace(/^-+|-+$/g, "");   // trim leading/trailing hyphens
};

/**
 * Generates the specific slug required by the HubStream backend.
 * @param {object} media - The media item (movie or show metadata).
 * @param {string} type - The media type ("movie", "series", "anime", "tvshow", etc.).
 * @param {number} currentSeason - Current active season number (defaults to 1).
 */
export const getMediaSlug = (media, type, currentSeason = 1) => {
  if (!media) return "";
  const title = media.title || "";
  const titleSlug = slugify(title);

  // Determine media type
  const isMovie = type === "movie" || media.media_type === "movie";
  const isAnime = media.is_anime === true;

  if (isMovie) {
    const year = media.release_year || media.year || new Date().getFullYear();
    return `${titleSlug}-${year}-hindi-full-movie`;
  } else if (isAnime) {
    return `${titleSlug}-season-${currentSeason}-hindi-full-anime`;
  } else {
    return `${titleSlug}-season-${currentSeason}-hindi-full-series`;
  }
};
