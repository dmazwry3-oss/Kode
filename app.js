// ============= PARTICLES =============
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 35; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        p.style.left = Math.random() * 100 + '%';
        p.style.width = (Math.random() * 5 + 2) + 'px';
        p.style.height = p.style.width;
        p.style.animationDelay = Math.random() * 8 + 's';
        p.style.animationDuration = (Math.random() * 6 + 5) + 's';
        container.appendChild(p);
    }
}
createParticles();

// ============= HEART CLICK =============
const heartEmojis = ['💕', '💖', '💗', '💝', '💘', '💞', '✨'];
document.addEventListener('click', function(e) {
    if (e.target.closest('button, a, input, select, textarea, .toggle-eye, summary')) return;
    spawnHeart(e.clientX, e.clientY);
});

function spawnHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'click-heart';
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.fontSize = (Math.random() * 15 + 22) + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
}

// ============= LOAD SAVED DATA =============
window.addEventListener('DOMContentLoaded', function() {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) document.getElementById('apiKey').value = savedKey;
    const savedPengirim = localStorage.getItem('bucin_pengirim');
    if (savedPengirim) document.getElementById('pengirim').value = savedPengirim;
    const savedTema = localStorage.getItem('bucin_tema');
    if (savedTema) document.getElementById('tema').value = savedTema;
    const savedCerita = localStorage.getItem('bucin_cerita');
    if (savedCerita) document.getElementById('cerita').value = savedCerita;

    let counter = parseInt(localStorage.getItem('msg_count') || '0');
    document.querySelectorAll('.stat-num')[2].textContent = counter > 0 ? counter + 'x' : '∞';
});

