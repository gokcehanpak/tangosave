/**
 * TangoSave Website Scripts
 * Modern, responsive ve kullanıcı dostu website için gerekli etkileşimler
 */

document.addEventListener('DOMContentLoaded', () => {
    // Dil değiştirme fonksiyonları
    initLanguageSelector();
    
    // Smooth scroll için tüm iç bağlantıları ayarla
    setupSmoothScroll();
    
    // Animasyonlu içerik yükleme
    animateOnScroll();
    
    // FAQ açılır-kapanır özelliği
    setupFaqInteraction();
    
    // TangoSave logosu için popup
    setupLogoPopup();
});

/**
 * Dil seçimini başlatır ve yönetir
 */
function initLanguageSelector() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    // Önceden seçilmiş dili localStorage'dan al, yoksa varsayılan olarak Türkçe kullan
    const savedLang = localStorage.getItem('tangosave-language') || 'tr';
    document.documentElement.setAttribute('data-lang', savedLang);
    
    // Dil butonlarına aktif sınıfı ekle
    langButtons.forEach(btn => {
        if (btn.getAttribute('data-lang') === savedLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Sayfa yüklendiğinde çevirileri uygula
    applyTranslations(savedLang);
    
    // Dil butonlarına tıklama olayları ekle
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            
            // Aktif dil butonunu değiştir
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Seçilen dili belirle ve uygula
            document.documentElement.setAttribute('data-lang', lang);
            localStorage.setItem('tangosave-language', lang);
            
            // Çevirileri uygula
            applyTranslations(lang);
        });
    });
}

/**
 * Dil çevirilerini sayfa içeriğine uygular
 * @param {string} lang - Seçilen dil kodu (tr/en)
 */
function applyTranslations(lang) {
    // data-translate özelliği olan öğeleri güncelle
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        const text = getTranslation(key, lang);
        if (text) el.textContent = text;
    });
    
    // Dile özgü çevirileri içeren öğeleri güncelle (data-translate-tr, data-translate-en)
    document.querySelectorAll(`[data-translate-${lang}]`).forEach(el => {
        const text = el.getAttribute(`data-translate-${lang}`);
        if (text) el.textContent = text;
    });
}

/**
 * Belirli bir anahtar ve dil için çeviriyi döndürür
 * @param {string} key - Çeviri anahtarı
 * @param {string} lang - Dil kodu
 * @returns {string} Çevrilmiş metin
 */
function getTranslation(key, lang) {
    const translations = {
        tr: {
            "button.install": "Satın Al (4.99 USD)",
            "title.features": "Özellikler",
            "title.howto": "Nasıl Kullanılır?",
            "title.faq": "Sıkça Sorulan Sorular",
            "title.testimonials": "Kullanıcı Yorumları",
            "title.stats": "Rakamlarla TangoSave",
            "format.info": "TS Formatı ile Kusursuz Kayıt"
        },
        en: {
            "button.install": "Buy Now (4.99 USD)",
            "title.features": "Features",
            "title.howto": "How to Use",
            "title.faq": "Frequently Asked Questions",
            "title.testimonials": "User Testimonials",
            "title.stats": "TangoSave in Numbers",
            "format.info": "Perfect Recording with TS Format"
        }
    };
    
    return translations[lang] && translations[lang][key] 
        ? translations[lang][key] 
        : key;
}

/**
 * Sayfa içi bağlantılar için smooth scroll özelliğini ekler
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        });
    });
}

/**
 * Scroll animasyonu ile içeriği gösterir
 */
function animateOnScroll() {
    const animatedElements = document.querySelectorAll('.feature-card, .step, .stat-card, .testimonial-card, .faq-list details');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Başlangıçta görünmez ve aşağıdan yukarı doğru animasyon için stil ayarla
    animatedElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        observer.observe(el);
    });
}

/**
 * SSS bölümü için etkileşimleri ayarlar
 */
function setupFaqInteraction() {
    const details = document.querySelectorAll('.faq-list details');
    
    // Her SSS öğesine tıklama olayı ekle
    details.forEach(detail => {
        detail.addEventListener('click', function() {
            // Diğer tüm açık öğeleri kapat
            details.forEach(otherDetail => {
                if (otherDetail !== detail && otherDetail.hasAttribute('open')) {
                    otherDetail.removeAttribute('open');
                }
            });
        });
    });
}

/**
 * TangoSave logosu için popup oluşturur
 */
function setupLogoPopup() {
    // Popup HTML'ini oluştur ve body'e ekle
    const popupHTML = `
        <div id="logoPopup" class="logo-popup">
            <div class="logo-popup-content">
                <div class="popup-header">
                    <button class="close-popup">&times;</button>
                </div>
                <div class="popup-logo">
                    <svg class="logo-icon-popup" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                        <line x1="16" y1="8" x2="2" y2="22"></line>
                        <line x1="17.5" y1="15" x2="9" y2="15"></line>
                    </svg>
                    <span class="popup-logo-text">TangoSave</span>
                </div>
                <div class="popup-content" data-translate-tr="Favori Tango yayınlarınızı TS formatında kaydedin!" data-translate-en="Record your favorite Tango streams in TS format!">
                    Favori Tango yayınlarınızı TS formatında kaydedin!
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Popup için CSS ekle
    const popupStyle = document.createElement('style');
    popupStyle.textContent = `
        .logo-popup {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        
        .logo-popup.show {
            display: flex;
            animation: fadeIn 0.3s ease;
        }
        
        .logo-popup-content {
            background: var(--bg-gradient);
            padding: 30px;
            border-radius: var(--border-radius);
            max-width: 400px;
            width: 90%;
            border: 1px solid var(--primary-color);
            box-shadow: var(--neon-shadow);
            text-align: center;
        }
        
        .popup-header {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 15px;
        }
        
        .close-popup {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 24px;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .close-popup:hover {
            color: var(--primary-color);
        }
        
        .popup-logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .logo-icon-popup {
            color: var(--primary-color);
            filter: drop-shadow(var(--neon-shadow));
            margin-bottom: 15px;
        }
        
        .popup-logo-text {
            font-size: 32px;
            font-weight: 600;
            color: var(--primary-color);
            text-shadow: var(--neon-shadow);
        }
        
        .popup-content {
            color: var(--text-secondary);
            font-size: 18px;
            line-height: 1.6;
            margin-top: 15px;
        }
    `;
    document.head.appendChild(popupStyle);
    
    // Logo tıklandığında popup'ı göster
    document.querySelectorAll('.footer-logo, .neon-text').forEach(logo => {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', showLogoPopup);
    });
    
    // Popup kapatma butonu
    document.querySelector('.close-popup').addEventListener('click', hideLogoPopup);
    
    // Popup dışına tıklandığında kapat
    document.getElementById('logoPopup').addEventListener('click', (e) => {
        if (e.target === document.getElementById('logoPopup')) {
            hideLogoPopup();
        }
    });
}

/**
 * Logo popup'ını göster
 */
function showLogoPopup() {
    const popup = document.getElementById('logoPopup');
    popup.classList.add('show');
    // Dil tercihini popup'a da uygula
    applyTranslations(currentLang);
}

/**
 * Logo popup'ını gizle 
 */
function hideLogoPopup() {
    const popup = document.getElementById('logoPopup');
    popup.classList.remove('show');
} 
