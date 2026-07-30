// Downloads a remote subtitle file (SRT/VTT) and returns valid WebVTT.
export default async function handler(req, res) {
  try {
    const subtitleUrl = (req.query?.url || "").toString();
    const encoding = (req.query?.encoding || "utf-8").toString();

    if (!subtitleUrl) {
      res.status(400).send("Missing subtitle URL");
      return;
    }

    const response = await fetch(subtitleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      res.status(response.status).send("Failed to fetch subtitle");
      return;
    }

    const arrayBuffer = await response.arrayBuffer();

    let decoder;
    try {
      decoder = new TextDecoder(encoding);
    } catch (e) {
      decoder = new TextDecoder("utf-8");
    }

    let vttText = decoder.decode(arrayBuffer);

    // Normalize newlines and strip BOM.
    vttText = vttText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (vttText.charCodeAt(0) === 0xfeff) {
      vttText = vttText.slice(1);
    }

    // Convert SRT to WebVTT when needed.
    if (!vttText.trim().startsWith("WEBVTT")) {
      vttText = vttText.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
      vttText = `WEBVTT\n\n${vttText}`;
    }

    res.setHeader("Content-Type", "text/vtt; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.status(200).send(vttText);
  } catch (error) {
    console.error("Subtitle Download/Convert Error:", error);
    res.status(500).send(`Error: ${error.message}`);
  }
}
