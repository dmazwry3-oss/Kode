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

// ============= HEART CLICK EFFECT =============
const heartEmojis = ['💕', '💖', '💗', '💝', '💘', '💞', '🌸', '✨', '🦋'];
document.addEventListener('click', function(e) {
    // Don't spawn on buttons/inputs
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

// ============= SOUND EFFECTS =============
let audioCtx = null;
let soundEnabled = true;

function getAudioCtx() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { return null; }
    }
    return audioCtx;
}

function playClickSound() {
    if (!soundEnabled) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800 + Math.random() * 400;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
}

function playSlideSound() {
    if (!soundEnabled) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    [523, 659, 784].forEach((freq, i) => {
        setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        }, i * 80);
    });
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundBtn');
    if (btn) btn.textContent = soundEnabled ? '🔊' : '🔇';
}

// ============= CONFETTI =============
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

// Set names
const namaSlide1 = document.getElementById('namaSlide1');
const namaSlide3 = document.getElementById('namaSlide3');
const fromName = document.getElementById('fromName');
if (namaSlide1) namaSlide1.textContent = nama || 'Sayang';
if (namaSlide3) namaSlide3.textContent = nama || 'Sayang';
if (fromName && dari) fromName.textContent = dari;

// ============= LOADING MESSAGES (random rotating) =============
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

// ============= SLIDE MANAGEMENT =============
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

    if (currentSlide === 2) {
        generateRomanticMessage();
    }
    if (currentSlide === 5) {
        setTimeout(spawnConfetti, 400);
    }
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

