import { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { AiOutlineSearch, AiOutlineArrowLeft, AiOutlineCloudUpload } from "react-icons/ai";
import { MdSubtitles, MdLink } from "react-icons/md";
import { toast } from "react-toastify";

import {
  cleanTitleForSearch,
  fetchSubtitlesList,
  isSeriesItem,
  proxiedSubtitleUrl,
  searchTitles,
} from "../utils/subtitles";

const TABS = [
  { key: "search", label: "Search", icon: <AiOutlineSearch /> },
  { key: "upload", label: "Upload", icon: <AiOutlineCloudUpload /> },
  { key: "url", label: "URL", icon: <MdLink /> },
];

export default function SubtitlesModal({
  isOpen,
  onClose,
  onSelect,
  onClear,
  activeSubtitleName,
  autoQuery = "",
  seasonNumber,
  episodeNumber,
}) {
  const [tab, setTab] = useState("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [season, setSeason] = useState(seasonNumber ? String(seasonNumber) : "1");
  const [episode, setEpisode] = useState(episodeNumber ? String(episodeNumber) : "1");
  const [subtitles, setSubtitles] = useState([]);
  const [language, setLanguage] = useState("all");
  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef(null);
  const autoRanRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    setQuery((prev) => prev || cleanTitleForSearch(autoQuery));
    if (seasonNumber) setSeason(String(seasonNumber));
    if (episodeNumber) setEpisode(String(episodeNumber));
  }, [isOpen, autoQuery, seasonNumber, episodeNumber]);

  const runSearch = async (rawQuery) => {
    const q = (rawQuery ?? query).trim();
    if (!q) {
      toast.warn("Enter a movie or series name");
      return;
    }
    setLoading(true);
    setSelectedItem(null);
    setSubtitles([]);
    try {
      const found = await searchTitles(q);
      setResults(found);
      if (!found.length) toast.warn("No titles found");
    } catch (e) {
      toast.error("Could not search titles");
    } finally {
      setLoading(false);
    }
  };

  // Auto-search once when opened with a known title.
  useEffect(() => {
    if (!isOpen) {
      autoRanRef.current = false;
      return;
    }
    if (autoRanRef.current) return;
    const q = cleanTitleForSearch(autoQuery);
    if (!q) return;
    autoRanRef.current = true;
    runSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoQuery]);

  const loadSubtitles = async (item, forceSeries = null) => {
    const series = forceSeries === null ? isSeriesItem(item) : forceSeries;
    setLoading(true);
    setSubtitles([]);
    try {
      const list = await fetchSubtitlesList(
        item.id,
        series ? season : "",
        series ? episode : ""
      );
      setSubtitles(list);
      if (!list.length) toast.warn("No subtitles found for this selection");
    } catch (e) {
      toast.error("Could not load subtitles");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSubtitles([]);
    if (!isSeriesItem(item)) loadSubtitles(item, false);
  };

  const handleUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      let content = String(e.target.result || "");
      content = content.replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
      if (!content.trim().startsWith("WEBVTT")) {
        content = `WEBVTT\n\n${content.replace(
          /(\d{2}:\d{2}:\d{2}),(\d{3})/g,
          "$1.$2"
        )}`;
      }
      const blobUrl = URL.createObjectURL(
        new Blob([content], { type: "text/vtt" })
      );
      onSelect({
        src: blobUrl,
        label: file.name.replace(/\.[^/.]+$/, ""),
        lang: "local",
        persist: false,
      });
    };
    reader.onerror = () => toast.error("Could not read subtitle file");
    reader.readAsText(file);
  };

  const languages = Array.from(new Set(subtitles.map((s) => s.lang))).sort();
  const visibleSubtitles = subtitles.filter(
    (s) => language === "all" || s.lang === language
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop="blur"
      size="2xl"
      scrollBehavior="inside"
      className="bg-bgColorSecondary/95 text-primaryTextColor"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <MdSubtitles className="text-2xl" />
          <span>Subtitles</span>
        </ModalHeader>
        <ModalBody className="pb-6">
          {activeSubtitleName && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-2 text-sm">
              <span className="truncate">Active: {activeSubtitleName}</span>
              <Button size="sm" variant="flat" color="danger" onPress={onClear}>
                Turn off
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  tab === t.key
                    ? "bg-primaryBtn text-white"
                    : "bg-white/5 text-secondaryTextColor hover:bg-white/10"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {tab === "search" && !selectedItem && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  placeholder="Search movie or series title..."
                  className="w-full rounded-xl bg-white/5 px-4 py-2 text-sm outline-none placeholder:text-secondaryTextColor"
                />
                <Button
                  isIconOnly
                  className="bg-primaryBtn text-white"
                  onPress={() => runSearch()}
                  isDisabled={loading}
                >
                  <AiOutlineSearch />
                </Button>
              </div>

              {loading && (
                <div className="flex justify-center py-8">
                  <Spinner color="danger" />
                </div>
              )}

              {!loading &&
                results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-2 text-left transition hover:bg-white/10"
                  >
                    {item.i?.imageUrl && (
                      <img
                        src={item.i.imageUrl}
                        alt={item.l}
                        className="h-16 w-12 rounded-md object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.l}</p>
                      <p className="text-xs text-secondaryTextColor">
                        {item.y || "—"} • {item.q || "movie"}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          )}

          {tab === "search" && selectedItem && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setSubtitles([]);
                }}
                className="flex w-fit items-center gap-2 text-sm text-secondaryTextColor hover:text-primaryTextColor"
              >
                <AiOutlineArrowLeft /> Back to results
              </button>

              <p className="text-sm font-semibold">{selectedItem.l}</p>

              {isSeriesItem(selectedItem) && (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-secondaryTextColor">Season</label>
                    <input
                      type="number"
                      min="1"
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-secondaryTextColor">Episode</label>
                    <input
                      type="number"
                      min="1"
                      value={episode}
                      onChange={(e) => setEpisode(e.target.value)}
                      className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <Button
                    className="bg-primaryBtn text-white"
                    onPress={() => loadSubtitles(selectedItem, true)}
                    isDisabled={loading}
                  >
                    Find
                  </Button>
                </div>
              )}

              {loading && (
                <div className="flex justify-center py-8">
                  <Spinner color="danger" />
                </div>
              )}

              {!loading && languages.length > 1 && (
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-xl bg-white/5 px-3 py-2 text-sm outline-none"
                >
                  <option value="all">All languages ({subtitles.length})</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              )}

              {!loading &&
                visibleSubtitles.map((sub, index) => (
                  <button
                    key={`${sub.id || sub.url}-${index}`}
                    onClick={() =>
                      onSelect({
                        src: proxiedSubtitleUrl(sub.url),
                        label: `${selectedItem.l} — ${sub.lang}`,
                        lang: sub.lang || "en",
                      })
                    }
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-2 text-left text-sm transition hover:bg-white/10"
                  >
                    <span className="truncate">
                      {sub.lang?.toUpperCase() || "SUB"} • {sub.id || `Track ${index + 1}`}
                    </span>
                    <span className="text-xs text-secondaryTextColor">Use</span>
                  </button>
                ))}
            </div>
          )}

          {tab === "upload" && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/20 p-8 text-center">
              <AiOutlineCloudUpload className="text-4xl text-secondaryTextColor" />
              <p className="text-sm text-secondaryTextColor">
                Upload an .srt or .vtt file from your device
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".srt,.vtt,.txt"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files?.[0])}
              />
              <Button
                className="bg-primaryBtn text-white"
                onPress={() => fileInputRef.current?.click()}
              >
                Choose file
              </Button>
            </div>
          )}

          {tab === "url" && (
            <div className="flex flex-col gap-3">
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/subtitle.srt"
                className="w-full rounded-xl bg-white/5 px-4 py-2 text-sm outline-none placeholder:text-secondaryTextColor"
              />
              <Button
                className="bg-primaryBtn text-white"
                onPress={() => {
                  const value = customUrl.trim();
                  if (!value) {
                    toast.warn("Paste a subtitle URL first");
                    return;
                  }
                  onSelect({
                    src: proxiedSubtitleUrl(value),
                    label: "Custom subtitle",
                    lang: "en",
                  });
                }}
              >
                Load subtitle
              </Button>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
