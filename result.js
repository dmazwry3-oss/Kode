const GEMINI_API_KEY = 'AIzaSyAdMBLxwhoG7FMGWOHTmkmTzogKVmj8OQ4';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Get parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const nama = urlParams.get('nama');
const hubungan = urlParams.get('hubungan');

// Display name
document.getElementById('namaTarget').textContent = nama || 'Sayang';

// Generate romantic message
async function generateRomanticMessage() {
    const loading = document.getElementById('loading');
    const messageContainer = document.getElementById('messageContainer');
    const errorContainer = document.getElementById('errorContainer');
    const romanticMessage = document.getElementById('romanticMessage');

    if (!nama || !hubungan) {
        loading.classList.add('hidden');
        errorContainer.classList.remove('hidden');
        return;
    }

    const hubunganText = {
        'pacar': 'pacar',
        'suami': 'suami',
        'istri': 'istri',
        'gebetan': 'gebetan (orang yang disukai)',
        'mantan': 'mantan kekasih',
        'sahabat': 'sahabat spesial'
    };

    const prompt = `Buatkan kata-kata romantis dan menyentuh hati dalam bahasa Indonesia untuk seseorang bernama "${nama}" yang merupakan ${hubunganText[hubungan] || hubungan} saya. 

Buatkan dalam format:
- 1 paragraf pembuka yang manis (2-3 kalimat)
- 3-4 kalimat puitis tentang perasaan cinta
- 1 kalimat penutup yang bikin baper

Gunakan bahasa yang puitis, romantis, dan menyentuh hati. Jangan gunakan markdown atau format khusus, cukup teks biasa. Jangan tambahkan emoji. Langsung tulis kata-katanya saja tanpa judul.`;

    try {
        const response = await fetch(GEMINI_API_URL, {
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
                    temperature: 0.9,
                    maxOutputTokens: 500
                }
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text;
            romanticMessage.textContent = text;
            
            loading.classList.add('hidden');
            messageContainer.classList.remove('hidden');
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error:', error);
        loading.classList.add('hidden');
        errorContainer.classList.remove('hidden');
    }
}

// Start generating when page loads
generateRomanticMessage();