// ============= GENERATE MESSAGE =============
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
        'romantis': 'Gaya ROMANTIS KLASIK. Lembut, puitis, menyentuh hati seperti puisi cinta klasik. Gunakan kata-kata seperti "kekasih", "belahan jiwa", "cintaku", "mentariku".',
        'bucin': 'Gaya BUCIN ABIS. Sangat lebay, manja, kekinian, full kata "sayangku", "cintaku", "bidadariku/pangeranku". Boleh pakai perumpamaan absurd kayak "rela jadi sandal jepit kamu", "aku adalah debu di kakimu", "tanpa kamu hidupku gak ada notif". Cringe tapi manis dan menggemaskan.',
        'puitis': 'Gaya PUITIS sangat dalam dan sastra. Penuh metafora indah tentang bulan, bintang, samudra, hujan, senja, daun gugur. Bagai puisi Sapardi Djoko Damono atau Chairil Anwar versi cinta. Gunakan diksi yang indah dan tidak biasa.',
        'lucu': 'Gaya ROMANTIS + LUCU dan KOCAK. Selipkan banyak jokes receh, plesetan kata, pun, atau perumpamaan absurd tapi manis. Contoh kreatif: "Kamu kayak charger, hidupku gak nyala tanpa kamu", "Aku tuh kayak WiFi, dan kamu adalah passwordnya yang gak pernah aku lupa", "Kamu kayak indomie, gak pernah bosen aku liat", "Kamu adalah CTRL+S hidupku, bikin aku gak takut kehilangan". Bikin senyum & ngakak. WAJIB ada minimal 4 jokes.',
        'rindu': 'Gaya RINDU MENDALAM. Seolah sudah lama gak ketemu. Penuh deskripsi rasa rindu yang menyiksa tapi indah. Kangen suara, tatapan, senyum, sentuhan, aroma. Buat sangat emosional dan mendalam.',
        'malam': 'Gaya UCAPAN SELAMAT MALAM. Bicarakan tentang mimpi, bintang, bulan, tidur nyenyak, peluk dalam imajinasi, doa baik untuk dia di malam hari. Hangat dan menenangkan.',
        'gombal': 'Gaya GOMBAL SUPER LEBAY. Kayak rayuan playboy ahli. Buat MINIMAL 5 gombalan beruntun yang kreatif dan memorable. Contoh: "Kamu Google ya? Karena di kamu aku menemukan segalanya yang aku cari", "Apa kamu kacamata? Karena tanpa kamu hidupku buram", "Kamu pencuri ya? Soalnya kamu udah curi hatiku". Bikin meleleh.',
        'drama': 'Gaya DRAMA KOREA dramatis. Cinta yang penuh perjuangan, episode kehidupan, takdir, jodoh, sampai akhir hayat. Buat seperti monolog drakor yang bikin nangis. Bisa selipkan istilah seperti "takdir", "jodoh", "hingga akhir waktu".',
        'tsundere': 'Gaya TSUNDERE - awalnya jutek/galak/malu-malu (tsun) tapi diam-diam super cinta (dere). Contoh: "B-bukan berarti aku sayang kamu kok jangan ge-er!", "Hmm... bukannya aku rindu sih, cuma emang kamu suka tiba-tiba muncul di pikiran". Lucu, gemas, kontradiktif tapi manis.',
        'puisi': 'Tulis murni dalam bentuk PUISI INDAH. Bait-bait dengan rima atau ritme. Setiap baris pendek tapi indah. Pakai majas dan diksi yang luar biasa. Pisahkan baris dengan enter.',
        'anniversary': 'Gaya UCAPAN ANNIVERSARY/HARI JADI. Ungkapkan syukur dan cinta untuk perjalanan bersama. Singgung tentang kenangan, perjuangan bersama, harapan ke depan. Manis dan haru.',
        'permintaan_maaf': 'Gaya PERMINTAAN MAAF yang TULUS. Akui kesalahan dengan rendah hati, ungkapkan penyesalan mendalam, janjikan perubahan. Sangat tulus, bukan klise. Bikin dia luluh.',
        'ldr': 'Gaya LDR (LONG DISTANCE). Tentang jarak yang memisahkan tapi cinta yang mendekatkan. Bicara tentang menunggu, video call, rindu, mimpi bertemu. Penuh harapan & kesabaran.'
    };

    const panjangSpec = {
        'sedang': { katas: '300', kalimatPerBagian: '4-5 kalimat', tokens: 800 },
        'panjang': { katas: '500', kalimatPerBagian: '6-7 kalimat', tokens: 1300 },
        'sangat_panjang': { katas: '700', kalimatPerBagian: '8-10 kalimat', tokens: 1800 }
    };
    const spec = panjangSpec[panjang] || panjangSpec['panjang'];

    // Random bumbu kreatif
    const bumbuList = [
        'Selipkan satu metafora kreatif tentang kopi, hujan, atau senja.',
        'Tambahkan satu kalimat "andai" yang romantis ("andai aku bisa..." / "andai waktu...").',
        'Buat satu plot twist kecil yang manis di tengah pesan.',
        'Selipkan referensi ke hal sehari-hari yang bikin pesan terasa nyata (mie ayam, ngopi, hujan, dll).',
        'Tambahkan satu pertanyaan retoris yang puitis ("Tahukah kamu...?").',
        'Selipkan satu kata atau ungkapan dalam bahasa daerah/asing yang romantis (sayang, eonni, anata, mi amor, dll).',
        'Buat ada satu kalimat sangat singkat tapi powerful di tengah-tengah (3-5 kata saja).',
        'Tambahkan janji konkret yang spesifik dan unik.',
        'Selipkan satu kalimat tentang detik dan waktu yang puitis.',
        'Buat ada momen "aku ingin..." yang detail dan menyentuh.'
    ];
    const bumbuPicked = [
        bumbuList[Math.floor(Math.random() * bumbuList.length)],
        bumbuList[Math.floor(Math.random() * bumbuList.length)]
    ];

    // Random opener style
    const openerStyles = [
        `Mulai dengan menyebutkan nama "${nama}" langsung di awal seperti panggilan sayang.`,
        `Mulai dengan pertanyaan retoris yang menyentuh ("Tahukah kamu, ${nama}...").`,
        `Mulai dengan deskripsi suasana atau perasaan yang sedang dialami penulis sekarang.`,
        `Mulai dengan ungkapan "Untukmu yang..." diikuti deskripsi unik tentang dia.`,
        `Mulai dengan pengakuan "Aku ingin kamu tahu..." yang langsung menyentuh hati.`
    ];
    const opener = openerStyles[Math.floor(Math.random() * openerStyles.length)];

    const ceritaContext = cerita ? `\n\nKONTEKS PERSONAL TENTANG ${nama.toUpperCase()} & HUBUNGAN KAMI (PENTING - integrasikan dengan natural ke dalam pesan):\n"${cerita}"\n\nGunakan info di atas untuk membuat pesan yang SANGAT PERSONAL dan terasa benar-benar mengenal "${nama}". Jangan paksa semua info masuk, tapi pilih yang paling menyentuh dan integrasikan dengan natural.` : '';

    const prompt = `Kamu adalah penulis pesan cinta paling jago di Indonesia. Karyamu sering viral di TikTok dan Instagram karena selalu bikin baper. Kamu ahli dalam membuat pesan yang TERASA NYATA, PERSONAL, dan EMOSIONAL.

TUGAS: Tulis pesan cinta untuk "${nama}" yang merupakan ${hubunganText[hubungan] || hubungan} dari saya${dari ? ` (pengirim: "${dari}")` : ''}.

GAYA WAJIB: ${temaPrompt[tema] || temaPrompt['romantis']}

OPENING STYLE: ${opener}

BUMBU TAMBAHAN (WAJIB diintegrasikan):
1. ${bumbuPicked[0]}
2. ${bumbuPicked[1]}
${ceritaContext}

============================================
FORMAT OUTPUT - SANGAT KETAT:

Tulis TEPAT 4 bagian yang dipisahkan TANDA "---" di baris baru.

📌 Bagian 1 - PEMBUKA (${spec.kalimatPerBagian}):
- Sapaan personal untuk "${nama}"
- Ungkapan langsung tentang betapa berartinya dia
- Buat kalimat pertama yang SANGAT MEMORABLE dan instant bikin baper
- Sebutkan nama "${nama}" minimal 1x

📌 Bagian 2 - DETAIL & ALASAN (${spec.kalimatPerBagian}):
- Ceritakan SPESIFIK hal-hal yang bikin jatuh cinta/sayang
- Detail yang sangat personal: senyum, tatapan, suara tawa, kebiasaan kecil, cara dia ngomong, dll
- Buat seolah benar-benar mengenal dia dengan dalam
- Sebut detail yang gak biasa, yang bikin "wah dia tau banget"

📌 Bagian 3 - JANJI & HARAPAN (${spec.kalimatPerBagian}):
- Komitmen, janji, atau harapan untuk masa depan
- Buat sangat dalam, spesifik, dan tulus
- Hindari janji generik, buat yang konkret

📌 Bagian 4 - PENUTUP KILLER (3-5 kalimat):
- Penutup yang akan terus diingat
- Kalimat akhir yang VERY MEMORABLE
- Bisa 1 kalimat puitis powerful + 1-2 kalimat penegasan cinta

============================================
ATURAN KETAT (WAJIB DIIKUTI):
✅ Total minimal ${spec.katas} kata
✅ Bahasa Indonesia natural & mengalir
✅ Setiap kalimat punya value, gak ada filler
✅ Variatif dan tidak generik
✅ JANGAN gunakan emoji sama sekali
✅ JANGAN gunakan markdown (tanpa **, ##, -)
✅ JANGAN tulis judul atau label seperti "Bagian 1:"
✅ Pisahkan 4 bagian HANYA dengan "---" di baris kosong
✅ Setiap kali generate harus berbeda meski input sama (KREATIF!)
✅ Sebutkan nama "${nama}" minimal 2x di seluruh pesan

CONTOH STRUKTUR OUTPUT (jangan tiru kontennya, tiru hanya formatnya):

Untukmu, [nama] yang selalu kucintai... [kalimat panjang 1]. [kalimat panjang 2]. [dst]
---
Kamu tahu apa yang paling kucinta dari kamu? [kalimat panjang 1]. [kalimat panjang 2]. [dst]
---
Dan aku berjanji padamu... [kalimat panjang 1]. [kalimat panjang 2]. [dst]
---
[Kalimat penutup powerful 1]. [Kalimat akhir memorable 2].

============================================
Sekarang, tulis pesannya. Buat yang BIKIN MELELEH:`;

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
                        temperature: 1.15,
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
                displayMessages(text);
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

