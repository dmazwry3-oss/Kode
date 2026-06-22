// dmaz alyxers - YouTube search serverless function
// Uses btch-downloader's yts() to search YouTube by keyword.
const btch = require("btch-downloader");

function normalizeResults(data) {
  // yts returns { result: { all: [...] } } or sometimes an array.
  let list = [];
  if (Array.isArray(data)) list = data;
  else if (data && data.result && Array.isArray(data.result.all)) list = data.result.all;
  else if (data && data.result && Array.isArray(data.result.video)) list = data.result.video;
  else if (data && Array.isArray(data.videos)) list = data.videos;
  else if (data && data.result && Array.isArray(data.result)) list = data.result;

  return list
    .filter((it) => it && (it.url || it.videoId))
    .map((it) => ({
      title: it.title || "Tanpa judul",
      url: it.url || ("https://youtube.com/watch?v=" + it.videoId),
      videoId: it.videoId || null,
      thumbnail: it.thumbnail || it.image || null,
      duration: (it.duration && it.duration.timestamp) || it.timestamp || null,
      views: it.views || null,
      ago: it.ago || null,
      author: (it.author && it.author.name) || null,
    }))
    .slice(0, 24);
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

  let query;
  try {
    const body = JSON.parse(event.body || "{}");
    query = (body.query || "").trim();
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  if (!query || query.length < 2) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Masukkan kata kunci pencarian." }) };
  }

  try {
    const data = await btch.yts(query);
    const results = normalizeResults(data);
    if (results.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, results: [], message: "Tidak ada hasil ditemukan." }),
      };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, results }) };
  } catch (e) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ success: false, error: (e && e.message) || "Pencarian gagal. Coba lagi." }),
    };
  }
};
