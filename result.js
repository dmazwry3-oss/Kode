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
const dari = urlParams.get('dari');
const encodedMsg = urlParams.get('msg');

const namaSlide1 = document.getElementById('namaSlide1');
const namaSlide3 = document.getElementById('namaSlide3');
const fromName = document.getElementById('fromName');
if (namaSlide1) namaSlide1.textContent = nama || 'Sayang';
if (namaSlide3) namaSlide3.textContent = nama || 'Sayang';
if (fromName && dari) fromName.textContent = dari;

// ============= DECODE MESSAGE FROM URL =============
function decodeMessage(encoded) {
    try {
        // URL-safe base64 -> normal base64
        let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding
        while (b64.length % 4) b64 += '=';
        // Decode UTF-8 safe
        const utf8 = atob(b64);
        return decodeURIComponent(escape(utf8));
    } catch (e) {
        return null;
    }
}

// Robust parse - try multiple formats
function parseAndValidateParts(text) {
    if (!text) return null;
    let parts = text.split(/\n?\s*---\s*\n?/).map(p => p.trim()).filter(p => p.length > 5);
    if (parts.length < 6) {
        const numbered = text.split(/\n?\s*\[(?:\d+|BAGIAN\s*\d+)\]\s*\n?/i).map(p => p.trim()).filter(p => p.length > 5);
        if (numbered.length >= 6) parts = numbered;
    }
    if (parts.length < 6) {
        const byBagian = text.split(/\n?\s*(?:BAGIAN\s*\d+[:\.\)]?|^\d+[\.\)])\s*\n?/im).map(p => p.trim()).filter(p => p.length > 5);
        if (byBagian.length >= 6) parts = byBagian;
    }
    parts = parts.map(p => {
        return p.replace(/^(BAGIAN\s*\d+[:\.\)]?\s*[-–]?\s*[A-Z\s]*\s*[:\.\)]?)/i, '')
                .replace(/^\[\d+\][\s:]*/g, '')
                .replace(/^\d+[\.\)]\s*/g, '')
                .replace(/^[-=]+/g, '')
                .trim();
    }).filter(p => p.length > 5);
    return parts;
}