function toggleApiKey() {
    const input = document.getElementById('apiKey');
    const btn = document.getElementById('eyeBtn');
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

function showToast(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}


// ============= AI GENERATE (HEMAT API: hanya 1x saat buat link) =============
async function generateLink() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const pengirim = document.getElementById('pengirim').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const hubungan = document.getElementById('hubungan').value;
    const tema = document.getElementById('tema').value;
    const panjang = document.getElementById('panjang').value;
    const cerita = document.getElementById('cerita').value.trim();

    if (!apiKey) { showToast('🔑 Masukkan API Key dulu ya!'); document.getElementById('apiKey').focus(); return; }
    if (!nama) { showToast('💕 Masukkan nama dia dulu!'); document.getElementById('nama').focus(); return; }
    if (!hubungan) { showToast('💍 Pilih hubungan dulu!'); document.getElementById('hubungan').focus(); return; }

    localStorage.setItem('gemini_api_key', apiKey);
    if (pengirim) localStorage.setItem('bucin_pengirim', pengirim);
    localStorage.setItem('bucin_tema', tema);
    if (cerita) localStorage.setItem('bucin_cerita', cerita);

    // Show loading state on button
    const btn = document.getElementById('generateBtn');
    const btnOriginal = btn.innerHTML;
    btn.innerHTML = '<span class="btn-sparkle">⏳</span> <span>AI sedang menulis...</span> <span class="btn-sparkle">✨</span>';
    btn.disabled = true;

    try {
        showToast('🤖 AI sedang membuat pesan, tunggu sebentar...');
        let aiText = await callGemini(apiKey, nama, hubungan, tema, panjang, cerita, pengirim);
        
        // Validate: must have 6 parts
        let parts = parseAndValidateParts(aiText);
        
        // If invalid, retry once with even stricter prompt
        if (!parts || parts.length < 6) {
            showToast('🔄 Memperbaiki pesan, sebentar...');
            aiText = await callGemini(apiKey, nama, hubungan, tema, panjang, cerita, pengirim, true);
            parts = parseAndValidateParts(aiText);
        }
        
        // Final fallback: fill missing parts with smart defaults
        parts = ensureSixParts(parts || [], nama, tema);
        
        // Reconstruct text from parts (clean format)
        const cleanText = parts.join('\n---\n');

        // Encode message to URL (compress with base64)
        const encodedMsg = encodeMessage(cleanText);

        // Counter
        let counter = parseInt(localStorage.getItem('msg_count') || '0') + 1;
        localStorage.setItem('msg_count', counter);
        document.querySelectorAll('.stat-num')[2].textContent = counter + 'x';

        // Build link WITHOUT api key (hemat & aman)
        const baseUrl = window.location.href.replace('index.html', '').replace(/\/$/, '');
        const params = new URLSearchParams({ nama, hubungan, msg: encodedMsg });
        if (pengirim) params.set('dari', pengirim);
        const link = `${baseUrl}/result.html?${params.toString()}`;

        // Show result
        const resultDiv = document.getElementById('result');
        document.getElementById('resultNama').textContent = nama;
        const linkEl = document.getElementById('generatedLink');
        linkEl.href = link;
        linkEl.textContent = link;
        resultDiv.classList.remove('hidden');
        document.getElementById('copyNotif').classList.add('hidden');

        // Show regenerate button
        document.getElementById('regenerateBtn').style.display = '';

        // Save to link history
        saveLinkToHistory(nama, link, tema);

        setTimeout(() => resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        showToast('🎉 Pesan jadi! Link siap dibagikan');
    } catch (err) {
        showToast('❌ Error: ' + err.message);
    } finally {
        btn.innerHTML = btnOriginal;
        btn.disabled = false;
    }
}

// Encode message to URL-safe base64
function encodeMessage(text) {
    // UTF-8 safe base64 encode
    const utf8 = unescape(encodeURIComponent(text));
    const b64 = btoa(utf8);
    // URL-safe base64
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Parse AI output and extract 6 parts robustly
function parseAndValidateParts(text) {
    if (!text) return null;
    
    // Try splitting by "---" first
    let parts = text.split(/\n?\s*---\s*\n?/).map(p => p.trim()).filter(p => p.length > 5);
    
    // If still not 6, try numbered format [1] [2] etc
    if (parts.length < 6) {
        const numbered = text.split(/\n?\s*\[(?:\d+|BAGIAN\s*\d+)\]\s*\n?/i).map(p => p.trim()).filter(p => p.length > 5);
        if (numbered.length >= 6) parts = numbered;
    }
    
    // Try splitting by "BAGIAN X:" or just numbers like "1." "2."
    if (parts.length < 6) {
        const byBagian = text.split(/\n?\s*(?:BAGIAN\s*\d+[:\.\)]?|^\d+[\.\)])\s*\n?/im).map(p => p.trim()).filter(p => p.length > 5);
        if (byBagian.length >= 6) parts = byBagian;
    }
    
    // Clean each part - remove leading numbers, labels
    parts = parts.map(p => {
        return p.replace(/^(BAGIAN\s*\d+[:\.\)]?\s*[-–]?\s*[A-Z\s]*\s*[:\.\)]?)/i, '')
                .replace(/^\[\d+\][\s:]*/g, '')
                .replace(/^\d+[\.\)]\s*/g, '')
                .replace(/^[-=]+/g, '')
                .trim();
    }).filter(p => p.length > 5);
    
    return parts;
}

