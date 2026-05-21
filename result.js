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




// ============= BACKGROUND MUSIC (Web Audio Generated Lo-fi) =============
let musicCtx = null;
let musicPlaying = false;
let musicNodes = [];
let musicTimers = [];

function startMusic() {
    if (musicPlaying) return;
    try {
        musicCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return; }

    musicPlaying = true;
    document.getElementById('musicBtn').textContent = '🎶';

    // Romantic chord progression (in Hz)
    // C major7 - A minor7 - F major7 - G major7 (very romantic feel)
    const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 415.30], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 369.99]  // Gmaj7
    ];

    let chordIdx = 0;
    const chordDuration = 4; // seconds per chord

    function playChord() {
        if (!musicPlaying) return;
        const chord = chords[chordIdx];
        const now = musicCtx.currentTime;

        chord.forEach((freq, i) => {
            const osc = musicCtx.createOscillator();
            const gain = musicCtx.createGain();
            const filter = musicCtx.createBiquadFilter();
            
            osc.type = 'triangle';
            osc.frequency.value = freq * (i === 0 ? 0.5 : 1); // bass note octave down
            
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            filter.Q.value = 1;
            
            // Soft envelope
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.5);
            gain.gain.linearRampToValueAtTime(0.03, now + chordDuration - 0.5);
            gain.gain.linearRampToValueAtTime(0, now + chordDuration);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(musicCtx.destination);
            
            osc.start(now);
            osc.stop(now + chordDuration);
            musicNodes.push(osc);
        });

        // Sparkle melody on top occasionally
        if (Math.random() > 0.4) {
            const melodyNotes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
            for (let i = 0; i < 3; i++) {
                const t = now + Math.random() * chordDuration;
                const note = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
                const osc = musicCtx.createOscillator();
                const gain = musicCtx.createGain();
                osc.type = 'sine';
                osc.frequency.value = note;
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.02, t + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
                osc.connect(gain);
                gain.connect(musicCtx.destination);
                osc.start(t);
                osc.stop(t + 0.5);
            }
        }

        chordIdx = (chordIdx + 1) % chords.length;
        const timer = setTimeout(playChord, chordDuration * 1000);
        musicTimers.push(timer);
    }
    playChord();
}

function stopMusic() {
    musicPlaying = false;
    musicTimers.forEach(t => clearTimeout(t));
    musicTimers = [];
    if (musicCtx) {
        try { musicCtx.close(); } catch (e) {}
        musicCtx = null;
    }
    document.getElementById('musicBtn').textContent = '🎵';
}

function toggleMusic() {
    if (musicPlaying) stopMusic();
    else startMusic();
}

// ============= READ ALOUD (Browser Speech Synthesis) =============
let speakingNow = false;
function readAloud() {
    if (!aiResultParts) { showToast('⏳ Pesan belum dimuat'); return; }
    
    if (speakingNow) {
        window.speechSynthesis.cancel();
        speakingNow = false;
        document.getElementById('readBtn').textContent = '🔉';
        return;
    }
    
    if (!('speechSynthesis' in window)) {
        showToast('❌ Browser tidak mendukung suara');
        return;
    }

    const fullText = aiResultParts.join('. ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    
    // Try to use Indonesian voice
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.startsWith('id'));
    if (idVoice) utterance.voice = idVoice;
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    utterance.onend = () => {
        speakingNow = false;
        document.getElementById('readBtn').textContent = '🔉';
    };
    
    speakingNow = true;
    document.getElementById('readBtn').textContent = '⏸';
    showToast('🔉 Membaca pesan...');
    window.speechSynthesis.speak(utterance);
}

