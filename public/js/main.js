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
            
            // Nested objelerde doğru çeviriyi bul
            for (const k of keys) {
                if (translation && translation[k]) {
                    translation = translation[k];
                } else {
                    console.warn(`Translation missing for key: ${key} in language: ${lang}`);
                    return;
                }
            }
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                // SVG içeren elementler için özel işlem
                const svg = element.querySelector('svg');
                if (svg) {
                    const svgClone = svg.cloneNode(true);
                    element.textContent = translation;
                    element.insertBefore(svgClone, element.firstChild);
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Dil butonlarını güncelle
        langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Logo rengini güncelle
        const logoIcon = document.querySelector('.logo-icon');
        if (logoIcon) {
            logoIcon.style.color = lang === 'tr' ? '#00ff88' : '#2196F3';
            logoIcon.style.filter = `drop-shadow(0 0 20px ${lang === 'tr' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(33, 150, 243, 0.3)'})`;
        }
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