// Smart fallback for missing parts
function ensureSixParts(parts, nama, tema) {
    const fallbacks = [
        // Bagian 1 - Greeting
        [`Untukmu, ${nama}, yang selalu kucintai dalam diam.`,
         `${nama}ku, izinkan aku jujur sekali ini saja.`,
         `Diam-diam aku menulis ini sambil tersenyum, ${nama}.`,
         `Sebelum kamu tutup ini, baca dulu sampai habis ya, ${nama}.`],
        // Bagian 2 - Teaser
        [`Aku punya satu rahasia yang gak pernah aku bilang ke siapa-siapa.`,
         `Sebenarnya pesan ini sudah aku tulis berkali-kali di kepala.`,
         `Ada hal yang udah lama aku pendam, dan hari ini aku mau ungkapkan.`,
         `Aku ingin kamu tahu sesuatu yang selama ini cuma aku simpan sendiri.`],
        // Bagian 3 - Main 1
        [`${nama}, kamu adalah orang yang membuat hari-hariku terasa berbeda. Setiap kali aku memikirkanmu, ada perasaan hangat yang menyelinap masuk ke hati. Kamu bukan sekadar nama yang aku panggil, tapi seseorang yang kehadirannya kuingin selalu ada. Dalam keramaian dunia ini, kamulah yang paling kucari, paling kunanti, dan paling kurindu.`],
        // Bagian 4 - Main 2
        [`Yang membuat aku jatuh cinta padamu bukan hanya satu hal, melainkan ribuan detail kecil yang menjadi kamu. Caramu tertawa, caramu menatap, bahkan caramu diam pun terasa istimewa di mataku. Kamu adalah kombinasi yang sempurna dari semua hal yang selama ini aku impikan. Setiap detik bersamamu, ${nama}, terasa seperti hadiah yang tidak pernah ingin aku akhiri.`],
        // Bagian 5 - Promise
        [`Aku berjanji akan selalu ada untukmu, dalam tawa maupun dalam tangisan. Aku akan menjadi rumah yang nyaman untukmu pulang, ${nama}. Apapun yang terjadi nanti, ingatlah bahwa cintaku padamu tidak akan pernah pudar oleh waktu.`],
        // Bagian 6 - Closing
        [`Kamu adalah halaman terindah dalam buku hidupku. Terima kasih telah menjadi alasan aku bersyukur setiap hari. ${nama}, aku mencintaimu, kemarin, hari ini, dan selamanya.`]
    ];
    
    const result = [...parts];
    for (let i = 0; i < 6; i++) {
        if (!result[i] || result[i].length < 10) {
            const options = fallbacks[i];
            result[i] = options[Math.floor(Math.random() * options.length)];
        }
    }
    return result.slice(0, 6);
}

// Regenerate (panggil AI lagi dengan input yang sama)
async function regenerateMessage() {
    document.getElementById('result').classList.add('hidden');
    await generateLink();
}


