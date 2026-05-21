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
        const aiText = await callGemini(apiKey, nama, hubungan, tema, panjang, cerita, pengirim);
        
        if (!aiText) {
            showToast('❌ Gagal generate pesan, coba lagi');
            btn.innerHTML = btnOriginal;
            btn.disabled = false;
            return;
        }

        // Encode message to URL (compress with base64)
        const encodedMsg = encodeMessage(aiText);

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

// Regenerate (panggil AI lagi dengan input yang sama)
async function regenerateMessage() {
    document.getElementById('result').classList.add('hidden');
    await generateLink();
}


// ============= CALL GEMINI API =============
async function callGemini(apiKey, nama, hubungan, tema, panjang, cerita, dari) {
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

    const panjangSpec = {
        'sedang': { kata: '350', ksb: '5-7 kalimat', tokens: 2500 },
        'panjang': { kata: '600', ksb: '7-9 kalimat', tokens: 4000 },
        'sangat_panjang': { kata: '900', ksb: '9-12 kalimat', tokens: 6000 }
    };
    const spec = panjangSpec[panjang] || panjangSpec['panjang'];

    const bumbuList = [
        'Selipkan metafora kreatif tentang kopi/hujan/senja.',
        'Tambahkan kalimat "andai..." yang romantis.',
        'Buat plot twist kecil yang manis di tengah pesan.',
        'Selipkan referensi sehari-hari romantis (mie ayam, ngopi, hujan).',
        'Tambahkan pertanyaan retoris puitis ("Tahukah kamu...?").',
        'Selipkan satu kata bahasa daerah/asing romantis.',
        'Buat kalimat singkat tapi powerful (3-5 kata) di tengah.',
        'Tambahkan janji konkret yang spesifik dan unik.',
        'Selipkan kalimat tentang detik dan waktu yang puitis.',
        'Buat momen "aku ingin..." yang detail dan menyentuh.',
        'Selipkan pengakuan kecil yang gak biasa diceritakan.',
        'Buat satu kalimat yang bermain dengan kata-kata (wordplay).'
    ];
    const shuffled = [...bumbuList].sort(() => 0.5 - Math.random());
    const bumbus = shuffled.slice(0, 3);

    const ceritaContext = cerita ? `\n\nKONTEKS PERSONAL TENTANG ${nama.toUpperCase()}:\n"${cerita}"\n\nIntegrasikan info ini SECARA NATURAL ke pesan. Pilih yang paling menyentuh.` : '';

    const prompt = `Kamu adalah Pujangga Cinta Indonesia. Karyamu sering viral di TikTok dan IG karena selalu BIKIN BAPER MAKSIMAL.

TUGAS: Tulis pesan cinta untuk "${nama}" yang merupakan ${hubunganText[hubungan] || hubungan} dari saya${dari ? ` (pengirim: "${dari}")` : ''}.

GAYA: ${temaPrompt[tema] || temaPrompt['romantis']}

BUMBU KREATIF (WAJIB diintegrasikan natural):
1. ${bumbus[0]}
2. ${bumbus[1]}
3. ${bumbus[2]}
${ceritaContext}

============================================
FORMAT OUTPUT - WAJIB 6 BAGIAN, dipisah "---" di baris kosong:

BAGIAN 1 - GREETING (1 kalimat singkat 5-15 kata):
Sapaan UNIK & KREATIF untuk "${nama}". JANGAN tulis "Hai ${nama}". Buat yang BEDA setiap kali.
Contoh: "Sebelum kamu tutup ini, baca dulu sampai habis ya, ${nama}." atau "${nama}ku, izinkan aku jujur..."

BAGIAN 2 - TEASER (1-2 kalimat, 15-30 kata):
Bikin penasaran. JANGAN pakai "Kamu tau gak sih?". Variasikan!
Contoh: "Aku punya satu rahasia yang gak pernah aku bilang ke siapa-siapa." atau "Sebenarnya pesan ini sudah aku tulis berkali-kali di kepala."

BAGIAN 3 - PEMBUKA UTAMA (${spec.ksb}):
Ungkapan cinta yang dalam. Sebut nama "${nama}". Kalimat pertama harus MEMORABLE.

BAGIAN 4 - DETAIL & ALASAN (${spec.ksb}):
Hal SPESIFIK yang bikin jatuh cinta. Detail personal: senyum, tatapan, kebiasaan kecil. Buat seolah benar-benar mengenal dia.

BAGIAN 5 - JANJI & HARAPAN (${spec.ksb}):
Komitmen, janji, harapan masa depan. Spesifik dan tulus.

BAGIAN 6 - PENUTUP KILLER (4-6 kalimat):
Penutup yang akan diingat selamanya. Sangat memorable.

============================================
ATURAN KETAT:
- TEPAT 6 bagian dipisah "---" di baris kosong
- Total minimal ${spec.kata} kata
- Bahasa Indonesia natural
- TANPA emoji, markdown, label "Bagian X:"
- Variatif - tiap generate harus berbeda
- Sebut "${nama}" minimal 3x

Sekarang TULIS PESANNYA. Buat paling bikin meleleh:`;

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
                        temperature: 1.2, maxOutputTokens: spec.tokens,
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