function displayMessages(fullText) {
    const parts = fullText.split('---').map(p => p.trim()).filter(p => p.length > 0);
    
    const p1 = document.getElementById('messageP1');
    const p2 = document.getElementById('messageP2');
    const p3 = document.getElementById('messageP3');
    const p4 = document.getElementById('messageP4');
    const loading = document.getElementById('loadingSlide3');
    const nextBtn3 = document.getElementById('nextBtn3');

    if (loading) loading.style.display = 'none';
    
    typeWriter(p1, parts[0] || 'Kamu adalah alasan aku tersenyum setiap hari...').then(() => {
        if (nextBtn3) nextBtn3.style.display = '';
    });
    
    if (p2) p2.textContent = parts[1] || 'Setiap detik bersamamu terasa begitu berharga...';
    if (p3) p3.textContent = parts[2] || 'Aku berjanji akan selalu ada untukmu...';
    if (p4) p4.textContent = parts[3] || 'Kamu segalanya bagiku, selamanya.';
}

async function typeWriter(element, text) {
    if (!element) return;
    element.textContent = '';
    const chars = text.split('');
    for (let i = 0; i < chars.length; i++) {
        element.textContent += chars[i];
        await new Promise(r => setTimeout(r, 8));
    }
}

// ============= COPY MESSAGE =============
function copyMessage() {
    const p1 = document.getElementById('messageP1')?.textContent || '';
    const p2 = document.getElementById('messageP2')?.textContent || '';
    const p3 = document.getElementById('messageP3')?.textContent || '';
    const p4 = document.getElementById('messageP4')?.textContent || '';
    const fromText = dari ? `\n\n— ${dari}` : '';
    const fullMsg = `Untuk ${nama}\n\n${p1}\n\n${p2}\n\n${p3}\n\n${p4}${fromText}`;
    
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
    const p1 = document.getElementById('messageP1')?.textContent || '';
    const p2 = document.getElementById('messageP2')?.textContent || '';
    const p3 = document.getElementById('messageP3')?.textContent || '';
    const p4 = document.getElementById('messageP4')?.textContent || '';
    const fromText = dari ? `\n\n— ${dari}` : '';
    const fullMsg = `Untuk ${nama} 💌\n\n${p1}\n\n${p2}\n\n${p3}\n\n${p4}${fromText}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMsg)}`, '_blank');
}

function showToast(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ============= SWIPE SUPPORT =============
let touchStartX = 0;
let touchStartY = 0;
document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
});
document.addEventListener('touchend', e => {
    const diffX = touchStartX - e.changedTouches[0].screenX;
    const diffY = Math.abs(touchStartY - e.changedTouches[0].screenY);
    // Only horizontal swipe
    if (diffY < 100) {
        if (diffX > 50) nextSlide();
        else if (diffX < -50) prevSlide();
    }
});

// Keyboard support
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') nextSlide();
    else if (e.key === 'ArrowLeft') prevSlide();
});
