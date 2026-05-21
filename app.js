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

createParticles();

// Load saved data from localStorage
window.addEventListener('DOMContentLoaded', function() {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) document.getElementById('apiKey').value = savedKey;
    const savedPengirim = localStorage.getItem('bucin_pengirim');
    if (savedPengirim) document.getElementById('pengirim').value = savedPengirim;
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

    if (!apiKey) { alert('Masukkan API Key Gemini dulu ya! Dapatkan di aistudio.google.com/apikey'); return; }
    if (!nama) { alert('Masukkan nama dia dulu ya!'); return; }
    if (!hubungan) { alert('Pilih hubungan dulu ya!'); return; }

    localStorage.setItem('gemini_api_key', apiKey);
    if (pengirim) localStorage.setItem('bucin_pengirim', pengirim);

    const baseUrl = window.location.href.replace('index.html', '').replace(/\/$/, '');
    const params = new URLSearchParams({ nama, hubungan, key: apiKey });
    if (pengirim) params.set('dari', pengirim);
    
    const link = `${baseUrl}/result.html?${params.toString()}`;

    const resultDiv = document.getElementById('result');
    document.getElementById('resultNama').textContent = nama;
    const linkEl = document.getElementById('generatedLink');
    linkEl.href = link;
    linkEl.textContent = link;
    resultDiv.classList.remove('hidden');
    document.getElementById('copyNotif').classList.add('hidden');
}

function copyLink() {
    const link = document.getElementById('generatedLink').href;
    navigator.clipboard.writeText(link).then(() => {
        const notif = document.getElementById('copyNotif');
        notif.classList.remove('hidden');
        setTimeout(() => notif.classList.add('hidden'), 3000);
    }).catch(() => {
        const t = document.createElement('input');
        t.value = link;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
        const notif = document.getElementById('copyNotif');
        notif.classList.remove('hidden');
        setTimeout(() => notif.classList.add('hidden'), 3000);
    });
}

function shareLink() {
    const link = document.getElementById('generatedLink').href;
    const nama = document.getElementById('nama').value.trim();
    const text = `Hai ${nama}, ada pesan spesial buat kamu! Buka ya 💕: ${link}`;
    if (navigator.share) {
        navigator.share({ title: 'Pesan Cinta', text, url: link });
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
}
