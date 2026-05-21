// Create particles
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
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
    const emojis = ['💕', '💗', '✨', '🌸', '💫', '🦋', '🌹', '💝', '🥰', '💘'];
    for (let i = 0; i < 15; i++) {
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

// Get URL params
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

// Slide management
let currentSlide = 0;
const totalSlides = 6;

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (currentSlide >= totalSlides - 1) return;
    
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].classList.add('exit-left');
    
    currentSlide++;
    
    setTimeout(() => {
        slides[currentSlide - 1].classList.remove('exit-left');
        slides[currentSlide].classList.add('active');
        dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }, 300);

    if (currentSlide === 2) {
        generateRomanticMessage();
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

// Generate message
async function generateRomanticMessage() {
    if (!nama || !hubungan || !apiKey) {
        showError('Link tidak lengkap. Pastikan link berisi nama, hubungan, dan API key.');
        return;
    }

    const models = ['gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    const hubunganText = {
        'pacar': 'pacar tercinta',
        'suami': 'suami tersayang',
        'istri': 'istri tercinta',
        'gebetan': 'gebetan (orang yang disukai)',
        'mantan': 'mantan yang masih dirindukan',
        'sahabat': 'sahabat paling spesial',
        'crush': 'orang yang diam-diam disukai'
    };

    const temaPrompt = {
        'romantis': 'Gunakan gaya bahasa romantis klasik yang menyentuh hati, penuh cinta dan kelembutan.',
        'bucin': 'Gunakan gaya bahasa bucin abis, lebay tapi manis, kekinian, yang bikin cringe tapi senang.',
        'puitis': 'Gunakan gaya bahasa puitis yang sangat dalam, penuh metafora tentang cinta, bagai sajak indah.',
        'lucu': 'Gunakan gaya bahasa romantis tapi diselingi humor yang bikin tersenyum dan tertawa.',
        'rindu': 'Gunakan gaya bahasa tentang rindu yang mendalam, seolah sudah lama tidak bertemu.',
        'malam': 'Gunakan gaya ucapan selamat malam yang romantis, hangat, dan bikin tidur nyenyak.'
    };

    const prompt = `Kamu adalah penulis pesan cinta yang sangat berbakat. Buatkan pesan cinta dalam bahasa Indonesia untuk "${nama}" yang merupakan ${hubunganText[hubungan] || hubungan} saya${dari ? ` (pengirim: ${dari})` : ''}.

${temaPrompt[tema] || temaPrompt['romantis']}

PENTING: Buat TEPAT 4 bagian dipisahkan "---":

Bagian 1: Sapaan manis + ungkapan betapa berartinya dia (3-4 kalimat, sebutkan nama "${nama}")
Bagian 2: Hal-hal yang membuatmu jatuh cinta/sayang padanya (3-4 kalimat, detail & manis)
Bagian 3: Janji/harapan untuk masa depan (2-3 kalimat yang powerful)
Bagian 4: Penutup yang bikin baper (1-2 kalimat memorable)

ATURAN: Bahasa Indonesia, tanpa markdown/bullet/emoji, pisahkan dengan "---" saja.`;

    let lastError = '';

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 1.0, maxOutputTokens: 700 }
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
                displayMessages(text);
                return;
            } else {
                lastError = `${model}: Response tidak valid`;
                continue;
            }
        } catch (error) {
            lastError = `${model}: ${error.message}`;
            continue;
        }
    }

    showError(`Gagal memuat pesan. Error: ${lastError}`);
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

// Swipe support
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; });
document.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (diff > 50) nextSlide();
});
