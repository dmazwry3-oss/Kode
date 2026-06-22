// dmaz alyxers - frontend logic
(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const resultSection = $("result");
  const thumb = $("thumb");
  const titleEl = $("title");
  const authorEl = $("author");
  const linksEl = $("links");
  const alertEl = $("alert");
  const toastEl = $("toast");

  $("year").textContent = new Date().getFullYear();

  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => (toastEl.hidden = true), 300);
    }, 2400);
  }

  function showAlert(message) {
    alertEl.textContent = message;
    alertEl.hidden = false;
    resultSection.hidden = true;
    alertEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function clearAlert() {
    alertEl.hidden = true;
    alertEl.textContent = "";
  }

  function setLoading(btn, loading, idleLabel) {
    const label = btn.querySelector(".btn-label");
    const spin = btn.querySelector(".spinner");
    btn.disabled = loading;
    if (spin) spin.hidden = !loading;
    if (label) label.textContent = loading ? "Memproses…" : idleLabel;
  }

  /* ---------- Tabs ---------- */
  function switchTab(name) {
    $$(".tab").forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$(".panel").forEach((p) => {
      p.hidden = p.id !== "panel-" + name;
      p.classList.toggle("active", p.id === "panel-" + name);
    });
    $$(".bn-item").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    clearAlert();
  }

  $$(".tab").forEach((t) => t.addEventListener("click", () => switchTab(t.dataset.tab)));

  $$(".bn-item").forEach((b) =>
    b.addEventListener("click", () => {
      if (b.dataset.tab) {
        switchTab(b.dataset.tab);
        $("tools").scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (b.dataset.scroll) {
        $(b.dataset.scroll).scrollIntoView({ behavior: "smooth", block: "start" });
      }
    })
  );

  /* ---------- Paste / Clear buttons ---------- */
  $$(".paste-btn").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const input = $(btn.dataset.target);
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          input.value = text.trim();
          input.dispatchEvent(new Event("input"));
          toast("Link ditempel");
        }
      } catch {
        toast("Tidak bisa akses clipboard, tempel manual ya");
      }
      input.focus();
    })
  );

  $$(".clear-btn").forEach((btn) => {
    const input = $(btn.dataset.target);
    const sync = () => (btn.style.display = input.value ? "grid" : "none");
    input.addEventListener("input", sync);
    btn.addEventListener("click", () => {
      input.value = "";
      sync();
      input.focus();
    });
    sync();
  });

  /* ---------- Media format filtering / rendering ---------- */
  function selectedFormat() {
    const checked = document.querySelector('input[name="format"]:checked');
    return checked ? checked.value : "all";
  }

  function filterByFormat(media, fmt) {
    if (fmt === "all") return media;
    if (fmt === "mp4") return media.filter((m) => m.kind === "video" || m.kind === "image" || m.kind === "file");
    if (fmt === "mp3") return media.filter((m) => m.kind === "audio");
    return media;
  }

  function renderResult(data, fmt) {
    clearAlert();
    let media = filterByFormat(data.media || [], fmt);
    if (media.length === 0) media = data.media || [];

    if (media.length === 0) {
      showAlert("Media tidak ditemukan untuk link ini.");
      return;
    }

    titleEl.textContent = data.title || "Media siap diunduh";
    authorEl.textContent = data.author ? "oleh " + data.author : "";

    if (data.thumbnail) {
      thumb.src = data.thumbnail;
      thumb.parentElement.style.display = "";
    } else {
      thumb.removeAttribute("src");
      thumb.parentElement.style.display = "none";
    }

    linksEl.innerHTML = "";
    media.forEach((item, i) => {
      const a = document.createElement("a");
      a.className = "dl-link";
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("download", "");
      const kind = item.kind || "video";
      a.innerHTML =
        '<span class="meta">' +
        '<span class="badge ' + kind + '">' + kind.toUpperCase() + "</span>" +
        "<span>" + (item.label || "Download " + (i + 1)) + "</span>" +
        "</span><span class=\"arrow\">↓</span>";
      a.addEventListener("click", () => toast("Membuka unduhan…"));
      linksEl.appendChild(a);
    });

    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function doDownload(url, platform, fmt, btn, idleLabel) {
    if (!url) return;
    clearAlert();
    resultSection.hidden = true;
    setLoading(btn, true, idleLabel);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url, platform: platform }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showAlert(data.error || "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }
      renderResult(data, fmt);
    } catch (err) {
      showAlert("Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.");
    } finally {
      setLoading(btn, false, idleLabel);
    }
  }

  /* ---------- Downloader form ---------- */
  $("dl-form").addEventListener("submit", (e) => {
    e.preventDefault();
    doDownload($("url").value.trim(), $("platform").value, selectedFormat(), $("go-btn"), "Download");
  });

  /* ---------- Audio/MP3 form ---------- */
  $("audio-form").addEventListener("submit", (e) => {
    e.preventDefault();
    doDownload($("audio-url").value.trim(), "auto", "mp3", $("audio-btn"), "Ambil Audio MP3");
  });

  /* ---------- YouTube search ---------- */
  const searchResults = $("search-results");

  function renderSearch(items) {
    searchResults.innerHTML = "";
    items.forEach((it) => {
      const card = document.createElement("div");
      card.className = "yt-card";
      const thumbHtml = it.thumbnail
        ? '<img src="' + it.thumbnail + '" alt="" loading="lazy" />'
        : "";
      const durHtml = it.duration ? '<span class="yt-dur">' + it.duration + "</span>" : "";
      const sub = [it.author, it.views ? formatViews(it.views) + "x ditonton" : null, it.ago]
        .filter(Boolean)
        .join(" • ");
      card.innerHTML =
        '<div class="yt-thumb">' + thumbHtml + durHtml + "</div>" +
        '<div class="yt-meta"><h4>' + escapeHtml(it.title) + "</h4><p>" + escapeHtml(sub) + "</p></div>" +
        '<button class="yt-get" type="button">Unduh</button>';
      card.querySelector(".yt-get").addEventListener("click", () => {
        switchTab("downloader");
        $("url").value = it.url;
        $("url").dispatchEvent(new Event("input"));
        $("platform").value = "youtube";
        document.querySelector('input[name="format"][value="all"]').checked = true;
        $("tools").scrollIntoView({ behavior: "smooth", block: "start" });
        doDownload(it.url, "youtube", "all", $("go-btn"), "Download");
      });
      searchResults.appendChild(card);
    });
  }

  function formatViews(n) {
    n = Number(n) || 0;
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "M";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "jt";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "rb";
    return String(n);
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  $("search-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = $("query").value.trim();
    if (!query) return;
    clearAlert();
    searchResults.innerHTML = "";
    const btn = $("search-btn");
    setLoading(btn, true, "Cari");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showAlert(data.error || "Pencarian gagal. Coba lagi.");
        return;
      }
      if (!data.results || data.results.length === 0) {
        showAlert("Tidak ada hasil untuk \"" + query + "\".");
        return;
      }
      renderSearch(data.results);
      toast(data.results.length + " hasil ditemukan");
    } catch (err) {
      showAlert("Gagal terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setLoading(btn, false, "Cari");
    }
  });
})();
