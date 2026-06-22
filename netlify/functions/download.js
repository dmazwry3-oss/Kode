// dmaz alyxers - media extraction serverless function
// Resolves direct media links from social platforms and attaches real file sizes
// so users can pick the lightest option (saves memory / data).
const btch = require("btch-downloader");

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
  if (VIDEO_EXT.test(url) || /(mp4|video|hd|sd|nowatermark|no_watermark|play|hdplay)/.test(k)) return "video";
  if (/(url|link|download|dl)/.test(k)) return "video";
  return "video";
}

// Infer a quality label from the key name.
function qualityFromKey(key) {
  const k = (key || "").toLowerCase();
  if (/hdplay|_hd|hd$|^hd|nowatermark_hd/.test(k)) return "HD";
  if (/normal_video|wmplay|sd|low/.test(k)) return "SD";
  return null;
}

function baseLabel(key, kind) {
  const k = (key || "").toLowerCase();
  if (kind === "audio") return "Audio MP3";
  if (kind === "image") return "Gambar / Thumbnail";
  if (/nowatermark|no_watermark|^play$|hdplay/.test(k)) return "Video tanpa watermark";
  if (/wmplay/.test(k)) return "Video (watermark)";
  return "Video";
}

function collectMedia(node, results, keyHint, depth = 0) {
  if (node == null || depth > 6) return;
  if (typeof node === "string") {
    if (/^https?:\/\//i.test(node) && !/^https?:\/\/\S*\.(html|php)$/i.test(node)) {
      const kind = kindFromKey(keyHint, node);
      results.push({
        label: baseLabel(keyHint, kind),
        url: node,
        kind,
        quality: qualityFromKey(keyHint),
      });
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => collectMedia(item, results, keyHint, depth + 1));
    return;
  }
  if (typeof node === "object") {
    for (const [key, val] of Object.entries(node)) collectMedia(val, results, key, depth + 1);
  }
}

function extractMeta(data) {
  const meta = { title: null, thumbnail: null, author: null };
  const scan = (obj, d = 0) => {
    if (!obj || typeof obj !== "object" || d > 4) return;
    for (const [k, v] of Object.entries(obj)) {
      const key = k.toLowerCase();
      if (typeof v === "string") {
        if (!meta.title && /(^title$|caption|desc)/.test(key) && v.length > 1 && !/audio/.test(key)) meta.title = v;
        if (!meta.thumbnail && /(thumb|cover|^image$)/.test(key) && /^https?:/.test(v)) meta.thumbnail = v;
        if (!meta.author && /(author|nickname|username|owner|creator)/.test(key)) meta.author = v;
      } else if (typeof v === "object") scan(v, d + 1);
    }
  };
  scan(data);
  return meta;
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((it) => (seen.has(it.url) ? false : seen.add(it.url)));
}

function humanSize(bytes) {
  if (bytes == null || isNaN(bytes) || bytes <= 0) return null;
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return (n >= 10 || i === 0 ? Math.round(n) : n.toFixed(1)) + " " + u[i];
}

// Probe the byte size + real content-type of a URL (HEAD, then ranged GET fallback).
async function probe(url) {
  const withTimeout = (ms) => {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), ms);
    return { signal: c.signal, done: () => clearTimeout(t) };
  };
  // HEAD
  try {
    const t = withTimeout(6000);
    const r = await fetch(url, { method: "HEAD", redirect: "follow", signal: t.signal });
    t.done();
    const len = r.headers.get("content-length");
    const ct = r.headers.get("content-type") || "";
    if (len) return { size: Number(len), contentType: ct };
    if (ct) return { size: null, contentType: ct };
  } catch (_) {}
  // Ranged GET fallback
  try {
    const t = withTimeout(6000);
    const r = await fetch(url, { method: "GET", headers: { Range: "bytes=0-1" }, redirect: "follow", signal: t.signal });
    t.done();
    const cr = r.headers.get("content-range");
    const ct = r.headers.get("content-type") || "";
    if (cr && cr.includes("/")) return { size: Number(cr.split("/").pop()), contentType: ct };
    const len = r.headers.get("content-length");
    return { size: len ? Number(len) : null, contentType: ct };
  } catch (_) {
    return { size: null, contentType: "" };
  }
}

function refineKind(item, contentType) {
  const ct = (contentType || "").toLowerCase();
  if (ct.startsWith("audio/")) return "audio";
  if (ct.startsWith("image/")) return "image";
  if (ct.startsWith("video/")) return "video";
  return item.kind;
}

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  let url, platform;
  try {
    const body = JSON.parse(event.body || "{}");
    url = (body.url || "").trim();
    platform = (body.platform || "auto").toLowerCase();
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  if (!url || !/^https?:\/\//i.test(url)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Masukkan URL yang valid (diawali http/https)." }) };
  }

  if (platform === "auto") platform = detectPlatform(url);

  const order = [];
  if (HANDLERS[platform]) order.push([platform, HANDLERS[platform]]);
  if (platform !== "auto") order.push(["aio", btch.aio]);

  let lastError = null;
  for (const [name, fn] of order) {
    try {
      const data = await fn(url);
      if (data && (data.error || data.mess) && (!data.status || data.status === false)) {
        lastError = data.error || data.mess;
        continue;
      }
      const media = [];
      collectMedia(data, media);
      let cleaned = dedupe(media);
      if (cleaned.length === 0) {
        lastError = "Tidak ada media yang ditemukan dari link ini.";
        continue;
      }

      // Probe sizes (cap to avoid long cold-start; media lists are usually small).
      const toProbe = cleaned.slice(0, 10);
      const probes = await Promise.allSettled(toProbe.map((it) => probe(it.url)));
      probes.forEach((p, i) => {
        if (p.status === "fulfilled" && p.value) {
          const { size, contentType } = p.value;
          toProbe[i].size = size != null ? size : null;
          toProbe[i].sizeText = humanSize(size);
          toProbe[i].kind = refineKind(toProbe[i], contentType);
        }
      });

      const meta = extractMeta(data);

      // Sort: video first, then audio, then image. Within video, smallest size first
      // so the "lightest" option is easy to find.
      const rank = { video: 0, audio: 1, image: 2 };
      cleaned.sort((a, b) => {
        const r = (rank[a.kind] ?? 3) - (rank[b.kind] ?? 3);
        if (r !== 0) return r;
        if (a.size != null && b.size != null) return a.size - b.size;
        return 0;
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          platform: name === "aio" ? platform : name,
          title: meta.title,
          thumbnail: meta.thumbnail,
          author: meta.author,
          media: cleaned,
        }),
      };
    } catch (e) {
      lastError = e && e.message ? e.message : "Gagal memproses link.";
    }
  }

  return {
    statusCode: 502,
    headers,
    body: JSON.stringify({
      success: false,
      error: "Tidak dapat mengambil media. " + (lastError || "") + " Coba platform lain atau pastikan video bersifat publik.",
    }),
  };
};
