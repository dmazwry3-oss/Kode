// ============= PARTICLES & FLOATING =============
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

function createFloatingElements() {
    const container = document.getElementById('floatingElements');
    if (!container) return;
    const emojis = ['💕', '💗', '✨', '🌸', '💫', '🦋', '🌹', '💝', '🥰', '💘', '🌺', '💞'];
    for (let i = 0; i < 18; i++) {
        const el = document.createElement('div');
        el.classList.add('float-el');
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.animationDelay = Math.random() * 10 + 's';
        el.style.animationDuration = (Math.random() * 5 + 7) + 's';
        el.style.fontSize = (Math.random() * 16 + 14) + 'px';
        container.appendChild(el);
    }
}

createParticles();
createFloatingElements();

// ============= HEART CLICK =============
const heartEmojis = ['💕', '💖', '💗', '💝', '💘', '💞', '🌸', '✨', '🦋'];
document.addEventListener('click', function(e) {
    if (e.target.closest('button, a, input, select')) return;
    spawnHeart(e.clientX, e.clientY);
    playClickSound();
});

function spawnHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'click-heart';
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.fontSize = (Math.random() * 15 + 25) + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
}


// ============= SOUND =============
let audioCtx = null;
let soundEnabled = true;

function getAudioCtx() {
    if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (e) { return null; }
    }
    return audioCtx;
}

function playClickSound() {
    if (!soundEnabled) return;
    const ctx = getAudioCtx(); if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 800 + Math.random() * 400;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(); osc.stop(ctx.currentTime + 0.1);
}

function playSlideSound() {
    if (!soundEnabled) return;
    const ctx = getAudioCtx(); if (!ctx) return;
    [523, 659, 784].forEach((freq, i) => {
        setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.start(); osc.stop(ctx.currentTime + 0.15);
        }, i * 80);
    });
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundBtn');
    if (btn) btn.textContent = soundEnabled ? '🔊' : '🔇';
}

function spawnConfetti() {
    const colors = ['🎊', '🎉', '💖', '✨', '💝', '🌸', '⭐', '💫', '🌟'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const c = document.createElement('div');
            c.className = 'confetti-piece';
            c.textContent = colors[Math.floor(Math.random() * colors.length)];
            c.style.left = Math.random() * 100 + '%';
            c.style.fontSize = (Math.random() * 15 + 18) + 'px';
            c.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 4000);
        }, i * 50);
    }
}


// ============= URL PARAMS =============
const urlParams = new URLSearchParams(window.location.search);
const nama = urlParams.get('nama');
const hubungan = urlParams.get('hubungan');
const apiKey = urlParams.get('key');
const dari = urlParams.get('dari');
const tema = urlParams.get('tema') || 'romantis';
const panjang = urlParams.get('panjang') || 'panjang';
const cerita = urlParams.get('cerita') || '';

const namaSlide1 = document.getElementById('namaSlide1');
const namaSlide3 = document.getElementById('namaSlide3');
const fromName = document.getElementById('fromName');
if (namaSlide1) namaSlide1.textContent = nama || 'Sayang';
if (namaSlide3) namaSlide3.textContent = nama || 'Sayang';
if (fromName && dari) fromName.textContent = dari;

const loadingMessages = [
    'Sedang menulis pesan cinta...',
    'Mencari kata-kata terindah...',
    'Memetik bunga mawar untukmu...',
    'Mengetik dengan sepenuh hati...',
    'Mengumpulkan kata-kata bucin...',
    'Membuat hatimu meleleh...',
    'Sebentar ya, lagi mikirin kamu...',
    'Lagi nyari diksi terbaik...'
];
let loadingMsgInterval = null;

function startLoadingRotation() {
    const el = document.getElementById('loadingText');
    if (!el) return;
    let idx = 0;
    loadingMsgInterval = setInterval(() => {
        idx = (idx + 1) % loadingMessages.length;
        el.style.opacity = '0';
        setTimeout(() => {
            el.textContent = loadingMessages[idx];
            el.style.opacity = '1';
        }, 200);
    }, 2000);
}

function stopLoadingRotation() {
    if (loadingMsgInterval) clearInterval(loadingMsgInterval);
}

let aiResultReady = false;
let aiResultParts = null;
let currentSlide = 0;
const totalSlides = 6;

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (currentSlide >= totalSlides - 1) return;
    
    playSlideSound();
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].classList.add('exit-left');
    currentSlide++;
    setTimeout(() => {
        slides[currentSlide - 1].classList.remove('exit-left');
        slides[currentSlide].classList.add('active');
        dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
        updateNavButtons();
    }, 300);

    if (currentSlide === 2 && aiResultReady) startTypingP1();
    if (currentSlide === 5) setTimeout(spawnConfetti, 400);
}

