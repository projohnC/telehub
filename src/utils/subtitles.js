// Subtitle (caption) helpers: SRT -> WebVTT conversion and track building.

const TIME_RE = /(\d{1,2}:\d{2}:\d{2})[,.](\d{1,3})/g;

/** Convert an SRT string to a valid WebVTT string. */
export function srtToVtt(srtText) {
  const body = String(srtText)
    .replace(/\r\n|\r/g, "\n")
    .replace(/^\uFEFF/, "")
    .replace(TIME_RE, (_m, hms, ms) => `${hms}.${ms.padEnd(3, "0")}`);

  return `WEBVTT\n\n${body.trim()}\n`;
}

/** True when the text already looks like WebVTT. */
export function isVtt(text) {
  return /^\uFEFF?WEBVTT/.test(String(text).trim());
}

/** Turn raw subtitle text (SRT or VTT) into an object URL usable by <track>. */
export function subtitleTextToUrl(text) {
  const vtt = isVtt(text) ? String(text) : srtToVtt(text);
  return URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
}

/** Read a File/Blob picked by the user and return a VTT object URL. */
export function fileToSubtitleUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(subtitleTextToUrl(reader.result));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Fetch a remote subtitle file and return a VTT object URL.
 * Falls back to the original URL if it is already .vtt and cannot be fetched.
 */
export async function remoteSubtitleToUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return subtitleTextToUrl(await res.text());
  } catch {
    return url;
  }
}

/**
 * Normalize a subtitle entry coming from the API into a Plyr track object.
 * Accepts { url|src|file, label|name|title, language|lang|srclang, default }.
 */
export function toTrack(entry, index = 0) {
  if (!entry) return null;
  const src = entry.url || entry.src || entry.file;
  if (!src) return null;

  return {
    kind: "captions",
    label: entry.label || entry.name || entry.title || `Subtitle ${index + 1}`,
    srcLang: entry.language || entry.lang || entry.srclang || "en",
    src,
    default: Boolean(entry.default) || index === 0,
  };
}

/** Build Plyr tracks from an API subtitle list, converting SRT files as needed. */
export async function buildTracks(list) {
  if (!Array.isArray(list) || list.length === 0) return [];

  const tracks = await Promise.all(
    list.map(async (entry, index) => {
      const track = toTrack(entry, index);
      if (!track) return null;
      if (/\.srt(\?|$)/i.test(track.src)) {
        track.src = await remoteSubtitleToUrl(track.src);
      }
      return track;
    })
  );

  return tracks.filter(Boolean);
}
