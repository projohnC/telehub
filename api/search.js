// IMDb title suggestion proxy (used by the subtitle finder).
export default async function handler(req, res) {
  try {
    const query = (req.query?.q || "").toString().trim();

    if (!query) {
      res.status(200).json({ d: [] });
      return;
    }

    const firstChar = query.toLowerCase().charAt(0);
    const targetUrl = `https://v3.sg.media-imdb.com/suggestion/${firstChar}/${encodeURIComponent(
      query
    )}.json`;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      res.status(200).json({ d: [] });
      return;
    }

    const data = await response.json();
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).json(data);
  } catch (error) {
    console.error("IMDb Suggest Error:", error);
    res.status(500).json({ error: error.message, d: [] });
  }
}