function prevSlide() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (currentSlide <= 0) return;
    playSlideSound();
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].style.transform = 'translateX(100%)';
    setTimeout(() => { slides[currentSlide].style.transform = ''; }, 500);
    currentSlide--;
    slides[currentSlide].classList.remove('exit-left');
    slides[currentSlide].classList.add('active');
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    updateNavButtons();
}

function updateNavButtons() {
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) prevBtn.style.display = currentSlide > 0 ? '' : 'none';
}

function showError(msg) {
    const slides = document.querySelectorAll('.slide');
    slides[currentSlide].classList.remove('active');
    const errSlide = document.getElementById('slideError');
    errSlide.style.display = '';
    errSlide.classList.add('active');
    const errMsg = document.getElementById('errorMessage');
    if (errMsg) errMsg.textContent = msg;
}


// ============= GENERATE MESSAGE (6 PARTS, AI for ALL slides) =============
async function generateRomanticMessage() {
    if (!nama || !hubungan || !apiKey) {
        showError('Link tidak lengkap. Pastikan link berisi nama, hubungan, dan API key.');
        return;
    }

    startLoadingRotation();

    const models = ['gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    const hubunganText = {
        'pacar': 'pacar tercinta',
        'suami': 'suami tersayang',
        'istri': 'istri tercinta',
        'gebetan': 'gebetan, orang yang sedang aku taksir diam-diam',
        'mantan': 'mantan kekasih yang masih ada di hati',
        'sahabat': 'sahabat paling spesial',
        'crush': 'crush yang aku kagumi diam-diam',
        'calon': 'calon pasangan hidup'
    };

    const temaPrompt = {
        'romantis': 'ROMANTIS KLASIK - lembut, puitis, menyentuh hati. Diksi indah seperti "kekasih", "belahan jiwa", "cintaku", "mentariku".',
        'bucin': 'BUCIN ABIS - lebay, manja, kekinian, full "sayangku/cintaku/bidadariku/pangeranku". Pakai perumpamaan absurd: "rela jadi sandal jepit kamu", "aku adalah debu di kakimu", "tanpa kamu hidupku gak ada notif". Cringe tapi manis.',
        'puitis': 'PUITIS sastrawi. Penuh metafora indah tentang bulan, bintang, samudra, hujan, senja, daun gugur. Bagai puisi Sapardi atau Chairil Anwar versi cinta.',
        'lucu': 'ROMANTIS + LUCU dan KOCAK. Selipkan banyak jokes receh, plesetan, perumpamaan absurd-manis. Contoh: "Kamu kayak charger, hidupku gak nyala tanpa kamu", "Aku tuh kayak WiFi, kamu passwordnya yang gak pernah lupa", "Kamu kayak indomie, gak pernah bosen". WAJIB minimal 5 jokes berbeda.',
        'rindu': 'RINDU MENDALAM. Penuh deskripsi rindu yang menyiksa tapi indah. Kangen suara, tatapan, senyum, sentuhan, aroma.',
        'malam': 'UCAPAN SELAMAT MALAM. Bicarakan mimpi, bintang, bulan, tidur nyenyak, peluk dalam imajinasi, doa baik. Hangat dan menenangkan.',
        'gombal': 'GOMBAL SUPER LEBAY. Rayuan playboy ahli. WAJIB minimal 6 gombalan kreatif berbeda. Contoh: "Kamu Google ya? Karena di kamu aku menemukan segalanya", "Apa kamu kacamata? Karena tanpa kamu hidupku buram".',
        'drama': 'DRAMA KOREA dramatis. Cinta penuh perjuangan, takdir, jodoh, sampai akhir hayat. Monolog drakor bikin nangis.',
        'tsundere': 'TSUNDERE - awalnya jutek/galak/malu (tsun) tapi diam-diam super cinta (dere). "B-bukan berarti aku sayang kamu kok jangan ge-er!". Lucu, gemas, kontradiktif.',
        'puisi': 'Murni PUISI INDAH. Bait dengan rima/ritme. Pakai majas dan diksi luar biasa.',
        'anniversary': 'UCAPAN ANNIVERSARY. Syukur dan cinta untuk perjalanan bersama. Singgung kenangan, perjuangan, harapan ke depan.',
        'permintaan_maaf': 'PERMINTAAN MAAF TULUS. Akui kesalahan, sesal mendalam, janji perubahan konkret.',
        'ldr': 'LDR. Tentang jarak yang memisahkan tapi cinta mendekatkan. Bicara menunggu, video call, rindu, mimpi bertemu.'
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
        'Selipkan referensi ke hal sehari-hari romantis (mie ayam, ngopi, hujan).',
        'Tambahkan pertanyaan retoris puitis ("Tahukah kamu...?").',
        'Selipkan satu kata bahasa daerah/asing romantis.',
        'Buat kalimat sangat singkat tapi powerful (3-5 kata) di tengah.',
        'Tambahkan janji konkret yang spesifik dan unik.',
        'Selipkan kalimat tentang detik dan waktu yang puitis.',
        'Buat momen "aku ingin..." yang detail dan menyentuh.',
        'Selipkan pengakuan kecil yang gak biasa diceritakan.',
        'Buat satu kalimat yang bermain dengan kata-kata (wordplay).'
    ];
    const shuffled = [...bumbuList].sort(() => 0.5 - Math.random());
    const bumbus = shuffled.slice(0, 3);

    const ceritaContext = cerita ? `\n\nKONTEKS PERSONAL TENTANG ${nama.toUpperCase()}:\n"${cerita}"\n\nIntegrasikan info ini SECARA NATURAL ke pesan. Pilih yang paling menyentuh, jangan paksa semua masuk.` : '';


    const prompt = `Kamu adalah Pujangga Cinta Indonesia. Karyamu sering viral di TikTok dan IG karena selalu BIKIN BAPER MAKSIMAL. Kamu ahli membuat pesan yang TERASA NYATA, PERSONAL, dan EMOSIONAL.

TUGAS: Tulis pesan cinta untuk "${nama}" yang merupakan ${hubunganText[hubungan] || hubungan} dari saya${dari ? ` (pengirim: "${dari}")` : ''}.

GAYA: ${temaPrompt[tema] || temaPrompt['romantis']}

BUMBU KREATIF (WAJIB diintegrasikan natural):
1. ${bumbus[0]}
2. ${bumbus[1]}
3. ${bumbus[2]}
${ceritaContext}

============================================
FORMAT OUTPUT - WAJIB 6 BAGIAN, dipisah "---" di baris kosong:

BAGIAN 1 - GREETING (1 KALIMAT singkat 5-15 kata):
Sapaan UNIK & KREATIF untuk "${nama}". JANGAN tulis "Hai ${nama}". Buat yang BEDA setiap kali.
Variasi contoh: "Sebelum kamu tutup ini, baca dulu sampai habis ya, ${nama}." atau "${nama}ku, izinkan aku jujur sekali ini..." atau "Kalau hatiku adalah buku, halaman terdepannya kamu, ${nama}." atau "Diam-diam aku menulis ini sambil senyum sendiri, ${nama}."

BAGIAN 2 - TEASER (1-2 KALIMAT singkat, 15-30 kata):
Bikin penasaran sebelum masuk pesan utama. Kalimat menggantung yang bikin ingin baca terus. JANGAN pakai "Kamu tau gak sih?". Variasikan!
Contoh: "Aku punya satu rahasia yang gak pernah aku bilang ke siapa-siapa." atau "Ada hal yang udah lama aku pendam, dan hari ini aku mau ungkapkan." atau "Sebenarnya pesan ini sudah aku tulis berkali-kali di kepala."

BAGIAN 3 - PEMBUKA UTAMA (${spec.ksb}):
Ungkapan cinta yang dalam. Sebutkan nama "${nama}" natural. Kalimat pertama harus MEMORABLE. Ungkapkan betapa berartinya dia.

BAGIAN 4 - DETAIL & ALASAN (${spec.ksb}):
Hal SPESIFIK yang bikin jatuh cinta. Detail personal: senyum, tatapan, suara tawa, kebiasaan kecil. Buat seolah benar-benar mengenal dia. Sebut detail yang gak biasa.

BAGIAN 5 - JANJI & HARAPAN (${spec.ksb}):
Komitmen, janji, harapan masa depan. Spesifik dan tulus. Hindari janji generik.

BAGIAN 6 - PENUTUP KILLER (4-6 kalimat):
Penutup yang akan diingat selamanya. Sangat memorable. Bisa kalimat puitis powerful + penegasan cinta.

============================================
ATURAN KETAT:
- TEPAT 6 bagian dipisah "---" di baris kosong
- Total minimal ${spec.kata} kata
- Bahasa Indonesia natural & mengalir
- TANPA emoji
- TANPA markdown (** ## -)
- TANPA label "Bagian X:"
- Variatif - tiap generate harus berbeda
- Sebutkan "${nama}" minimal 3x
- KREATIF maksimal pada bagian 1 dan 2

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
                        temperature: 1.2,
                        maxOutputTokens: spec.tokens,
                        topP: 0.95,
                        topK: 40
                    }
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                lastError = `${model}: ${response.status} - ${errData.error?.message || 'Error'}`;
                continue;
            }

            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const text = data.candidates[0].content.parts[0].text;
                stopLoadingRotation();
                processAIResult(text);
                return;
            }
            lastError = `${model}: Response kosong`;
        } catch (error) {
            lastError = `${model}: ${error.message}`;
        }
    }

    stopLoadingRotation();
    showError(`Gagal memuat pesan. ${lastError}`);
}


function processAIResult(fullText) {
    const parts = fullText.split('---').map(p => p.trim()).filter(p => p.length > 0);
    aiResultParts = parts;
    aiResultReady = true;

    // Slide 1: AI Greeting (replace hardcoded)
    const aiGreeting = document.getElementById('aiGreeting');
    if (aiGreeting && parts[0]) aiGreeting.textContent = parts[0];

    // Slide 2: AI Teaser (replace hardcoded)
    const aiTeaser = document.getElementById('aiTeaser');
    if (aiTeaser && parts[1]) aiTeaser.textContent = parts[1];

    // Slides 3-6 messages
    const p1 = document.getElementById('messageP1');
    const p2 = document.getElementById('messageP2');
    const p3 = document.getElementById('messageP3');
    const p4 = document.getElementById('messageP4');

    if (currentSlide === 2) {
        startTypingP1();
    } else {
        if (p1) p1.textContent = parts[2] || '';
    }
    
    if (p2) p2.textContent = parts[3] || '';
    if (p3) p3.textContent = parts[4] || '';
    if (p4) p4.textContent = parts[5] || '';

    const loading = document.getElementById('loadingSlide3');
    const nextBtn3 = document.getElementById('nextBtn3');
    if (loading) loading.style.display = 'none';
    if (nextBtn3) nextBtn3.style.display = '';
}

function startTypingP1() {
    const p1 = document.getElementById('messageP1');
    const loading = document.getElementById('loadingSlide3');
    const nextBtn3 = document.getElementById('nextBtn3');
    if (!aiResultParts) return;
    if (loading) loading.style.display = 'none';
    typeWriter(p1, aiResultParts[2] || '').then(() => {
        if (nextBtn3) nextBtn3.style.display = '';
    });
}

async function typeWriter(element, text) {
    if (!element) return;
    element.textContent = '';
    const chars = text.split('');
    const speed = chars.length > 500 ? 4 : 6;
    for (let i = 0; i < chars.length; i++) {
        element.textContent += chars[i];
        await new Promise(r => setTimeout(r, speed));
    }
}

function copyMessage() {
    if (!aiResultParts) { showToast('⏳ Tunggu pesan selesai dimuat'); return; }
    const fromText = dari ? `\n\n— ${dari}` : '';
    const fullMsg = `Untuk ${nama}\n\n${aiResultParts[0] || ''}\n\n${aiResultParts[1] || ''}\n\n${aiResultParts[2] || ''}\n\n${aiResultParts[3] || ''}\n\n${aiResultParts[4] || ''}\n\n${aiResultParts[5] || ''}${fromText}`;
    navigator.clipboard.writeText(fullMsg).then(() => {
        showToast('✅ Pesan disalin!');
    }).catch(() => {
        const t = document.createElement('textarea');
        t.value = fullMsg;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
        showToast('✅ Pesan disalin!');
    });
}

function shareMessage() {
    if (!aiResultParts) { showToast('⏳ Tunggu pesan selesai dimuat'); return; }
    const fromText = dari ? `\n\n— ${dari}` : '';
    const fullMsg = `Untuk ${nama} 💌\n\n${aiResultParts[2] || ''}\n\n${aiResultParts[3] || ''}\n\n${aiResultParts[4] || ''}\n\n${aiResultParts[5] || ''}${fromText}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMsg)}`, '_blank');
}

function showToast(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

let touchStartX = 0;
let touchStartY = 0;
document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
});
document.addEventListener('touchend', e => {
    const diffX = touchStartX - e.changedTouches[0].screenX;
    const diffY = Math.abs(touchStartY - e.changedTouches[0].screenY);
    if (diffY < 100) {
        if (diffX > 50) nextSlide();
        else if (diffX < -50) prevSlide();
    }
});

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') nextSlide();
    else if (e.key === 'ArrowLeft') prevSlide();
});

// Start AI generation IMMEDIATELY on page load (before user clicks)
generateRomanticMessage();
