
// Tab yönetimi için aktif kayıtları tutan Map
let activeRecordings = new Map();

// Mesaj dinleyicisi
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'getTabId':
            // Tab ID'sini content script'e gönder
            sendResponse({ tabId: sender.tab.id });
            break;

        case 'downloadRecording':
            if (message.blobUrl) {
                // Video dosyasını indir
                chrome.downloads.download({
                    url: message.blobUrl,
                    filename: message.filename,
                    saveAs: true
                }, (downloadId) => {
                    if (chrome.runtime.lastError) {
                        console.error('İndirme hatası:', chrome.runtime.lastError);
                    } else {
                        console.log(`İndirme başlatıldı, ID: ${downloadId}, Segment sayısı: ${message.segmentCount}`);
                        // Blob URL'ini temizle
                        URL.revokeObjectURL(message.blobUrl);
                    }
                });
            }
            break;

        case 'recordingStarted':
            // Yeni kayıt başladığında Map'e ekle
            activeRecordings.set(message.tabId, {
                startTime: Date.now(),
                segments: 0
            });
            break;

        case 'recordingStopped':
            // Kayıt durduğunda Map'ten kaldır
            activeRecordings.delete(message.tabId);
            break;

        case 'updateStats':
            // Kayıt istatistiklerini güncelle
            if (activeRecordings.has(message.tabId)) {
                const recording = activeRecordings.get(message.tabId);
                recording.segments = message.stats.segments;
            }
            // İstatistikleri diğer sekmelere ilet
            chrome.runtime.sendMessage(message);
            break;
    }

    return true; // Asenkron yanıt için gerekli
});

// Tab kapatıldığında kaydı temizle
chrome.tabs.onRemoved.addListener((tabId) => {
    if (activeRecordings.has(tabId)) {
        activeRecordings.delete(tabId);
    }
}); 