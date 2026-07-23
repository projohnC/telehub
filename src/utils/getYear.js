// src/utils/getYear.js
// Returns a 4-digit year string from any of the common date fields.
// Anime items usually don't have `release_year` — they have `first_air_date`,
// `release_date`, `first_aired`, `air_date`, etc. Use this helper everywhere
// so anime cards show the year just like movies/series.
export function getYear(item) {
  if (!item) return "";
  if (item.release_year) return String(item.release_year);
  const candidates = [
    item.release_date,
    item.first_air_date,
    item.first_aired,
    item.air_date,
    item.aired,
    item.start_date,
    item.premiered,
    item.date,
  ];
  for (const d of candidates) {
    if (!d) continue;
    const m = String(d).match(/\d{4}/);
    if (m) return m[0];
  }
  return "";
}
