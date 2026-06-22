// dmaz alyxers - media extraction serverless function
// Uses btch-downloader to resolve direct media links from social platforms.
const btch = require("btch-downloader");

// Map a platform key -> handler function from btch-downloader
const HANDLERS = {
  tiktok: btch.ttdl,
  youtube: btch.youtube,
  facebook: btch.fbdown,
  instagram: btch.igdl,
  capcut: btch.capcut,
  twitter: btch.twitter,
  pinterest: btch.pinterest,
  douyin: btch.douyin,
  threads: btch.threads,
  spotify: btch.spotify,
  soundcloud: btch.soundcloud,
};

// Guess the platform from a URL when the user picks "Auto".
function detectPlatform(url) {
  const u = url.toLowerCase();
  if (/tiktok\.com|vt\.tiktok|vm\.tiktok/.test(u)) return "tiktok";
  if (/youtube\.com|youtu\.be/.test(u)) return "youtube";
  if (/facebook\.com|fb\.watch|fb\.me/.test(u)) return "facebook";
  if (/instagram\.com|instagr\.am/.test(u)) return "instagram";
  if (/capcut\.com/.test(u)) return "capcut";
  if (/twitter\.com|x\.com|t\.co/.test(u)) return "twitter";
  if (/pinterest\.|pin\.it/.test(u)) return "pinterest";
  if (/douyin\.com/.test(u)) return "douyin";
  if (/threads\.net/.test(u)) return "threads";
  if (/spotify\.com/.test(u)) return "spotify";
  if (/soundcloud\.com/.test(u)) return "soundcloud";
  return "auto";
}

const VIDEO_EXT = /\.(mp4|mov|webm|mkv|m3u8)(\?|$)/i;
const AUDIO_EXT = /\.(mp3|m4a|aac|ogg|wav|opus)(\?|$)/i;
const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i;

function kindFromKey(key, url) {
  const k = (key || "").toLowerCase();
  if (AUDIO_EXT.test(url) || /(mp3|audio|music|sound)/.test(k)) return "audio";
  if (IMAGE_EXT.test(url) || /(thumb|image|cover|photo|picture)/.test(k)) return "image";
  if (VIDEO_EXT.test(url) || /(mp4|video|hd|sd|sound_quality|nowatermark|no_watermark|play|hdplay)/.test(k))
    return "video";
  if (/(url|link|download|dl)/.test(k)) return "video";
  return "video";
}

function prettyLabel(key, kind) {
  const map = {
    hdplay: "Video HD (no watermark)",
    play: "Video (no watermark)",
    wmplay: "Video (watermark)",
    nowatermark: "Video (no watermark)",
    no_watermark: "Video (no watermark)",
    nowatermark_hd: "Video HD (no watermark)",
    normal_video: "Video SD",
    hd: "Video HD",
    sd: "Video SD",
    mp4: "Video MP4",
    mp3: "Audio MP3",
    music: "Audio MP3",
    audio: "Audio",
  };
  const k = (key || "").toLowerCase();
  if (map[k]) return map[k];
  if (kind === "audio") return "Audio MP3";
  if (kind === "image") return "Image";
  if (kind === "video") return "Video";
  return key || "Download";
}

// Recursively walk any JSON returned by btch-downloader and collect media links.
function collectMedia(node, results, keyHint, depth = 0) {
  if (node == null || depth > 6) return;

  if (typeof node === "string") {
    if (/^https?:\/\//i.test(node) && !/^https?:\/\/\S*\.(html|php)$/i.test(node)) {
      const kind = kindFromKey(keyHint, node);
      results.push({ label: prettyLabel(keyHint, kind), url: node, kind });
    }
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((item) => collectMedia(item, results, keyHint, depth + 1));
    return;
  }

  if (typeof node === "object") {
    for (const [key, val] of Object.entries(node)) {
      collectMedia(val, results, key, depth + 1);
    }
  }
}

function extractMeta(data) {
  const meta = { title: null, thumbnail: null, author: null };
  const scan = (obj, d = 0) => {
    if (!obj || typeof obj !== "object" || d > 4) return;
    for (const [k, v] of Object.entries(obj)) {
      const key = k.toLowerCase();
      if (typeof v === "string") {
        if (!meta.title && /(title|caption|desc)/.test(key) && v.length > 1) meta.title = v;
        if (!meta.thumbnail && /(thumb|cover|image)/.test(key) && /^https?:/.test(v)) meta.thumbnail = v;
        if (!meta.author && /(author|nickname|username|owner|creator)/.test(key)) meta.author = v;
      } else if (typeof v === "object") {
        scan(v, d + 1);
      }
    }
  };
  scan(data);
  return meta;
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });
}

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let url, platform;
  try {
    const body = JSON.parse(event.body || "{}");
    url = (body.url || "").trim();
    platform = (body.platform || "auto").toLowerCase();
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  if (!url || !/^https?:\/\//i.test(url)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Masukkan URL yang valid (harus diawali http/https)." }) };
  }

  if (platform === "auto") platform = detectPlatform(url);

  // Build the list of handlers to try (chosen platform first, then aio fallback).
  const order = [];
  if (HANDLERS[platform]) order.push([platform, HANDLERS[platform]]);
  order.push(["aio", btch.aio]);

  let lastError = null;
  for (const [name, fn] of order) {
    try {
      const data = await fn(url);
      const media = [];
      collectMedia(data, media);
      const cleaned = dedupe(media);
      if (cleaned.length > 0) {
        const meta = extractMeta(data);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            platform: platform === "auto" ? name : platform,
            resolver: name,
            title: meta.title,
            thumbnail: meta.thumbnail,
            author: meta.author,
            media: cleaned,
          }),
        };
      }
      lastError = "Tidak ada media yang ditemukan dari link ini.";
    } catch (e) {
      lastError = e && e.message ? e.message : "Gagal memproses link.";
    }
  }

  return {
    statusCode: 502,
    headers,
    body: JSON.stringify({
      success: false,
      error: "Tidak dapat mengambil media. " + (lastError || "") + " Coba platform lain atau periksa apakah video bersifat publik.",
    }),
  };
};