// ============= CALL GEMINI API =============
async function callGemini(apiKey, nama, hubungan, tema, panjang, cerita, dari, strict = false) {
    const models = ['gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    const hubunganText = {
        'pacar': 'pacar tercinta', 'suami': 'suami tersayang', 'istri': 'istri tercinta',
        'gebetan': 'gebetan, orang yang sedang aku taksir diam-diam',
        'mantan': 'mantan kekasih yang masih ada di hati',
        'sahabat': 'sahabat paling spesial',
        'crush': 'crush yang aku kagumi diam-diam',
        'calon': 'calon pasangan hidup'
    };

    const temaPrompt = {
        'romantis': 'ROMANTIS KLASIK - lembut, puitis, menyentuh hati. Diksi indah seperti "kekasih", "belahan jiwa", "cintaku".',
        'bucin': 'BUCIN ABIS - lebay, manja, kekinian, full "sayangku/cintaku/bidadariku". Pakai perumpamaan absurd: "rela jadi sandal jepit kamu", "tanpa kamu hidupku gak ada notif". Cringe tapi manis.',
        'puitis': 'PUITIS sastrawi. Penuh metafora indah tentang bulan, bintang, samudra, hujan, senja. Bagai puisi Sapardi atau Chairil Anwar versi cinta.',
        'lucu': 'ROMANTIS + LUCU dan KOCAK. Selipkan banyak jokes receh, plesetan, perumpamaan absurd-manis. Contoh: "Kamu kayak charger, hidupku gak nyala tanpa kamu", "Aku tuh kayak WiFi, kamu passwordnya yang gak pernah lupa". WAJIB minimal 5 jokes berbeda.',
        'rindu': 'RINDU MENDALAM. Penuh deskripsi rindu yang menyiksa tapi indah. Kangen suara, tatapan, senyum, sentuhan, aroma.',
        'malam': 'UCAPAN SELAMAT MALAM. Bicarakan mimpi, bintang, bulan, tidur nyenyak, peluk dalam imajinasi, doa baik.',
        'gombal': 'GOMBAL SUPER LEBAY. Rayuan playboy ahli. WAJIB minimal 6 gombalan kreatif berbeda.',
        'drama': 'DRAMA KOREA dramatis. Cinta penuh perjuangan, takdir, jodoh, sampai akhir hayat. Monolog drakor bikin nangis.',
        'tsundere': 'TSUNDERE - awalnya jutek/galak/malu (tsun) tapi diam-diam super cinta (dere). Lucu, gemas, kontradiktif.',
        'puisi': 'Murni PUISI INDAH. Bait dengan rima/ritme. Pakai majas dan diksi luar biasa.',
        'anniversary': 'UCAPAN ANNIVERSARY. Syukur dan cinta untuk perjalanan bersama. Kenangan, perjuangan, harapan.',
        'permintaan_maaf': 'PERMINTAAN MAAF TULUS. Akui kesalahan, sesal mendalam, janji perubahan konkret.',
        'ldr': 'LDR. Tentang jarak yang memisahkan tapi cinta mendekatkan. Menunggu, video call, rindu, mimpi bertemu.'
    };

    const ceritaContext = cerita ? `\n\nKONTEKS PERSONAL TENTANG ${nama.toUpperCase()}:\n"${cerita}"\n\nIntegrasikan info ini SECARA NATURAL.` : '';

    // STRICT prompt with explicit numbered format
    const prompt = `Kamu adalah Pujangga Cinta Indonesia yang sangat patuh format. Tulis pesan cinta untuk "${nama}" yang merupakan ${hubunganText[hubungan] || hubungan} dari saya${dari ? ` (pengirim: "${dari}")` : ''}.

GAYA: ${temaPrompt[tema] || temaPrompt['romantis']}
${ceritaContext}

============================================
FORMAT OUTPUT WAJIB (SANGAT KETAT - HARUS PERSIS BEGINI):

Tulis 6 bagian. SETIAP bagian DIMULAI dengan "[1]", "[2]", "[3]", "[4]", "[5]", "[6]" di awal baris baru.
Antara bagian, beri 1 baris kosong.

[1]
Tulis disini: SAPAAN UNIK (1 kalimat singkat 5-15 kata) untuk "${nama}". JANGAN tulis "Hai ${nama}". Buat kreatif.
Contoh bagus: "Sebelum kamu tutup ini, baca dulu sampai habis ya, ${nama}."

[2]
Tulis disini: TEASER (1-2 kalimat singkat, 15-30 kata) yang bikin penasaran. JANGAN pakai "Kamu tau gak sih?".
Contoh bagus: "Aku punya satu rahasia yang gak pernah aku bilang ke siapa-siapa."

[3]
Tulis disini: PEMBUKA UTAMA (sekitar 100-150 kata, 5-7 kalimat). Ungkapan cinta yang dalam. Sebut "${nama}". Kalimat pertama harus MEMORABLE. Buat panjang dan bermakna.

[4]
Tulis disini: DETAIL & ALASAN (sekitar 100-150 kata, 5-7 kalimat). Hal SPESIFIK yang bikin jatuh cinta. Detail personal: senyum, tatapan, kebiasaan kecil. Buat seolah benar-benar mengenal dia.

[5]
Tulis disini: JANJI & HARAPAN (sekitar 80-120 kata, 4-5 kalimat). Komitmen, janji, harapan masa depan. Spesifik dan tulus.

[6]
Tulis disini: PENUTUP KILLER (sekitar 50-80 kata, 3-4 kalimat). Penutup yang akan diingat selamanya. Sangat memorable.

============================================
ATURAN MUTLAK:
1. WAJIB ada 6 bagian dengan label [1], [2], [3], [4], [5], [6]
2. JANGAN skip bagian apapun
3. Setiap bagian HARUS terisi dengan teks (jangan kosong)
4. TANPA emoji, TANPA markdown (**, ##, -)
5. JANGAN tulis kata "Bagian" atau judul lain di output
6. Bahasa Indonesia natural & mengalir
7. Total sekitar 500-700 kata
8. Sebut "${nama}" minimal 3x

${strict ? 'PENTING: Generate sebelumnya gagal mengikuti format. KALI INI WAJIB IKUTI FORMAT [1] sampai [6] dengan PERSIS!' : ''}

Sekarang TULIS PESANNYA dengan format yang benar:`;

    let lastError = '';
    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: strict ? 0.9 : 1.1,
                        maxOutputTokens: 3000,
                        topP: 0.95, topK: 40
                    }
                })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                lastError = `${model}: ${response.status} - ${errData.error?.message || 'Error'}`;
                continue;
            }
            const data = await response.json();
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            }
            lastError = `${model}: Response kosong`;
        } catch (error) {
            lastError = `${model}: ${error.message}`;
        }
    }
    throw new Error(lastError);
}

