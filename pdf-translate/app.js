/* ============================================================
   PDF Translator - 100% Browser-Based
   - PDF.js to extract text per page
   - MyMemory API (free, no key) for translation
   - jsPDF to generate translated PDF output
   ============================================================ */

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// =============== STATE ===============
const state = {
    file: null,
    pages: [],          // [{pageNum, text, translated}]
    sourceLang: 'auto',
    targetLang: 'id',
    outputMode: 'bilingual',
    translatedBlob: null,
    translatedFileName: null,
};

// =============== ELEMENT REFS ===============
const $ = (id) => document.getElementById(id);

const screens = {
    upload: $('screenUpload'),
    config: $('screenConfig'),
    progress: $('screenProgress'),
    result: $('screenResult'),
};

const fileInput = $('fileInput');
const dropArea = $('dropArea');
const filelist = $('filelist');
const sourceLang = $('sourceLang');
const targetLang = $('targetLang');
const outputMode = $('outputMode');
const swapLang = $('swapLang');
const translateBtn = $('translateBtn');
const cancelBtn = $('cancelBtn');
const progressBar = $('progressBar');
const progressLabel = $('progressLabel');
const progressPercent = $('progressPercent');
const progressLog = $('progressLog');
const processText = $('processText');
const resultName = $('resultName');
const resultMeta = $('resultMeta');
const resultSubtitle = $('resultSubtitle');
const downloadBtn = $('downloadBtn');
const newFileBtn = $('newFileBtn');
const copyTextBtn = $('copyTextBtn');
const previewContent = $('previewContent');
const toast = $('toast');

// =============== UI HELPERS ===============
function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
        el.classList.toggle('hidden', key !== name);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message, type = 'info', duration = 3000) {
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    setTimeout(() => toast.classList.remove('show'), duration);
}

function logProgress(message, type = 'info') {
    const line = document.createElement('div');
    line.className = 'log-line ' + type;
    line.textContent = '› ' + message;
    progressLog.appendChild(line);
    progressLog.scrollTop = progressLog.scrollHeight;
}

function setProgress(percent, label) {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    progressBar.style.width = p + '%';
    progressPercent.textContent = p + '%';
    if (label) progressLabel.textContent = label;
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// =============== FILE HANDLING ===============
function handleFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showToast('❌ Hanya file PDF yang didukung', 'error');
        return;
    }
    if (file.size > 50 * 1024 * 1024) {
        showToast('❌ Ukuran file maksimal 50 MB', 'error');
        return;
    }

    state.file = file;
    renderFileList();
    showScreen('config');
}