function ensureSixParts(parts, namaArg) {
    const fallbacks = [
        [`Untukmu, ${namaArg}, yang selalu kucintai dalam diam.`,
         `${namaArg}ku, izinkan aku jujur sekali ini saja.`,
         `Diam-diam aku menulis ini sambil tersenyum, ${namaArg}.`],
        [`Aku punya satu rahasia yang gak pernah aku bilang ke siapa-siapa.`,
         `Sebenarnya pesan ini sudah aku tulis berkali-kali di kepala.`,
         `Ada hal yang udah lama aku pendam, dan hari ini aku mau ungkapkan.`],
        [`${namaArg}, kamu adalah orang yang membuat hari-hariku terasa berbeda. Setiap kali aku memikirkanmu, ada perasaan hangat yang menyelinap masuk ke hati. Kamu bukan sekadar nama yang aku panggil, tapi seseorang yang kehadirannya kuingin selalu ada. Dalam keramaian dunia ini, kamulah yang paling kucari, paling kunanti, dan paling kurindu.`],
        [`Yang membuat aku jatuh cinta padamu bukan hanya satu hal, melainkan ribuan detail kecil yang menjadi kamu. Caramu tertawa, caramu menatap, bahkan caramu diam pun terasa istimewa di mataku. Kamu adalah kombinasi yang sempurna dari semua hal yang selama ini aku impikan. Setiap detik bersamamu, ${namaArg}, terasa seperti hadiah yang tidak pernah ingin aku akhiri.`],
        [`Aku berjanji akan selalu ada untukmu, dalam tawa maupun dalam tangisan. Aku akan menjadi rumah yang nyaman untukmu pulang, ${namaArg}. Apapun yang terjadi nanti, ingatlah bahwa cintaku padamu tidak akan pernah pudar oleh waktu.`],
        [`Kamu adalah halaman terindah dalam buku hidupku. Terima kasih telah menjadi alasan aku bersyukur setiap hari. ${namaArg}, aku mencintaimu, kemarin, hari ini, dan selamanya.`]
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

let aiResultParts = null;
let currentSlide = 0;
const totalSlides = 6;

// Decode message immediately when page loads
function loadMessage() {
    if (!encodedMsg) {
        showError('Link tidak valid. Tidak ada pesan di link ini.');
        return;
    }

    const text = decodeMessage(encodedMsg);
    if (!text) {
        showError('Pesan rusak atau tidak bisa dibaca.');
        return;
    }

    // Robust parse + ensure 6 parts (with fallback for missing)
    let parts = parseAndValidateParts(text) || [];
    parts = ensureSixParts(parts, nama || 'Sayang');
    aiResultParts = parts;

    // Slide 1: AI Greeting
    const aiGreeting = document.getElementById('aiGreeting');
    if (aiGreeting && parts[0]) aiGreeting.textContent = parts[0];

    // Slide 2: AI Teaser
    const aiTeaser = document.getElementById('aiTeaser');
    if (aiTeaser && parts[1]) aiTeaser.textContent = parts[1];

    // Slides 3-6 messages
    const p2 = document.getElementById('messageP2');
    const p3 = document.getElementById('messageP3');
    const p4 = document.getElementById('messageP4');
    
    if (p2) p2.textContent = parts[3] || '';
    if (p3) p3.textContent = parts[4] || '';
    if (p4) p4.textContent = parts[5] || '';

    // Hide loading initially
    const loading = document.getElementById('loadingSlide3');
    const nextBtn3 = document.getElementById('nextBtn3');
    if (loading) loading.style.display = 'none';
    if (nextBtn3) nextBtn3.style.display = '';

    // Pre-fill P1 (will be re-typed when reaching slide 3)
    const p1 = document.getElementById('messageP1');
    if (p1) p1.textContent = parts[2] || '';
}

// ============= SLIDE MANAGEMENT =============
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

    if (currentSlide === 2) startTypingP1();
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

function startTypingP1() {
    const p1 = document.getElementById('messageP1');
    if (!aiResultParts || !p1) return;
    typeWriter(p1, aiResultParts[2] || '');
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

function showError(msg) {
    const slides = document.querySelectorAll('.slide');
    slides[currentSlide].classList.remove('active');
    const errSlide = document.getElementById('slideError');
    errSlide.style.display = '';
    errSlide.classList.add('active');
    const errMsg = document.getElementById('errorMessage');
    if (errMsg) errMsg.textContent = msg;
}


// ============= COPY & SHARE =============
function copyMessage() {
    if (!aiResultParts) { showToast('⏳ Pesan belum dimuat'); return; }
    const fromText = dari ? `\n\n— ${dari}` : '';
    const fullMsg = `Untuk ${nama}\n\n${aiResultParts[0] || ''}\n\n${aiResultParts[1] || ''}\n\n${aiResultParts[2] || ''}\n\n${aiResultParts[3] || ''}\n\n${aiResultParts[4] || ''}\n\n${aiResultParts[5] || ''}${fromText}`;
    navigator.clipboard.writeText(fullMsg).then(() => {
        showToast('✅ Pesan disalin!');
    }).catch(() => {
        const t = document.createElement('textarea');
        t.value = fullMsg; document.body.appendChild(t); t.select();
        document.execCommand('copy'); document.body.removeChild(t);
        showToast('✅ Pesan disalin!');
    });
}

function shareMessage() {
    if (!aiResultParts) { showToast('⏳ Pesan belum dimuat'); return; }
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

// Touch swipe
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

// Keyboard
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') nextSlide();
    else if (e.key === 'ArrowLeft') prevSlide();
});

// Load message immediately on page load
loadMessage();
