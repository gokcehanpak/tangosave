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
    
    // Chrome Web Store'a yönlendirme
    const installButtons = document.querySelectorAll('.install-btn, .cta-button');
    installButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://chrome.google.com/webstore/detail/tangosave-stream-recorder/gppjeeppmcbillocchbaojehnnjepnmi', '_blank');
        });
    });
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
    
    // Mevcut dil değişkenini kaydet
    window.currentLang = lang;
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
            "format.info": "TS Formatı ile Kusursuz Kayıt",
            "multitab.feature": "Her sekme ayrı çalışır"
        },
        en: {
            "button.install": "Buy Now (4.99 USD)",
            "title.features": "Features",
            "title.howto": "How to Use",
            "title.faq": "Frequently Asked Questions",
            "title.testimonials": "User Testimonials",
            "title.stats": "TangoSave in Numbers",
            "format.info": "Perfect Recording with TS Format",
            "multitab.feature": "Each tab works independently"
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
