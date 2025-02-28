document.addEventListener('DOMContentLoaded', () => {
    // Dil yönetimi
    let currentLang = localStorage.getItem('language') || 
                     (navigator.language.includes('tr') ? 'tr' : 'en');

    const langButtons = document.querySelectorAll('.lang-btn');
    const translateElements = document.querySelectorAll('[data-translate]');

    // Dil değiştirme fonksiyonu
    function changeLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('language', lang);
        
        // Başlık güncelleme
        document.title = translations[lang].title;
        
        // Tüm çevrilebilir elementleri güncelle
        translateElements.forEach(element => {
            const key = element.dataset.translate;
            const keys = key.split('.');
            let translation = translations[lang];
            
            keys.forEach(k => {
                translation = translation[k];
            });
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Dil butonlarını güncelle
        langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }

    // Dil butonları için event listener
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            changeLanguage(btn.dataset.lang);
        });
    });

    // Sayfa yüklendiğinde dili ayarla
    changeLanguage(currentLang);

    // Chrome'da Yükle butonu için event listener
    const installButton = document.getElementById('chromeInstall');
    if (installButton) {
        installButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Chrome Web Store linki eklenecek
            window.open('CHROME_STORE_LINK', '_blank');
        });
    }

    // SSS animasyonları
    const details = document.querySelectorAll('details');
    details.forEach(detail => {
        detail.addEventListener('toggle', () => {
            if (detail.open) {
                const others = Array.from(details).filter(d => d !== detail);
                others.forEach(d => d.open = false);
            }
        });
    });

    // Smooth scroll
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

    // Neon efekt animasyonu
    const neonElements = document.querySelectorAll('.neon-text');
    neonElements.forEach(element => {
        element.style.animation = 'neonPulse 2s infinite';
    });
}); 