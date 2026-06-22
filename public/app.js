// dmaz alyxers - frontend logic
(function () {
  "use strict";

  const form = document.getElementById("dl-form");
  const urlInput = document.getElementById("url");
  const platformSelect = document.getElementById("platform");
  const goBtn = document.getElementById("go-btn");
  const btnLabel = goBtn.querySelector(".btn-label");
  const spinner = goBtn.querySelector(".spinner");
  const pasteBtn = document.getElementById("paste-btn");

  const resultSection = document.getElementById("result");
  const thumb = document.getElementById("thumb");
  const titleEl = document.getElementById("title");
  const authorEl = document.getElementById("author");
  const linksEl = document.getElementById("links");
  const alertEl = document.getElementById("alert");

  document.getElementById("year").textContent = new Date().getFullYear();

  // Paste from clipboard
  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        urlInput.value = text.trim();
        urlInput.focus();
      }
    } catch {
      urlInput.focus();
    }
  });

  function selectedFormat() {
    const checked = document.querySelector('input[name="format"]:checked');
    return checked ? checked.value : "all";
  }

  function setLoading(loading) {
    goBtn.disabled = loading;
    spinner.hidden = !loading;
    btnLabel.textContent = loading ? "Memproses…" : "Download";
  }

  function showAlert(message) {
    alertEl.textContent = message;
    alertEl.hidden = false;
    resultSection.hidden = true;
  }

  function clearAlert() {
    alertEl.hidden = true;
    alertEl.textContent = "";
  }

  function filterByFormat(media, fmt) {
    if (fmt === "all") return media;
    if (fmt === "mp4") return media.filter((m) => m.kind === "video" || m.kind === "image");
    if (fmt === "mp3") return media.filter((m) => m.kind === "audio");
    return media;
  }

  function buildDownloadHref(item) {
    // Force a download attribute hint; cross-origin downloads will open in a new tab,
    // which still lets the user save the file.
    return item.url;
  }

  function renderResult(data, fmt) {
    clearAlert();
    let media = filterByFormat(data.media || [], fmt);

    // If the chosen format yields nothing, fall back to everything so user isn't stuck.
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
      a.href = buildDownloadHref(item);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("download", "");

      const kind = item.kind || "video";
      a.innerHTML =
        '<span class="meta">' +
        '<span class="badge ' + kind + '">' + kind.toUpperCase() + "</span>" +
        "<span>" + (item.label || "Download " + (i + 1)) + "</span>" +
        "</span>" +
        '<span class="arrow">↓</span>';
      linksEl.appendChild(a);
    });

    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    clearAlert();
    resultSection.hidden = true;
    setLoading(true);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url, platform: platformSelect.value }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showAlert(data.error || "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }

      renderResult(data, selectedFormat());
    } catch (err) {
      showAlert("Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.");
    } finally {
      setLoading(false);
    }
  });
})();