function renderFileList() {
    filelist.innerHTML = '';
    if (!state.file) return;
    const item = document.createElement('div');
    item.className = 'fileitem';
    item.innerHTML = `
        <div class="fileitem__icon">📄</div>
        <div class="fileitem__info">
            <div class="fileitem__name">${escapeHtml(state.file.name)}</div>
            <div class="fileitem__meta">${formatBytes(state.file.size)} • PDF</div>
        </div>
        <button class="fileitem__remove" title="Hapus file">×</button>
    `;
    item.querySelector('.fileitem__remove').addEventListener('click', () => {
        state.file = null;
        showScreen('upload');
    });
    filelist.appendChild(item);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// =============== EVENT LISTENERS ===============
$('pickfiles').addEventListener('click', (e) => {
    // label triggers input click natively
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
    fileInput.value = '';
});

// Drag & drop on whole upload screen
['dragenter', 'dragover'].forEach((ev) => {
    document.addEventListener(ev, (e) => {
        if (!screens.upload.classList.contains('hidden')) {
            e.preventDefault();
            dropArea.classList.add('active');
        }
    });
});
['dragleave', 'drop'].forEach((ev) => {
    document.addEventListener(ev, (e) => {
        e.preventDefault();
        dropArea.classList.remove('active');
    });
});
document.addEventListener('drop', (e) => {
    if (!screens.upload.classList.contains('hidden')) {
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }
});

cancelBtn.addEventListener('click', () => {
    state.file = null;
    showScreen('upload');
});

newFileBtn.addEventListener('click', () => {
    state.file = null;
    state.pages = [];
    state.translatedBlob = null;
    showScreen('upload');
});

swapLang.addEventListener('click', () => {
    const src = sourceLang.value;
    const tgt = targetLang.value;
    if (src === 'auto') {
        showToast('⚠️ Tidak bisa menukar saat sumber adalah Deteksi Otomatis', 'error');
        return;
    }
    sourceLang.value = tgt;
    targetLang.value = src;
});

translateBtn.addEventListener('click', startTranslation);

downloadBtn.addEventListener('click', () => {
    if (!state.translatedBlob) return;
    const url = URL.createObjectURL(state.translatedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.translatedFileName || 'terjemahan.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

copyTextBtn.addEventListener('click', () => {
    const allText = state.pages
        .map((p, i) => `--- Halaman ${i + 1} ---\n${p.translated}`)
        .join('\n\n');
    navigator.clipboard.writeText(allText)
        .then(() => showToast('✅ Teks disalin ke clipboard', 'success'))
        .catch(() => showToast('❌ Gagal menyalin', 'error'));
});

// =============== PDF EXTRACTION ===============
async function extractTextFromPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Reconstruct text with line breaks based on Y-coordinates
        let lastY = null;
        let text = '';
        for (const item of content.items) {
            const y = item.transform[5];
            if (lastY !== null && Math.abs(lastY - y) > 2) {
                text += '\n';
            }
            text += item.str;
            // Add space if item doesn't end with space and isn't followed by punctuation
            if (item.hasEOL) text += '\n';
            else if (!item.str.endsWith(' ')) text += ' ';
            lastY = y;
        }
        pages.push({
            pageNum: i,
            text: text.trim().replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' '),
            translated: '',
        });

        setProgress(((i / pdf.numPages) * 30), `Membaca halaman ${i} dari ${pdf.numPages}...`);
    }
    return pages;
}

// =============== TRANSLATION (MyMemory API) ===============
/**
 * MyMemory API has a limit of ~500 chars per request.
 * Split text into chunks at sentence boundaries.
 */
function chunkText(text, maxLen = 480) {
    if (!text) return [];
    const chunks = [];
    // Split by sentence-ending punctuation, keep delimiters
    const sentences = text.match(/[^.!?\n]+(?:[.!?]+|\n+|$)/g) || [text];
    let current = '';
    for (const s of sentences) {
        if ((current + s).length > maxLen) {
            if (current) chunks.push(current);
            // If single sentence is too long, hard-split it
            if (s.length > maxLen) {
                for (let i = 0; i < s.length; i += maxLen) {
                    chunks.push(s.slice(i, i + maxLen));
                }
                current = '';
            } else {
                current = s;
            }
        } else {
            current += s;
        }
    }
    if (current) chunks.push(current);
    return chunks;
}

async function translateChunk(text, source, target) {
    if (!text.trim()) return text;
    const langpair = `${source}|${target}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}&de=user@example.com`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Translation API error ${res.status}`);
    const data = await res.json();
    if (data.responseStatus !== 200 && data.responseStatus !== '200') {
        throw new Error(data.responseDetails || 'Translation failed');
    }
    return data.responseData.translatedText;
}

async function translatePageText(text, source, target) {
    // Translate paragraph by paragraph to preserve structure
    const paragraphs = text.split(/\n\s*\n/);
    const translatedParas = [];
    for (const para of paragraphs) {
        if (!para.trim()) {
            translatedParas.push('');
            continue;
        }
        const chunks = chunkText(para);
        const translatedChunks = [];
        for (const chunk of chunks) {
            try {
                const translated = await translateChunk(chunk, source, target);
                translatedChunks.push(translated);
                // Small delay to avoid rate limiting
                await new Promise((r) => setTimeout(r, 80));
            } catch (e) {
                console.error('Chunk failed:', e);
                translatedChunks.push(chunk); // fallback to original
            }
        }
        translatedParas.push(translatedChunks.join(' '));
    }
    return translatedParas.join('\n\n');
}

// =============== PDF GENERATION ===============
function generateTranslatedPdf(pages, mode, fileName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const PAGE_W = 210;
    const PAGE_H = 297;
    const MARGIN = 18;
    const LINE_H = 6;
    const MAX_W = PAGE_W - MARGIN * 2;

    // Cover page
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Hasil Terjemahan PDF', PAGE_W / 2, 40, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`File asli: ${fileName}`, PAGE_W / 2, 50, { align: 'center' });
    doc.text(
        `Mode: ${mode === 'bilingual' ? 'Bilingual' : 'Hanya Terjemahan'} • ${pages.length} halaman`,
        PAGE_W / 2, 56, { align: 'center' }
    );
    doc.text(`Diterjemahkan: ${new Date().toLocaleString('id-ID')}`, PAGE_W / 2, 62, { align: 'center' });
    doc.setDrawColor(229, 50, 45);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, 70, PAGE_W - MARGIN, 70);
    doc.setTextColor(229, 50, 45);
    doc.setFontSize(9);
    doc.text('Dibuat dengan Dmaz PDF Translator', PAGE_W / 2, 280, { align: 'center' });
    doc.setTextColor(0);

    // Content pages
    pages.forEach((p, idx) => {
        doc.addPage();

        // Page header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(229, 50, 45);
        doc.text(`Halaman ${idx + 1} / ${pages.length}`, MARGIN, MARGIN);
        doc.setDrawColor(229, 50, 45);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, MARGIN + 2, PAGE_W - MARGIN, MARGIN + 2);
        doc.setTextColor(0);

        let cursorY = MARGIN + 10;

        const writeBlock = (label, text, color, italic) => {
            // Label
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...color);
            if (cursorY > PAGE_H - MARGIN - LINE_H) {
                doc.addPage();
                cursorY = MARGIN;
            }
            doc.text(label, MARGIN, cursorY);
            cursorY += LINE_H;

            // Body
            doc.setFont('helvetica', italic ? 'italic' : 'normal');
            doc.setFontSize(10);
            doc.setTextColor(40);

            const lines = doc.splitTextToSize(text || '(tidak ada teks)', MAX_W);
            for (const line of lines) {
                if (cursorY > PAGE_H - MARGIN) {
                    doc.addPage();
                    cursorY = MARGIN;
                }
                doc.text(line, MARGIN, cursorY);
                cursorY += LINE_H;
            }
            cursorY += 3;
        };

        if (mode === 'bilingual') {
            writeBlock('TEKS ASLI', p.text, [120, 120, 120], true);
            writeBlock('TERJEMAHAN', p.translated, [229, 50, 45], false);
        } else {
            writeBlock('TERJEMAHAN', p.translated, [229, 50, 45], false);
        }
    });

    return doc.output('blob');
}

// =============== PREVIEW RENDERING ===============
function renderPreview(pages, mode) {
    previewContent.innerHTML = '';
    pages.forEach((p, idx) => {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'preview-page';

        const header = document.createElement('div');
        header.className = 'preview-page-header';
        header.textContent = `Halaman ${idx + 1}`;
        pageDiv.appendChild(header);

        if (mode === 'bilingual') {
            const orig = document.createElement('div');
            orig.className = 'preview-original';
            orig.textContent = p.text || '(tidak ada teks)';
            pageDiv.appendChild(orig);
        }

        const trans = document.createElement('div');
        trans.className = 'preview-translated';
        trans.textContent = p.translated || '(tidak ada teks)';
        pageDiv.appendChild(trans);

        previewContent.appendChild(pageDiv);
    });
}

// =============== MAIN PIPELINE ===============
async function startTranslation() {
    if (!state.file) {
        showToast('❌ Pilih file PDF dulu', 'error');
        return;
    }

    state.sourceLang = sourceLang.value;
    state.targetLang = targetLang.value;
    state.outputMode = outputMode.value;

    if (state.sourceLang === state.targetLang) {
        showToast('⚠️ Bahasa sumber dan tujuan sama', 'error');
        return;
    }

    showScreen('progress');
    progressLog.innerHTML = '';
    setProgress(0, 'Memulai...');
    processText.textContent = 'Membaca isi PDF...';

    try {
        // 1. Extract
        logProgress('Membuka file ' + state.file.name);
        const pages = await extractTextFromPdf(state.file);
        state.pages = pages;
        logProgress(`Berhasil membaca ${pages.length} halaman`, 'success');

        const totalChars = pages.reduce((sum, p) => sum + p.text.length, 0);
        logProgress(`Total karakter: ${totalChars.toLocaleString('id-ID')}`);

        if (totalChars === 0) {
            throw new Error('Tidak ada teks ditemukan di PDF (mungkin scan/gambar)');
        }

        // 2. Translate
        processText.textContent = 'Menerjemahkan teks...';
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            setProgress(
                30 + (i / pages.length) * 60,
                `Menerjemahkan halaman ${i + 1} dari ${pages.length}...`
            );
            logProgress(`Menerjemahkan halaman ${i + 1}...`);

            if (!page.text.trim()) {
                page.translated = '';
                continue;
            }

            try {
                page.translated = await translatePageText(
                    page.text,
                    state.sourceLang,
                    state.targetLang
                );
                logProgress(`Halaman ${i + 1} selesai`, 'success');
            } catch (e) {
                logProgress(`Halaman ${i + 1} gagal: ${e.message}`, 'error');
                page.translated = '[Terjemahan gagal]\n' + page.text;
            }
        }

        // 3. Generate PDF
        processText.textContent = 'Membuat file PDF...';
        setProgress(95, 'Membuat file PDF hasil terjemahan...');
        logProgress('Membuat PDF output...');

        const blob = generateTranslatedPdf(pages, state.outputMode, state.file.name);
        state.translatedBlob = blob;
        state.translatedFileName = state.file.name.replace(/\.pdf$/i, '') +
            `_${state.targetLang}.pdf`;

        setProgress(100, 'Selesai!');
        logProgress('PDF berhasil dibuat!', 'success');

        // 4. Show result
        await new Promise((r) => setTimeout(r, 400));
        renderPreview(pages, state.outputMode);
        resultName.textContent = state.translatedFileName;
        resultMeta.textContent =
            `${pages.length} halaman • ${formatBytes(blob.size)} • ${getLangLabel(state.targetLang)}`;
        resultSubtitle.textContent =
            `File berhasil diterjemahkan ke ${getLangLabel(state.targetLang)}.`;
        showScreen('result');
        showToast('✅ Terjemahan selesai!', 'success');

    } catch (err) {
        console.error(err);
        logProgress('ERROR: ' + err.message, 'error');
        showToast('❌ ' + err.message, 'error', 5000);
        setTimeout(() => showScreen('config'), 1500);
    }
}

function getLangLabel(code) {
    const opt = targetLang.querySelector(`option[value="${code}"]`);
    return opt ? opt.textContent.replace(/^[^\s]+ /, '') : code;
}

// =============== INIT ===============
showScreen('upload');
console.log('🚀 PDF Translator ready');
