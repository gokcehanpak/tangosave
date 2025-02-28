// Video elementi için seçici
const VIDEO_SELECTOR = 'video';

class TangoRecorder {
    constructor() {
        this.isRecording = false;
        this.segments = [];
        this.segmentUrls = new Set();
        this.streamInfo = null;
        this.networkListener = null;
        this.tabId = null;
        this.initializeStreamDetection();
        this.initializeTabId();
    }

    // Tab ID'sini al
    async initializeTabId() {
        try {
            const message = { action: 'getTabId' };
            const response = await chrome.runtime.sendMessage(message);
            this.tabId = response.tabId;
            console.log('Tab ID alındı:', this.tabId);
        } catch (error) {
            console.error('Tab ID alınamadı:', error);
        }
    }

    // Yayın tespiti için gerekli izleyicileri başlat
    initializeStreamDetection() {
        this.observeDOM();
        this.observeNetwork();
    }

    // DOM değişikliklerini izle
    observeDOM() {
        const observer = new MutationObserver(() => {
            this.detectStream();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        this.detectStream();
    }

    // Network trafiğini izle
    observeNetwork() {
        const self = this;
        
        this.networkListener = setInterval(() => {
            if (this.isRecording) {
                const entries = performance.getEntriesByType('resource');
                entries.forEach(entry => {
                    if (this.isVideoSegment(entry.name) && !this.segmentUrls.has(entry.name)) {
                        this.fetchSegment(entry.name);
                    }
                });
            }
        }, 1000);

        // XHR isteklerini yakala
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (url.includes('live.m3u8')) {
                console.log('Canlı yayın manifest dosyası tespit edildi:', url);
                self.updateStreamInfo(url);
            }
            originalXHROpen.apply(this, arguments);
        };

        // Fetch isteklerini yakala
        const originalFetch = window.fetch;
        window.fetch = async function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            if (url.includes('live.m3u8')) {
                console.log('Canlı yayın manifest dosyası tespit edildi:', url);
                self.updateStreamInfo(url);
            }
            return originalFetch.apply(this, arguments);
        };
    }

    // Yayın bilgilerini güncelle
    updateStreamInfo(manifestUrl) {
        const urlParts = manifestUrl.split('/');
        const streamId = urlParts[urlParts.indexOf('v2') + 1];
        
        this.streamInfo = {
            manifestUrl: manifestUrl,
            streamId: streamId,
            baseUrl: manifestUrl.substring(0, manifestUrl.indexOf('/live.m3u8')),
            detectedAt: new Date()
        };

        // İstatistikleri gönder
        this.sendRecordingStats();
    }

    // İstatistikleri gönder
    sendRecordingStats() {
        if (!this.tabId) return;

        const stats = {
            segments: this.segments.length,
            totalSize: this.segments.reduce((total, segment) => total + segment.byteLength, 0),
            duration: this.segments.length * 10, // Her segment yaklaşık 10 saniye
            quality: '720p',
            streamId: this.streamInfo?.streamId || 'unknown',
            tabId: this.tabId
        };

        chrome.runtime.sendMessage({
            action: 'updateStats',
            tabId: this.tabId,
            stats: stats
        });
    }

    // Video elementini ve yayın bilgilerini tespit et
    detectStream() {
        const videoElement = document.querySelector(VIDEO_SELECTOR);
        if (videoElement) {
            const videoSrc = videoElement.src;
            console.log('Video elementi bulundu:', videoSrc);
            
            if (!videoElement.onloadedmetadata) {
                videoElement.onloadedmetadata = () => {
                    console.log('Video metadata yüklendi:', {
                        width: videoElement.videoWidth,
                        height: videoElement.videoHeight,
                        duration: videoElement.duration
                    });
                };
            }
        }

        const streamMatch = window.location.href.match(/\/stream\/([^/?]+)/);
        if (streamMatch) {
            console.log('Yayın sayfası tespit edildi:', streamMatch[1]);
        }
    }

    // Segment URL'sini kontrol et
    isVideoSegment(url) {
        return url.includes('.ts') && 
               url.includes('cinema-de41.tango.me') && 
               (!this.streamInfo || url.includes(this.streamInfo.baseUrl));
    }

    // Segmenti indir
    async fetchSegment(url) {
        try {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            this.segments.push(buffer);
            this.segmentUrls.add(url);
            console.log('Yeni segment indirildi:', url);
            this.sendRecordingStats();
        } catch (error) {
            console.error('Segment indirme hatası:', error);
        }
    }

    // Kaydı başlat
    async startRecording() {
        if (this.isRecording) {
            console.error('Zaten kayıt yapılıyor');
            return;
        }

        this.isRecording = true;
        this.segments = [];
        this.segmentUrls = new Set();

        this.detectStream();
        
        console.log('Kayıt başlatıldı', {
            streamInfo: this.streamInfo,
            timestamp: new Date().toISOString(),
            tabId: this.tabId
        });

        // Kayıt durumunu güncelle
        chrome.runtime.sendMessage({
            action: 'recordingStarted',
            tabId: this.tabId
        });
    }

    // Kaydı durdur
    async stopRecording() {
        if (!this.isRecording) {
            console.error('Kayıt durdurulamıyor: Kayıt aktif değil');
            return;
        }

        this.isRecording = false;

        if (this.segments.length === 0) {
            console.error('Kaydedilen segment bulunamadı!');
            chrome.runtime.sendMessage({
                action: 'recordingStopped',
                tabId: this.tabId,
                error: 'NO_SEGMENTS'
            });
            return;
        }

        // Segmentleri birleştir
        const blob = new Blob(this.segments, { type: 'video/MP2T' });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const streamId = this.streamInfo ? this.streamInfo.streamId : 'unknown';
        const filename = `tango_${streamId}_${timestamp}.ts`;

        // İndirme işlemi için background script'e gönder
        chrome.runtime.sendMessage({
            action: 'downloadRecording',
            tabId: this.tabId,
            blobUrl: URL.createObjectURL(blob),
            filename: filename,
            segmentCount: this.segments.length
        });

        console.log('Kayıt tamamlandı:', {
            segments: this.segments.length,
            totalSize: blob.size,
            filename: filename,
            tabId: this.tabId
        });

        this.segments = [];
        this.segmentUrls = new Set();

        // Kayıt durumunu güncelle
        chrome.runtime.sendMessage({
            action: 'recordingStopped',
            tabId: this.tabId,
            success: true
        });
    }

    // Temizlik işlemleri
    cleanup() {
        if (this.networkListener) {
            clearInterval(this.networkListener);
        }
    }
}

// Her sekme için ayrı recorder instance'ı
const recorder = new TangoRecorder();

// Mesaj dinleyicisi
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message.tabId || message.tabId === recorder.tabId) {
        switch (message.action) {
            case 'startRecording':
                recorder.startRecording();
                break;
            case 'stopRecording':
                recorder.stopRecording();
                break;
            default:
                console.error('Bilinmeyen mesaj:', message);
        }
    }
}); 