// src/utils/slug.js
// Build canonical, SEO-friendly URLs like:
//   /ser/329394/My-Daughter's-Father-2026-webrip-hindi-full-series
//   /mov/1487861/Elize-Shadows-of-a-Woman-2026-webrip-hindi-full-movie
//   /ani/12345/Naruto-2002-webrip-japanese-full-series

import { getYear } from "./getYear";

// Keep letters, numbers and apostrophes. Everything else becomes a dash.
// (Matches the sample URLs where apostrophes stay: "Daughter's".)
function titleSlug(title) {
  return String(title || "")
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9']+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pickLanguage(item) {
  const raw =
    (Array.isArray(item?.languages) && item.languages[0]) ||
    item?.language ||
    item?.original_language ||
    "hindi";
  return String(raw).toLowerCase().replace(/[^a-z]/g, "") || "hindi";
}

function pickQuality(item) {
  const raw = item?.quality || item?.print_quality || "webrip";
  return String(raw).toLowerCase().replace(/[^a-z0-9]/g, "") || "webrip";
}

// Returns "mov" | "ser" | "ani"
export function getKind(item) {
  if (item?.is_anime) return "ani";
  if (item?.media_type === "movie") return "mov";
  return "ser";
}

export function getMediaUrl(item) {
  const kind = getKind(item);
  const id = item?.tmdb_id ?? item?.id;
  if (!id) return "/";

  const title = titleSlug(item.title || item.name);
  const year = getYear(item);
  const quality = pickQuality(item);
  const language = pickLanguage(item);
  const suffix = kind === "mov" ? "full-movie" : "full-series";

  const parts = [title, year, quality, language, suffix].filter(Boolean);
  const slug = parts.join("-");

  return slug ? `/${kind}/${id}/${slug}` : `/${kind}/${id}`;
}
