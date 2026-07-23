// scripts/generate-sitemap.js
//
// Auto-generates public/sitemap.xml by pulling every movie / series / anime
// entry from the HubStream API and combining them with the static routes.
//
// Usage:
//   node scripts/generate-sitemap.js
//
// It's also wired into `npm run build` via the "prebuild" script, so every
// production build ships with a fresh sitemap.
//
// Env vars (read from .env / shell / CI):
//   VITE_BASE_URL      – API base, e.g. https://api.hubstream.site
//   SITE_URL           – Public site origin, e.g. https://hubstream.site
//                        (falls back to https://${VITE_SITENAME}.site)
//   VITE_SITENAME      – Used only for the fallback above.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env if present (no dependency needed)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

const BASE = process.env.VITE_BASE_URL;
const SITE =
  process.env.SITE_URL ||
  (process.env.VITE_SITENAME ? `https://${process.env.VITE_SITENAME}.site` : "https://hubstream.site");

if (!BASE) {
  console.warn("[sitemap] VITE_BASE_URL not set – writing static-only sitemap");
}

const PAGE_SIZE = 100;
const MAX_PAGES = 200; // hard safety cap (20k urls per kind)

async function fetchAll(endpoint, listKeys) {
  if (!BASE) return [];
  const out = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${BASE}${endpoint}?sort_by=updated_on:desc&page=${page}&page_size=${PAGE_SIZE}`;
    let json;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[sitemap] ${endpoint} page ${page} -> HTTP ${res.status}`);
        break;
      }
      json = await res.json();
    } catch (err) {
      console.warn(`[sitemap] ${endpoint} page ${page} failed:`, err.message);
      break;
    }
    let items = [];
    for (const k of listKeys) {
      if (Array.isArray(json[k])) { items = json[k]; break; }
    }
    if (!items.length) break;
    out.push(...items);
    const total = json.total_count ?? json.total ?? out.length;
    if (out.length >= total) break;
  }
  return out;
}

function slugify(str) {
  return String(str || "")
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function urlFor(kind, item) {
  const id = item.tmdb_id ?? item.id;
  if (!id) return null;
  const slug = slugify(item.title || item.name);
  const path = slug ? `/${kind}/${id}/${slug}` : `/${kind}/${id}`;
  return `${SITE}${path}`;
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlNode(loc, lastmod, changefreq, priority) {
  const parts = [`    <loc>${xmlEscape(loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) parts.push(`    <priority>${priority}</priority>`);
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

function pickLastmod(item) {
  const raw = item.updated_on || item.updated_at || item.modified_on;
  if (!raw) return "";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

async function main() {
  const staticRoutes = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/Movies", changefreq: "daily", priority: "0.9" },
    { path: "/Series", changefreq: "daily", priority: "0.9" },
    { path: "/Anime",  changefreq: "daily", priority: "0.9" },
  ];

  console.log("[sitemap] fetching movies / series / anime …");
  const [movies, series, anime] = await Promise.all([
    fetchAll("/api/movies", ["movies", "results"]),
    fetchAll("/api/tv",     ["tv_shows", "series", "results"]),
    fetchAll("/api/anime",  ["anime", "results", "tv_shows", "movies"]),
  ]);
  console.log(`[sitemap] movies=${movies.length} series=${series.length} anime=${anime.length}`);

  const nodes = [];
  for (const r of staticRoutes) {
    nodes.push(urlNode(`${SITE}${r.path}`, "", r.changefreq, r.priority));
  }
  for (const m of movies) {
    const u = urlFor("mov", m); if (u) nodes.push(urlNode(u, pickLastmod(m), "weekly", "0.7"));
  }
  for (const s of series) {
    const u = urlFor("ser", s); if (u) nodes.push(urlNode(u, pickLastmod(s), "weekly", "0.7"));
  }
  for (const a of anime) {
    const u = urlFor("ani", a); if (u) nodes.push(urlNode(u, pickLastmod(a), "weekly", "0.7"));
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    nodes.join("\n") +
    `\n</urlset>\n`;

  const publicDir = path.resolve(__dirname, "..", "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const outPath = path.join(publicDir, "sitemap.xml");
  fs.writeFileSync(outPath, xml, "utf8");
  console.log(`[sitemap] wrote ${nodes.length} urls -> ${outPath}`);

  // Also refresh robots.txt with a Sitemap: line (preserving existing rules)
  const robotsPath = path.join(publicDir, "robots.txt");
  const sitemapLine = `Sitemap: ${SITE}/sitemap.xml`;
  let robots = fs.existsSync(robotsPath)
    ? fs.readFileSync(robotsPath, "utf8").replace(/^\s*Sitemap:.*$/gim, "").trim()
    : "User-agent: *\nAllow: /";
  robots = `${robots}\n${sitemapLine}\n`;
  fs.writeFileSync(robotsPath, robots, "utf8");
  console.log(`[sitemap] updated ${robotsPath}`);
}

main().catch((err) => {
  console.error("[sitemap] failed:", err);
  process.exit(1);
});
