// Get parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const nama = urlParams.get('nama');
const hubungan = urlParams.get('hubungan');
const apiKey = urlParams.get('key');

// Display name
document.getElementById('namaTarget').textContent = nama || 'Sayang';

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

    // Try multiple model names in case one doesn't work
    const models = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-pro'
    ];

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
                        temperature: 0.9,
                        maxOutputTokens: 500
                    }
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                lastError = `Model ${model}: ${response.status} - ${errData.error?.message || 'Unknown error'}`;
                console.warn(lastError);
                continue; // Try next model
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const text = data.candidates[0].content.parts[0].text;
                romanticMessage.textContent = text;
                
                loading.classList.add('hidden');
                messageContainer.classList.remove('hidden');
                return; // Success!
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

// Start generating when page loads
generateRomanticMessage();