// ============= READING MODE =============
function toggleReadingMode() {
    const overlay = document.getElementById('readingOverlay');
    if (overlay.classList.contains('hidden')) {
        // Populate
        document.getElementById('readingNama').textContent = nama || 'Sayang';
        const body = document.getElementById('readingBody');
        if (aiResultParts) {
            body.innerHTML = aiResultParts.map((p, i) => 
                `<p class="reading-paragraph${i < 2 ? ' reading-intro' : ''}">${p}</p>`
            ).join('');
        }
        const footer = document.getElementById('readingFooter');
        footer.innerHTML = dari ? `<p class="reading-from">— ${dari}</p>` : '';
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

// ============= SAVE AS IMAGE (Canvas) =============
function saveAsImage() {
    if (!aiResultParts) { showToast('⏳ Pesan belum dimuat'); return; }
    
    showToast('📷 Membuat gambar...');
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 1080;
    canvas.height = 1920;
    
    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, '#ff6b9d');
    grad.addColorStop(0.5, '#c44569');
    grad.addColorStop(1, '#a855f7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
    
    // Decorative hearts in background
    ctx.font = '48px serif';
    ctx.globalAlpha = 0.15;
    const decorEmojis = ['💕', '💖', '🌸', '✨', '💗'];
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 1080;
        const y = Math.random() * 1920;
        ctx.fillText(decorEmojis[i % decorEmojis.length], x, y);
    }
    ctx.globalAlpha = 1;
    
    // White card area
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    roundRect(ctx, 60, 200, 960, 1520, 40);
    ctx.fill();
    
    // Title decoration
    ctx.font = '72px serif';
    ctx.textAlign = 'center';
    ctx.fillText('💌', 540, 320);
    
    // "Untukmu, [nama]" 
    ctx.fillStyle = '#c44569';
    ctx.font = 'italic 64px "Georgia", serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Untukmu, ${nama || 'Sayang'}`, 540, 420);
    
    // Decorative line
    ctx.strokeStyle = '#e8c0d0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(390, 460);
    ctx.lineTo(690, 460);
    ctx.stroke();
    
    // Body text - wrap & render
    ctx.fillStyle = '#444';
    ctx.font = '32px "Georgia", serif';
    ctx.textAlign = 'left';
    
    const fullText = aiResultParts.slice(2, 6).join('\n\n');
    const wrapped = wrapText(ctx, fullText, 880);
    let yPos = 540;
    const lineHeight = 48;
    const maxY = 1620;
    
    for (const line of wrapped) {
        if (yPos > maxY) {
            ctx.font = 'italic 28px serif';
            ctx.fillStyle = '#999';
            ctx.fillText('...', 100, yPos);
            break;
        }
        ctx.fillText(line, 100, yPos);
        yPos += lineHeight;
    }
    
    // From section
    if (yPos < maxY - 100) {
        yPos += 40;
        ctx.fillStyle = '#999';
        ctx.font = 'italic 28px serif';
        ctx.textAlign = 'center';
        ctx.fillText('Dengan segenap cinta,', 540, yPos);
        yPos += 50;
        ctx.fillStyle = '#c44569';
        ctx.font = 'italic 48px "Brush Script MT", cursive';
        ctx.fillText(dari || 'Seseorang yang menyayangimu', 540, yPos);
    }
    
    // Footer brand
    ctx.fillStyle = '#999';
    ctx.font = '24px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💌 Dmaz Coba Coba', 540, 1870);
    
    // Convert to image and download
    canvas.toBlob(function(blob) {
        const link = document.createElement('a');
        link.download = `pesan-untuk-${(nama || 'sayang').replace(/\s+/g, '-')}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        showToast('✅ Gambar tersimpan!');
    }, 'image/png');
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function wrapText(ctx, text, maxWidth) {
    const lines = [];
    const paragraphs = text.split('\n');
    for (const para of paragraphs) {
        if (!para.trim()) { lines.push(''); continue; }
        const words = para.split(' ');
        let line = '';
        for (const word of words) {
            const testLine = line + word + ' ';
            const w = ctx.measureText(testLine).width;
            if (w > maxWidth && line) {
                lines.push(line.trim());
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        if (line) lines.push(line.trim());
        lines.push('');
    }
    return lines;
}

// ============= REACTION =============
const reactionsCount = {};
function reactWith(emoji) {
    reactionsCount[emoji] = (reactionsCount[emoji] || 0) + 1;
    
    // Big explosion of that emoji
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'reaction-explosion';
            el.textContent = emoji;
            el.style.left = (40 + Math.random() * 20) + '%';
            el.style.top = (50 + Math.random() * 20) + '%';
            el.style.fontSize = (Math.random() * 30 + 30) + 'px';
            const angle = Math.random() * 360;
            const distance = 100 + Math.random() * 200;
            el.style.setProperty('--tx', Math.cos(angle * Math.PI / 180) * distance + 'px');
            el.style.setProperty('--ty', Math.sin(angle * Math.PI / 180) * distance + 'px');
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2000);
        }, i * 30);
    }
    
    showToast(`${emoji} Reaksi terkirim!`);
    playSlideSound();
    
    // Save reactions to localStorage
    try {
        const key = `reactions_${nama}_${dari || 'anonymous'}`;
        const stored = JSON.parse(localStorage.getItem(key) || '{}');
        stored[emoji] = (stored[emoji] || 0) + 1;
        stored.lastReact = Date.now();
        localStorage.setItem(key, JSON.stringify(stored));
    } catch (e) {}
}
