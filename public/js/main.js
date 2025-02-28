// Dil yönetimi
let currentLang = localStorage.getItem('language') || 
    (navigator.language.startsWith('tr') ? 'tr' : 'en');

// Sayfa yüklendiğinde dil ayarını uygula
document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLang);
    document.querySelector(`[data-lang="${currentLang}"]`).classList.add('active');
    
    // Dil butonları için event listener
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyLanguage(lang);
            localStorage.setItem('language', lang);
        });
    });

    // Chrome yükleme butonu için event listener
    document.getElementById('chromeInstall').addEventListener('click', (e) => {
        e.preventDefault();
        // Chrome Web Store linki eklenecek
        window.open('https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID', '_blank');
    });

    // SSS için event listener
    document.querySelectorAll('details').forEach(detail => {
        detail.addEventListener('click', () => {
            // Diğer açık SSS'leri kapat
            document.querySelectorAll('details[open]').forEach(d => {
                if (d !== detail) d.removeAttribute('open');
            });
        });
    });

    // Smooth scroll için event listener
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Neon efekti için animasyon
    const neonElements = document.querySelectorAll('.neon-text');
    neonElements.forEach(el => {
        el.style.animation = 'neonPulse 2s infinite';
    });
});

// Dil değiştirme fonksiyonu
function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('data-lang', lang);
    document.title = translations[lang].title;
    
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        const keys = key.split('.');
        let translation = translations[lang];
        
        for (const k of keys) {
            translation = translation[k];
        }
        
        if (translation) {
            element.textContent = translation;
        }
    });
} 