function copyLink() {
    const link = document.getElementById('generatedLink').href;
    navigator.clipboard.writeText(link).then(showCopyNotif).catch(() => {
        const t = document.createElement('input');
        t.value = link; document.body.appendChild(t); t.select();
        document.execCommand('copy'); document.body.removeChild(t);
        showCopyNotif();
    });
}

function showCopyNotif() {
    const notif = document.getElementById('copyNotif');
    notif.classList.remove('hidden');
    setTimeout(() => notif.classList.add('hidden'), 3000);
    showToast('✅ Link disalin!');
}

function shareLink() {
    const link = document.getElementById('generatedLink').href;
    const nama = document.getElementById('nama').value.trim();
    const text = `Hai ${nama}! 💕\n\nAda pesan spesial buat kamu, buka ya:\n${link}`;
    if (navigator.share) {
        navigator.share({ title: 'Pesan Cinta - Dmaz Coba Coba', text, url: link });
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
}

function previewLink() {
    const link = document.getElementById('generatedLink').href;
    window.open(link, '_blank');
}




// ============= LINK HISTORY =============
function saveLinkToHistory(nama, link, tema) {
    try {
        const history = JSON.parse(localStorage.getItem('link_history') || '[]');
        history.unshift({
            nama, link, tema,
            time: Date.now()
        });
        // Keep last 20 only
        const trimmed = history.slice(0, 20);
        localStorage.setItem('link_history', JSON.stringify(trimmed));
        renderHistory();
    } catch (e) {}
}

function renderHistory() {
    const list = document.getElementById('historyList');
    const count = document.getElementById('historyCount');
    if (!list) return;
    
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('link_history') || '[]');
    } catch (e) {}
    
    if (count) count.textContent = history.length;
    
    if (history.length === 0) {
        list.innerHTML = '<div class="history-empty">Belum ada link yang dibuat</div>';
        return;
    }
    
    list.innerHTML = history.map((item, idx) => {
        const date = new Date(item.time);
        const timeStr = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`;
        return `
            <div class="history-item">
                <div class="history-item-info">
                    <div class="history-item-name">💕 ${escapeHtml(item.nama)}</div>
                    <div class="history-item-date">${timeStr} • ${item.tema || 'romantis'}</div>
                </div>
                <div class="history-item-actions">
                    <button class="history-btn" onclick="copyHistoryLink(${idx})">📋</button>
                    <button class="history-btn" onclick="openHistoryLink(${idx})">👁</button>
                    <button class="history-btn" onclick="deleteHistoryItem(${idx})">🗑</button>
                </div>
            </div>
        `;
    }).join('');
}

function copyHistoryLink(idx) {
    try {
        const history = JSON.parse(localStorage.getItem('link_history') || '[]');
        if (history[idx]) {
            navigator.clipboard.writeText(history[idx].link).then(() => {
                showToast('✅ Link disalin!');
            }).catch(() => {});
        }
    } catch (e) {}
}

function openHistoryLink(idx) {
    try {
        const history = JSON.parse(localStorage.getItem('link_history') || '[]');
        if (history[idx]) window.open(history[idx].link, '_blank');
    } catch (e) {}
}

function deleteHistoryItem(idx) {
    try {
        const history = JSON.parse(localStorage.getItem('link_history') || '[]');
        history.splice(idx, 1);
        localStorage.setItem('link_history', JSON.stringify(history));
        renderHistory();
        showToast('🗑 Item dihapus');
    } catch (e) {}
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Render on load
window.addEventListener('DOMContentLoaded', renderHistory);
