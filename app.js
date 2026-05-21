// Load saved API key from localStorage
window.addEventListener('DOMContentLoaded', function() {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        document.getElementById('apiKey').value = savedKey;
    }
});

function generateLink() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const hubungan = document.getElementById('hubungan').value;

    if (!apiKey) {
        alert('Masukkan API Key Gemini dulu ya!');
        return;
    }

    if (!nama) {
        alert('Masukkan nama pasangan dulu ya!');
        return;
    }

    if (!hubungan) {
        alert('Pilih hubungan dulu ya!');
        return;
    }

    // Save API key to localStorage
    localStorage.setItem('gemini_api_key', apiKey);

    // Generate link with parameters (including key)
    const baseUrl = window.location.href.replace('index.html', '').replace(/\/$/, '');
    const params = new URLSearchParams({
        nama: nama,
        hubungan: hubungan,
        key: apiKey
    });
    
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
        // Fallback for older browsers
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
