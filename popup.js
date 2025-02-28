document.addEventListener('DOMContentLoaded', async () => {
    const startButton = document.getElementById('startRecording');
    const stopButton = document.getElementById('stopRecording');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const infoPanel = document.getElementById('infoPanel');
    const segmentCount = document.getElementById('segmentCount');
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');
    const langButtons = document.querySelectorAll('.lang-btn');

    let isRecording = false;
    let currentTabId = null;
    let recordingStats = {
        segments: 0
    };

    // Dil yönetimi
    let currentLang = localStorage.getItem('popup_language') || 
                     (navigator.language.includes('tr') ? 'tr' : 'en');

    // Dil değiştirme fonksiyonu
    function changeLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('popup_language', lang);
        
        // Tüm çevrilebilir elementleri güncelle
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.dataset.translate;
            
            // Status text için özel kontrol
            if (element.id === 'statusText') {
                element.textContent = translations[lang][isRecording ? 'status.recording' : 'status.waiting'];
                return;
            }
            
            const translation = translations[lang][key];
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                // Button içeriğini korumak için SVG'yi sakla
                const svg = element.querySelector('svg');
                element.textContent = translation;
                if (svg) {
                    element.prepend(svg);
                }
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

    // İlk yüklemede dili ayarla
    changeLanguage(currentLang);

    // Toast mesajı göster
    function showToast(messageKey, duration = 3000) {
        const message = translations[currentLang][messageKey];
        toastText.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // Tab ID'sini al
    async function getCurrentTabId() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab?.id;
    }

    // İlk yüklemede Tab ID'sini al
    currentTabId = await getCurrentTabId();

    // Kayıt durumunu güncelle
    function updateRecordingState(recording) {
        isRecording = recording;
        startButton.disabled = recording;
        stopButton.disabled = !recording;
        statusIcon.classList.toggle('active', recording);
        statusText.textContent = translations[currentLang][recording ? 'status.recording' : 'status.waiting'];
        infoPanel.classList.toggle('show', recording);

        // Kayıt durumunu storage'a kaydet
        chrome.storage.local.set({
            [`recording_${currentTabId}`]: recording
        });
    }

    // Aktif sekmeyi bul ve mesaj gönder
    async function sendMessageToActiveTab(action) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.url?.includes('tango.me')) {
                await chrome.tabs.sendMessage(tab.id, { 
                    action,
                    tabId: currentTabId
                });
                return true;
            } else {
                showToast('toast.tangoOnly');
                return false;
            }
        } catch (error) {
            showToast('toast.error');
            return false;
        }
    }

    // Kaydı başlat
    startButton.addEventListener('click', async () => {
        const success = await sendMessageToActiveTab('startRecording');
        if (success) {
            updateRecordingState(true);
            showToast('toast.started');
        }
    });

    // Kaydı durdur
    stopButton.addEventListener('click', async () => {
        const success = await sendMessageToActiveTab('stopRecording');
        if (success) {
            updateRecordingState(false);
            showToast('toast.stopped');
        }
    });

    // Kayıt durumunu kontrol et
    chrome.storage.local.get([`recording_${currentTabId}`], (result) => {
        if (result[`recording_${currentTabId}`]) {
            updateRecordingState(true);
        }
    });

    // Content script'ten gelen mesajları dinle
    chrome.runtime.onMessage.addListener((message) => {
        if (message.tabId === currentTabId) {
            switch (message.action) {
                case 'updateStats':
                    recordingStats.segments = message.stats.segments;
                    segmentCount.textContent = recordingStats.segments;
                    break;
                case 'recordingStopped':
                    if (message.error === 'NO_SEGMENTS') {
                        showToast('toast.noSegments');
                    }
                    updateRecordingState(false);
                    break;
                case 'recordingStarted':
                    updateRecordingState(true);
                    break;
            }
        }
    });
}); 