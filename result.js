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
        'gebetan': 'gebetan (orang yang sedang aku taksir)',
        'mantan': 'mantan yang masih dirindukan',
        'sahabat': 'sahabat paling spesial',
        'crush': 'crush diam-diam',
        'calon': 'calon pasangan hidup'
    };

    const temaPrompt = {
        'romantis': 'Gaya bahasa romantis klasik yang menyentuh hati, lembut, penuh cinta seperti puisi cinta.',
        'bucin': 'Gaya bahasa BUCIN ABIS, lebay tapi manis, kekinian, penuh kata-kata "cintaku", "sayangku", "bidadariku/pangeranku", yang bikin cringe tapi senang. Pakai kata-kata gak masuk akal kayak "rela jadi sandal jepit kamu", "aku adalah debu di kakimu".',
        'puitis': 'Gaya puitis sangat dalam, penuh metafora cinta tentang bulan, bintang, samudra, hujan, senja. Bagai sajak indah Sapardi atau Chairil Anwar versi cinta.',
        'lucu': 'Gaya romantis tapi LUCU dan KOCAK. Selipkan jokes receh, plesetan kata, atau perumpamaan absurd tapi manis. Contoh: "Kamu kayak charger, hidupku gak nyala tanpa kamu", "Aku tuh kayak WiFi, dan kamu adalah passwordnya". Bikin tersenyum dan ngakak.',
        'rindu': 'Gaya tentang RINDU yang sangat mendalam, seolah sudah lama gak ketemu. Penuh dengan deskripsi rasa rindu yang menyiksa tapi indah, kangen suara, kangen tatapan, kangen semuanya.',
        'malam': 'Gaya ucapan SELAMAT MALAM yang romantis. Bicarakan tentang mimpi, bintang, tidur nyenyak, rindu di malam hari, ingin memeluk dalam tidur.',
        'gombal': 'Gaya GOMBAL super lebay, kayak rayuan playboy. Pakai gombalan klasik plus yang baru-baru kayak "Kamu Google ya? Karena di kamu aku menemukan segalanya". Buat banyak gombalan beruntun yang bikin meleleh.',
        'drama': 'Gaya kayak DRAMA KOREA yang dramatis. Cinta yang penuh perjuangan, episode kehidupan, takdir, jodoh, sampai mati. Buat kayak monolog drakor yang bikin nangis.',
        'tsundere': 'Gaya TSUNDERE - awalnya tsun (jutek/galak/malu-malu) tapi diam-diam dere (cinta banget). Contoh: "B-bukan berarti aku sayang kamu kok, jangan ge-er!" tapi terus bilang sayang. Lucu dan gemes.',
        'puisi': 'Tulis dalam bentuk PUISI INDAH dengan bait-bait yang puitis. Setiap kalimat punya rima atau ritme.'
    };

    // Random bumbu untuk variasi
    const bumbuRandom = [
        'Selipkan satu kata atau frasa unik yang gak biasa.',
        'Gunakan satu perumpamaan kreatif yang tidak biasa.',
        'Buat satu kalimat yang sangat memorable di tengah-tengah.',
        'Tambahkan referensi ke hal sehari-hari (kopi, hujan, mie ayam, dll) yang romantis.',
        'Selipkan sentuhan humor halus di salah satu bagian.',
        'Buat ada plot twist kecil yang manis.'
    ];
    const bumbu = bumbuRandom[Math.floor(Math.random() * bumbuRandom.length)];

    const prompt = `Kamu adalah penulis pesan cinta paling jago di Indonesia, ahli dalam membuat pesan yang viral di sosmed. Buatkan pesan cinta untuk "${nama}" yang merupakan ${hubunganText[hubungan] || hubungan} saya${dari ? ` dari "${dari}"` : ''}.

GAYA: ${temaPrompt[tema] || temaPrompt['romantis']}

BUMBU TAMBAHAN: ${bumbu}

PENTING - Format output WAJIB seperti ini, TEPAT 4 bagian dipisahkan "---":

Bagian 1 (PEMBUKA - 4-5 kalimat): Sapaan unik untuk "${nama}". Ungkapkan betapa berartinya dia. Buat opening yang langsung bikin baper sejak kalimat pertama. Sebutkan nama "${nama}".

Bagian 2 (DETAIL - 4-5 kalimat): Ceritakan hal-hal SPESIFIK yang bikin jatuh cinta - bisa tentang senyum, suara, cara dia tertawa, kebiasaan kecil, atau apapun. Buat detail dan personal seolah benar-benar mengenal dia.

Bagian 3 (JANJI/HARAPAN - 3-4 kalimat): Tentang masa depan, janji, harapan, atau komitmen. Buat sangat dalam dan berkesan.

Bagian 4 (PENUTUP - 2-3 kalimat): Penutup yang KILLER, memorable, bikin nangis bahagia. Akhiri dengan kalimat yang akan diingat selamanya.

ATURAN KETAT:
- Total minimal 200 kata
- Bahasa Indonesia natural
- Tanpa markdown/bullet/emoji/format apapun
- Pisahkan 4 bagian HANYA dengan "---" di baris baru
- Variatif dan jangan generik
- Buat sangat personal seolah benar-benar mengenal "${nama}"
- Output harus berbeda setiap kali bahkan untuk input yang sama (kreatif!)`;

    let lastError = '';

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 1.2, maxOutputTokens: 1000, topP: 0.95 }
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
