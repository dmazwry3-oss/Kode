// dmaz alyxers - frontend logic
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const form = $("dl-form");
  const urlInput = $("url");
  const platformSelect = $("platform");
  const goBtn = $("go-btn");
  const btnLabel = goBtn.querySelector(".btn-label");
  const spinner = goBtn.querySelector(".spinner");
  const pasteBtn = $("paste-btn");
  const clearBtn = $("clear-btn");
  const qualityHint = $("quality-hint");

  const skeleton = $("skeleton");
  const resultSection = $("result");
  const thumb = $("thumb");
  const platformTag = $("platform-tag");
  const titleEl = $("title");
  const authorEl = $("author");
  const linksEl = $("links");
  const liteBanner = $("lite-banner");
  const alertBox = $("alert");
  const alertText = $("alert-text");

  $("year").textContent = new Date().getFullYear();

  const PLATFORM_EMOJI = {
    tiktok: "🎵", youtube: "▶️", facebook: "📘", instagram: "📸",
    capcut: "✂️", twitter: "𝕏", pinterest: "📌", douyin: "🎶", threads: "🧵",
  };
  const KIND_EMOJI = { video: "🎬", audio: "🎵", image: "🖼️" };

  // ---- helpers ----
  function getRadio(name) {
    const el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  function toggleClear() { clearBtn.hidden = !urlInput.value.trim(); }
  urlInput.addEventListener("input", toggleClear);

  clearBtn.addEventListener("click", () => {
    urlInput.value = "";
    toggleClear();
    urlInput.focus();
  });

  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { urlInput.value = text.trim(); toggleClear(); }
    } catch (_) {}
    urlInput.focus();
  });

  // Update hint text based on the selected quality mode.
  function updateHint() {
    const q = getRadio("quality");
    if (q === "lite") qualityHint.innerHTML = "Mode <strong>Hemat</strong> menyorot file paling kecil supaya tidak memakan memori.";
    else if (q === "hd") qualityHint.innerHTML = "Mode <strong>HD</strong> mengutamakan kualitas tertinggi (ukuran file lebih besar).";
    else qualityHint.innerHTML = "Setiap opsi menampilkan ukuran file aslinya. Pilih sesuai kebutuhanmu.";
  }
  document.querySelectorAll('input[name="quality"]').forEach((r) => r.addEventListener("change", updateHint));
  updateHint();

  function setLoading(loading) {
    goBtn.disabled = loading;
    spinner.hidden = !loading;
    btnLabel.textContent = loading ? "Memproses…" : "Download Sekarang";
    skeleton.hidden = !loading;
    if (loading) { resultSection.hidden = true; alertBox.hidden = true; }
  }

  function showAlert(message) {
    alertText.textContent = message;
    alertBox.hidden = false;
    resultSection.hidden = true;
    skeleton.hidden = true;
  }

  function filterByFormat(media, fmt) {
    if (fmt === "mp4") return media.filter((m) => m.kind === "video" || m.kind === "image");
    if (fmt === "mp3") return media.filter((m) => m.kind === "audio");
    return media;
  }

  // Order media according to the chosen quality mode.
  function applyQualityOrder(media, mode) {
    const arr = media.slice();
    const kindRank = { video: 0, audio: 1, image: 2 };
    arr.sort((a, b) => {
      const kr = (kindRank[a.kind] ?? 3) - (kindRank[b.kind] ?? 3);
      if (kr !== 0) return kr;
      const as = a.size ?? Infinity, bs = b.size ?? Infinity;
      if (mode === "hd") return bs - as;   // biggest (best quality) first
      return as - bs;                       // smallest first (auto + lite)
    });
    return arr;
  }

  // Pick the lightest video (or audio) to recommend in "lite" mode.
  function pickLightest(media) {
    const sized = media.filter((m) => m.size != null && (m.kind === "video" || m.kind === "audio"));
    if (!sized.length) return null;
    return sized.reduce((min, m) => (m.size < min.size ? m : min), sized[0]);
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function renderResult(data, fmt, qmode) {
    alertBox.hidden = true;
    let media = filterByFormat(data.media || [], fmt);
    if (media.length === 0) media = data.media || []; // fallback so user isn't stuck
    if (media.length === 0) { showAlert("Media tidak ditemukan untuk link ini."); return; }

    media = applyQualityOrder(media, qmode);

    // meta
    titleEl.textContent = data.title || "Media siap diunduh";
    authorEl.textContent = data.author ? "oleh " + data.author : "";
    if (data.platform) {
      platformTag.textContent = (PLATFORM_EMOJI[data.platform] || "🌐") + " " + data.platform;
      platformTag.style.display = "";
    } else platformTag.style.display = "none";

    if (data.thumbnail) { thumb.src = data.thumbnail; thumb.parentElement.style.display = ""; }
    else { thumb.removeAttribute("src"); thumb.parentElement.style.display = "none"; }

    // recommended lightest (only highlight in lite mode)
    const lightest = pickLightest(media);
    if (qmode === "lite" && lightest) {
      liteBanner.querySelector("span").textContent =
        "Rekomendasi paling ringan: " + lightest.label + (lightest.sizeText ? " (" + lightest.sizeText + ")" : "");
      liteBanner.hidden = false;
    } else liteBanner.hidden = true;

    // build list
    linksEl.innerHTML = "";
    media.forEach((item) => {
      const kind = item.kind || "video";
      const a = el("a", "dl-link");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("download", "");

      const isRec = qmode === "lite" && lightest && item.url === lightest.url;
      if (isRec) a.classList.add("recommended");

      let badges = "";
      if (item.quality === "HD") badges += '<span class="qbadge hd">HD</span>';
      else if (item.quality === "SD") badges += '<span class="qbadge sd">SD</span>';
      if (isRec) badges += '<span class="qbadge rec">🪶 Paling ringan</span>';

      const sub =
        kind === "audio" ? "Audio saja • ukuran kecil"
        : kind === "image" ? "Gambar / thumbnail"
        : "Video " + (item.quality ? item.quality : "siap unduh");

      a.appendChild(el("span", "dl-icon " + kind, KIND_EMOJI[kind] || "⬇"));
      const body = el("div", "dl-body");
      body.appendChild(el("div", "dl-title", item.label + badges));
      body.appendChild(el("div", "dl-sub", sub));
      a.appendChild(body);
      a.appendChild(el("span", "dl-size", item.sizeText || ""));
      a.appendChild(el("span", "dl-arrow", "↓"));
      linksEl.appendChild(a);
    });

    skeleton.hidden = true;
    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    const fmt = getRadio("format") || "all";
    const qmode = getRadio("quality") || "auto";

    setLoading(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, platform: platformSelect.value }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { showAlert(data.error || "Terjadi kesalahan. Silakan coba lagi."); return; }
      renderResult(data, fmt, qmode);
    } catch (_) {
      showAlert("Gagal terhubung ke server. Periksa koneksi internet dan coba lagi.");
    } finally {
      setLoading(false);
    }
  });
})();
