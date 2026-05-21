// Create particles
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 6 + 3) + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 6 + 5) + 's';
        container.appendChild(particle);
    }
}

createParticles();

// Load saved API key from localStorage
window.addEventListener('DOMContentLoaded', function() {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        document.getElementById('apiKey').value = savedKey;
    }
    const savedPengirim = localStorage.getItem('bucin_pengirim');
    if (savedPengirim) {
        document.getElementById('pengirim').value = savedPengirim;
    }
});

function toggleApiKey() {
    const input = document.getElementById('apiKey');
    const btn = document.getElementById('eyeBtn');
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

function generateLink() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const pengirim = document.getElementById('pengirim').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const hubungan = document.getElementById('hubungan').value;

    if (!apiKey) {
        alert('Masukkan API Key Gemini dulu ya! Dapatkan di aistudio.google.com/apikey');
        return;
    }

    if (!nama) {
        alert('Masukkan nama dia dulu ya!');
        return;
    }

    if (!hubungan) {
        alert('Pilih hubungan dulu ya!');
        return;
    }

    // Save to localStorage
    localStorage.setItem('gemini_api_key', apiKey);
    if (pengirim) localStorage.setItem('bucin_pengirim', pengirim);

    // Generate link with parameters
    const baseUrl = window.location.href.replace('index.html', '').replace(/\/$/, '');
    const params = new URLSearchParams({
        nama: nama,
        hubungan: hubungan,
        key: apiKey
    });
    if (pengirim) params.set('dari', pengirim);
    
    const link = `${baseUrl}/result.html?${params.toString()}`;

    // Show result
    const resultDiv = document.getElementById('result');
    const resultNama = document.getElementById('resultNama');
    const generatedLink = document.getElementById('generatedLink');

    resultNama.textContent = nama;
    generatedLink.href = link;
    generatedLink.textContent = link;
    resultDiv.classList.remove('hidden');

    // Hide copy notification
    document.getElementById('copyNotif').classList.add('hidden');
}

function copyLink() {
    const link = document.getElementById('generatedLink').href;
    
    navigator.clipboard.writeText(link).then(() => {
        const notif = document.getElementById('copyNotif');
        notif.classList.remove('hidden');
        setTimeout(() => {
            notif.classList.add('hidden');
        }, 3000);
    }).catch(() => {
        const tempInput = document.createElement('input');
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        const notif = document.getElementById('copyNotif');
        notif.classList.remove('hidden');
        setTimeout(() => {
            notif.classList.add('hidden');
        }, 3000);
    });
}

function shareLink() {
    const link = document.getElementById('generatedLink').href;
    const nama = document.getElementById('nama').value.trim();
    const text = `Hai ${nama}, aku punya pesan spesial buat kamu! Buka ya: ${link}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Pesan Cinta Untukmu',
            text: text,
            url: link
        });
    } else {
        // Fallback to WhatsApp
        const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
    }
}
