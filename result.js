// Create particles
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 5 + 2) + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 6 + 5) + 's';
        container.appendChild(particle);
    }
}

// Create floating hearts/elements
function createFloatingElements() {
    const container = document.getElementById('floatingElements');
    if (!container) return;
    
    const emojis = ['💕', '💗', '✨', '🌸', '💫', '🦋', '🌹', '💝'];
    
    for (let i = 0; i < 12; i++) {
        const el = document.createElement('div');
        el.classList.add('float-el');
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.animationDelay = Math.random() * 7 + 's';
        el.style.animationDuration = (Math.random() * 5 + 6) + 's';
        el.style.fontSize = (Math.random() * 15 + 15) + 'px';
        container.appendChild(el);
    }
}

createParticles();
createFloatingElements();

// Get parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const nama = urlParams.get('nama');
const hubungan = urlParams.get('hubungan');
const apiKey = urlParams.get('key');
const dari = urlParams.get('dari');

// Display name
const namaTarget = document.getElementById('namaTarget');
if (namaTarget) namaTarget.textContent = nama || 'Sayang';

// Display sender name
const fromName = document.getElementById('fromName');
if (fromName && dari) {
    fromName.textContent = dari;
}

// Envelope open animation
function openEnvelope() {
    const envelope = document.getElementById('envelope');
    envelope.classList.add('opened');
    
    setTimeout(() => {
        document.getElementById('envelopeScreen').classList.add('hidden');
        document.getElementById('messageScreen').classList.remove('hidden');
        generateRomanticMessage();
    }, 800);
}

// Generate romantic message
async function generateRomanticMessage() {
    const loading = document.getElementById('loading');
    const messageContainer = document.getElementById('messageContainer');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    const romanticMessage = document.getElementById('romanticMessage');

    if (!nama || !hubungan || !apiKey) {
        loading.classList.add('hidden');
        if (errorMessage) errorMessage.textContent = 'Link tidak lengkap. Pastikan link berisi nama, hubungan, dan API key.';
        errorContainer.classList.remove('hidden');
        return;
    }

    const models = [
        'gemini-3.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
    ];

    const hubunganText = {
        'pacar': 'pacar',
        'suami': 'suami',
        'istri': 'istri',
        'gebetan': 'gebetan (orang yang disukai)',
        'mantan': 'mantan kekasih',
        'sahabat': 'sahabat spesial',
        'crush': 'orang yang diam-diam disukai'
    };

    const prompt = `Kamu adalah penulis kata-kata romantis yang sangat berbakat. Buatkan kata-kata romantis, puitis, dan sangat menyentuh hati dalam bahasa Indonesia untuk seseorang bernama "${nama}" yang merupakan ${hubunganText[hubungan] || hubungan} saya${dari ? ` (dari ${dari})` : ''}.

Buatkan pesan yang benar-benar bikin baper dengan format:
- Awali dengan sapaan manis yang personal (sebutkan nama ${nama})
- 2-3 kalimat pembuka yang lembut dan menyentuh
- 3-4 kalimat puitis tentang perasaan cinta yang mendalam
- 1-2 kalimat tentang harapan/janji
- Tutup dengan kalimat yang sangat romantis dan bikin meleleh

Gunakan bahasa yang sangat puitis, dalam, penuh perasaan. Jangan gunakan markdown, format khusus, atau emoji. Cukup teks biasa saja. Langsung tulis pesannya tanpa judul atau keterangan tambahan.`;

    let lastError = '';

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 1.0,
                        maxOutputTokens: 600
                    }
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                lastError = `Model ${model}: ${response.status} - ${errData.error?.message || 'Unknown error'}`;
                console.warn(lastError);
                continue;
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const text = data.candidates[0].content.parts[0].text;
                
                // Typing effect
                loading.classList.add('hidden');
                messageContainer.classList.remove('hidden');
                await typeWriter(romanticMessage, text);
                return;
            } else {
                lastError = `Model ${model}: Response tidak valid`;
                continue;
            }
        } catch (error) {
            lastError = `Model ${model}: ${error.message}`;
            console.error(lastError);
            continue;
        }
    }

    // All models failed
    loading.classList.add('hidden');
    if (errorMessage) {
        errorMessage.textContent = `Gagal memuat pesan cinta. Error: ${lastError}`;
    }
    errorContainer.classList.remove('hidden');
}

// Typing effect
async function typeWriter(element, text) {
    element.textContent = '';
    const chars = text.split('');
    
    for (let i = 0; i < chars.length; i++) {
        element.textContent += chars[i];
        // Speed: fast but still visible
        await new Promise(resolve => setTimeout(resolve, 20));
    }
}
