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
    
    // Hide current
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].classList.add('exit-left');
    
    currentSlide++;
    
    // Show next
    setTimeout(() => {
        slides[currentSlide - 1].classList.remove('exit-left');
        slides[currentSlide].classList.add('active');
        
        // Update dots
        dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }, 300);

    // Generate message when reaching slide 3
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

// Generate message using Gemini AI
async function generateRomanticMessage() {
    if (!nama || !hubungan || !apiKey) {
        showError('Link tidak lengkap. Pastikan link berisi nama, hubungan, dan API key.');
        return;
    }

    const models = ['gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    const hubunganText = {
        'pacar': 'pacar',
        'suami': 'suami',
        'istri': 'istri',
        'gebetan': 'gebetan (orang yang disukai)',
        'mantan': 'mantan kekasih',
        'sahabat': 'sahabat spesial',
        'crush': 'orang yang diam-diam disukai'
    };

    const prompt = `Kamu adalah penulis pesan cinta yang sangat romantis dan bucin. Buatkan pesan cinta yang SANGAT PANJANG dan SANGAT ROMANTIS dalam bahasa Indonesia untuk seseorang bernama "${nama}" yang merupakan ${hubunganText[hubungan] || hubungan} saya${dari ? ` (dari ${dari})` : ''}.

PENTING: Buat pesan yang dibagi menjadi TEPAT 4 bagian, dipisahkan dengan tanda "---". Setiap bagian harus cukup panjang (minimal 3-4 kalimat).

Bagian 1: Ungkapan perasaan yang dalam dan puitis tentang betapa berartinya dia. Sebutkan nama "${nama}". Buat sangat menyentuh dan bikin baper.

Bagian 2: Ceritakan hal-hal kecil yang membuat kamu jatuh cinta padanya. Buat detail dan romantic. Gunakan bahasa yang sangat manis dan bucin abis.

Bagian 3: Janji-janji romantis untuk masa depan bersama. Buat yang bikin meleleh hatinya. Ungkapkan komitmen dan dedikasi.

Bagian 4: Penutup yang sangat romantis dan bikin nangis bahagia. Buat singkat tapi powerful. Akhiri dengan kalimat cinta yang memorable.

ATURAN:
- Bahasa Indonesia puitis dan romantis
- Tanpa markdown/bullet/emoji
- Pisahkan 4 bagian dengan "---"
- Setiap bagian 2-3 kalimat yang powerful
- Se-bucin mungkin`;

    let lastError = '';

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 1.0, maxOutputTokens: 800 }
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
    // Split by --- separator
    const parts = fullText.split('---').map(p => p.trim()).filter(p => p.length > 0);
    
    const p1 = document.getElementById('messageP1');
    const p2 = document.getElementById('messageP2');
    const p3 = document.getElementById('messageP3');
    const p4 = document.getElementById('messageP4');
    const loading = document.getElementById('loadingSlide3');
    const nextBtn3 = document.getElementById('nextBtn3');

    // Hide loading, show message with typing effect
    if (loading) loading.style.display = 'none';
    
    typeWriter(p1, parts[0] || 'Kamu adalah alasan kenapa aku tersenyum setiap hari...').then(() => {
        if (nextBtn3) nextBtn3.style.display = '';
    });
    
    // Set other parts immediately (they'll be revealed on slide)
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

// Swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
        // Swipe left = next
        nextSlide();
    }
}
