// OpenSubtitles (strem.io v3) listing proxy.
export default async function handler(req, res) {
  try {
    const imdbId = (req.query?.imdbId || "").toString().trim();
    const season = (req.query?.season || "").toString().trim();
    const episode = (req.query?.episode || "").toString().trim();

    if (!imdbId) {
      res.status(200).json({ subtitles: [] });
      return;
    }

    const targetUrl =
      season && episode
        ? `https://opensubtitles-v3.strem.io/subtitles/series/${encodeURIComponent(
            imdbId
          )}:${encodeURIComponent(season)}:${encodeURIComponent(episode)}.json`
        : `https://opensubtitles-v3.strem.io/subtitles/movie/${encodeURIComponent(
            imdbId
          )}.json`;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      res.status(200).json({ subtitles: [] });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Subtitle Fetch Error:", error);
    res.status(500).json({ error: error.message, subtitles: [] });
  }
}
