// ============= PARTICLES =============
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
createParticles();

// ============= HEART CLICK EFFECT =============
const heartEmojis = ['💕', '💖', '💗', '💝', '💘', '💞', '✨'];
document.addEventListener('click', function(e) {
    if (e.target.closest('button, a, input, select, .toggle-eye, summary')) return;
    spawnHeart(e.clientX, e.clientY);
});

function spawnHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'click-heart';
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.fontSize = (Math.random() * 15 + 22) + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
}

// ============= LOAD SAVED DATA =============
window.addEventListener('DOMContentLoaded', function() {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) document.getElementById('apiKey').value = savedKey;
    const savedPengirim = localStorage.getItem('bucin_pengirim');
    if (savedPengirim) document.getElementById('pengirim').value = savedPengirim;
    const savedTema = localStorage.getItem('bucin_tema');
    if (savedTema) document.getElementById('tema').value = savedTema;
    const savedCerita = localStorage.getItem('bucin_cerita');
    if (savedCerita) document.getElementById('cerita').value = savedCerita;

    // Counter
    let counter = parseInt(localStorage.getItem('msg_count') || '0');
    document.querySelectorAll('.stat-num')[2].textContent = counter > 0 ? counter + 'x' : '∞';
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

function showToast(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function generateLink() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const pengirim = document.getElementById('pengirim').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const hubungan = document.getElementById('hubungan').value;
    const tema = document.getElementById('tema').value;
    const panjang = document.getElementById('panjang').value;
    const cerita = document.getElementById('cerita').value.trim();

    if (!apiKey) {
        showToast('🔑 Masukkan API Key dulu ya!');
        document.getElementById('apiKey').focus();
        return;
    }
    if (!nama) {
        showToast('💕 Masukkan nama dia dulu!');
        document.getElementById('nama').focus();
        return;
    }
    if (!hubungan) {
        showToast('💍 Pilih hubungan dulu!');
        document.getElementById('hubungan').focus();
        return;
    }

    localStorage.setItem('gemini_api_key', apiKey);
    if (pengirim) localStorage.setItem('bucin_pengirim', pengirim);
    localStorage.setItem('bucin_tema', tema);
    if (cerita) localStorage.setItem('bucin_cerita', cerita);

    // Increment counter
    let counter = parseInt(localStorage.getItem('msg_count') || '0') + 1;
    localStorage.setItem('msg_count', counter);
    document.querySelectorAll('.stat-num')[2].textContent = counter + 'x';

    const baseUrl = window.location.href.replace('index.html', '').replace(/\/$/, '');
    const params = new URLSearchParams({ nama, hubungan, tema, panjang, key: apiKey });
    if (pengirim) params.set('dari', pengirim);
    if (cerita) params.set('cerita', cerita);
    
    const link = `${baseUrl}/result.html?${params.toString()}`;

    const resultDiv = document.getElementById('result');
    document.getElementById('resultNama').textContent = nama;
    const linkEl = document.getElementById('generatedLink');
    linkEl.href = link;
    linkEl.textContent = link;
    resultDiv.classList.remove('hidden');
    document.getElementById('copyNotif').classList.add('hidden');

    setTimeout(() => resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    showToast('🎉 Link berhasil dibuat!');
}

function copyLink() {
    const link = document.getElementById('generatedLink').href;
    navigator.clipboard.writeText(link).then(() => {
        showCopyNotif();
    }).catch(() => {
        const t = document.createElement('input');
        t.value = link;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
        showCopyNotif();
    });
}

function showCopyNotif() {
    const notif = document.getElementById('copyNotif');
    notif.classList.remove('hidden');
    setTimeout(() => notif.classList.add('hidden'), 3000);
    showToast('✅ Link disalin!');
}

function shareLink() {
    const link = document.getElementById('generatedLink').href;
    const nama = document.getElementById('nama').value.trim();
    const text = `Hai ${nama}! 💕\n\nAda pesan spesial buat kamu, buka ya:\n${link}`;
    if (navigator.share) {
        navigator.share({ title: 'Pesan Cinta - Dmaz Coba Coba', text, url: link });
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
}

function previewLink() {
    const link = document.getElementById('generatedLink').href;
    window.open(link, '_blank');
}
