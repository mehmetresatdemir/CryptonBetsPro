import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Profesyonel API Rate Limiter
 * Slotegrator API isteklerini yönetmek için gelişmiş bir rate limit yönetim sistemi
 */

// Rate Limiter Yapılandırması
interface RateLimiterConfig {
  maxRequestsPerMinute: number;   // Bir dakikada yapılabilecek maksimum istek sayısı
  maxConcurrentRequests: number;  // Aynı anda yapılabilecek maksimum istek sayısı
  initialBackoff: number;        // Başlangıç bekleme süresi (ms)
  maxBackoff: number;            // Maksimum bekleme süresi (ms)
  retryCount: number;            // Başarısız istekleri tekrar deneme sayısı
}

// İstek Kuyruğu Öğesi
interface QueueItem {
  config: AxiosRequestConfig;
  resolve: (value: AxiosResponse<any>) => void;
  reject: (reason: any) => void;
  retries: number;
  id: number;
}

// Rate Limiter Durumu
interface RateLimiterState {
  requestQueue: QueueItem[];
  activeRequests: number;
  requestsMade: number;
  windowStartTime: number;
  backoffTime: number;
  consecutiveErrors: number;
  maxConcurrent: number;
  lastRequestTime: number;
  isProcessingQueue: boolean;
  requestCounter: number;
}

class APIRateLimiter {
  private config: RateLimiterConfig;
  private state: RateLimiterState;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    // Varsayılan yapılandırma
    this.config = {
      maxRequestsPerMinute: 50,    // Varsayılan olarak dakikada 50 istek
      maxConcurrentRequests: 3,    // Varsayılan olarak 3 eşzamanlı istek
      initialBackoff: 500,         // 500ms başlangıç bekleme
      maxBackoff: 15000,           // Maksimum 15 saniye bekleme
      retryCount: 3,               // Başarısız istekleri 3 kez dene
      ...config                    // Kullanıcı yapılandırması ile geçersiz kıl
    };

    // Rate limiter durumu
    this.state = {
      requestQueue: [],            // İstek kuyruğu
      activeRequests: 0,           // Aktif istek sayısı
      requestsMade: 0,             // Mevcut zaman penceresinde yapılan istek sayısı
      windowStartTime: Date.now(), // Zaman penceresi başlangıcı
      backoffTime: this.config.initialBackoff, // Şu anki bekleme süresi
      consecutiveErrors: 0,        // Arka arkaya gelen hata sayısı
      maxConcurrent: this.config.maxConcurrentRequests, // Şu anki eşzamanlı istek limiti
      lastRequestTime: 0,          // Son istek zamanı
      isProcessingQueue: false,    // Kuyruk işleniyor mu?
      requestCounter: 0            // Benzersiz istek kimliği için sayaç
    };

    // Periyodik olarak zaman penceresini sıfırla
    setInterval(() => this.resetWindow(), 60000);

    console.log(`[RateLimiter] Başlatıldı. Dakikada maksimum ${this.config.maxRequestsPerMinute} istek, ${this.config.maxConcurrentRequests} eşzamanlı istek.`);
  }

  /**
   * HTTP isteği gönderir ve rate limiting uygular
   * @param config Axios istek yapılandırması
   * @returns API yanıtı için Promise
   */
  public async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    this.checkWindowReset();

    // Dakikada izin verilen istek sayısına ulaşıldı mı?
    if (this.state.requestsMade >= this.config.maxRequestsPerMinute) {
      const timeToNextWindow = (this.state.windowStartTime + 60000) - Date.now();
      console.log(`[RateLimiter] Rate limit aşıldı! Yeni pencere için ${Math.ceil(timeToNextWindow / 1000)} saniye bekleniyor.`);
      await this.sleep(timeToNextWindow);
      this.resetWindow(); // Yeni pencere
    }

    // İsteği kuyruğa ekle ve bir promise döndür
    return new Promise<AxiosResponse<T>>((resolve, reject) => {
      const requestId = ++this.state.requestCounter;
      
      this.state.requestQueue.push({
        config,
        resolve,
        reject,
        retries: 0,
        id: requestId
      });

      // Kuyruk işlemeyi başlat (çalışmıyorsa)
      if (!this.state.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  /**
   * API isteği kuyruğunu işler
   */
  private async processQueue() {
    if (this.state.requestQueue.length === 0) {
      this.state.isProcessingQueue = false;
      return;
    }

    this.state.isProcessingQueue = true;

    // Eşzamanlı istek sayısı sınırına ulaşılmadıysa yeni istekler başlat
    while (
      this.state.requestQueue.length > 0 && 
      this.state.activeRequests < this.state.maxConcurrent &&
      this.state.requestsMade < this.config.maxRequestsPerMinute
    ) {
      // İstek aralığını kontrol et (rate limiting için)
      const timeSinceLastRequest = Date.now() - this.state.lastRequestTime;
      if (timeSinceLastRequest < this.state.backoffTime) {
        await this.sleep(this.state.backoffTime - timeSinceLastRequest);
      }

      // Kuyruğun başından bir istek al
      const request = this.state.requestQueue.shift();
      if (!request) continue;

      this.executeRequest(request);
    }

    // Hala kuyrukta istek varsa ve işlem devam etmiyorsa, belirli bir süre sonra tekrar dene
    if (this.state.requestQueue.length > 0 && this.state.activeRequests === 0) {
      setTimeout(() => this.processQueue(), 100);
    } else if (this.state.requestQueue.length === 0) {
      this.state.isProcessingQueue = false;
    }
  }

  /**
   * Bir API isteğini yürütür
   * @param request İstek kuyruğu öğesi
   */
  private async executeRequest(request: QueueItem) {
    this.state.activeRequests++;
    this.state.requestsMade++;
    this.state.lastRequestTime = Date.now();

    try {
      console.log(`[RateLimiter] İstek #${request.id} başlatılıyor. Aktif: ${this.state.activeRequests}, Kuyruk: ${this.state.requestQueue.length}`);
      
      // API isteğini gönder
      const response = await axios(request.config);
      
      console.log(`[RateLimiter] İstek #${request.id} başarılı. Durum: ${response.status}`);
      
      // Başarılı yanıt, hata sayacını sıfırla ve parametreleri iyileştir
      this.state.consecutiveErrors = 0;
      this.adjustParameters(true);
      
      // İstek başarılı, sonucu çöz
      request.resolve(response);
    } catch (error: any) {
      console.error(`[RateLimiter] İstek #${request.id} başarısız:`, error.message);
      
      // Rate limit hatası mı?
      if (error.response && error.response.status === 429) {
        this.state.consecutiveErrors++;
        console.warn(`[RateLimiter] Rate limit hatası algılandı! #${this.state.consecutiveErrors}`);
        
        // Rate limit parametrelerini agresif şekilde ayarla
        this.adjustParameters(false);
        
        // Tekrar deneme sayısını kontrol et
        if (request.retries < this.config.retryCount) {
          console.log(`[RateLimiter] İstek #${request.id} tekrar deneniyor (${request.retries + 1}/${this.config.retryCount})...`);
          request.retries++;
          // Kuyruğun başına geri ekle
          this.state.requestQueue.unshift(request);
        } else {
          // Maksimum tekrar deneme sayısına ulaşıldı
          request.reject(new Error(`Maksimum tekrar deneme sayısı aşıldı (${this.config.retryCount})`));
        }
      } else {
        // Diğer hatalar
        request.reject(error);
      }
    } finally {
      this.state.activeRequests--;
      
      // Eğer aktif istek kalmadıysa ve kuyrukta istek varsa, kuyruğu işlemeye devam et
      if (this.state.activeRequests === 0 && this.state.requestQueue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  /**
   * Rate limiter parametrelerini başarım durumuna göre ayarlar
   * @param success İstek başarılı mı?
   */
  private adjustParameters(success: boolean) {
    if (success) {
      // Başarılı istek - kademeli olarak limitleri gevşet, ama dikkatli ol
      if (this.state.consecutiveErrors === 0) {
        // Eşzamanlı istekleri yavaşça arttır
        if (this.state.maxConcurrent < this.config.maxConcurrentRequests) {
          this.state.maxConcurrent = Math.min(
            this.config.maxConcurrentRequests, 
            this.state.maxConcurrent + 0.5
          );
        }
        
        // Bekleme süresini yavaşça azalt
        this.state.backoffTime = Math.max(
          this.config.initialBackoff,
          this.state.backoffTime * 0.9
        );
      }
    } else {
      // Başarısız istek - limitleri sıkılaştır
      this.state.maxConcurrent = Math.max(1, Math.floor(this.state.maxConcurrent / 2));
      this.state.backoffTime = Math.min(
        this.config.maxBackoff,
        this.state.backoffTime * 2
      );
      
      console.warn(`[RateLimiter] Parametreler ayarlandı. Eşzamanlı: ${this.state.maxConcurrent}, Bekleme: ${this.state.backoffTime}ms`);
    }
  }

  /**
   * Zaman penceresi kontrolü ve gerekirse sıfırlama
   */
  private checkWindowReset() {
    const now = Date.now();
    if (now - this.state.windowStartTime >= 60000) {
      this.resetWindow();
    }
  }

  /**
   * Zaman penceresini sıfırlar (dakikalık istek sayısı)
   */
  private resetWindow() {
    const previousWindow = {
      requests: this.state.requestsMade,
      start: new Date(this.state.windowStartTime).toISOString()
    };
    
    this.state.windowStartTime = Date.now();
    this.state.requestsMade = 0;
    
    console.log(`[RateLimiter] Zaman penceresi sıfırlandı. Önceki pencere: ${previousWindow.requests} istek.`);
    
    // Başarılı bir pencere geçişi ise limitleri hafifçe gevşet
    if (previousWindow.requests < this.config.maxRequestsPerMinute * 0.8 && this.state.consecutiveErrors === 0) {
      this.state.backoffTime = Math.max(
        this.config.initialBackoff, 
        this.state.backoffTime * 0.9
      );
      
      console.log(`[RateLimiter] Pencere başarıyla tamamlandı. Bekleme süresi: ${this.state.backoffTime}ms`);
    }
  }

  /**
   * Belirtilen milisaniye kadar bekler
   * @param ms Milisaniye cinsinden bekleme süresi
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, Math.max(0, ms)));
  }

  /**
   * Mevcut rate limiter durumunu raporlar
   */
  public getStatus() {
    return {
      queueLength: this.state.requestQueue.length,
      activeRequests: this.state.activeRequests,
      requestsMade: this.state.requestsMade,
      maxRequestsPerMinute: this.config.maxRequestsPerMinute,
      currentMaxConcurrent: this.state.maxConcurrent,
      configuredMaxConcurrent: this.config.maxConcurrentRequests,
      backoffTime: this.state.backoffTime,
      consecutiveErrors: this.state.consecutiveErrors,
      windowTimeRemaining: Math.max(0, (this.state.windowStartTime + 60000) - Date.now())
    };
  }
}

// Singleton instance
const rateLimiter = new APIRateLimiter({
  maxRequestsPerMinute: 45, // Slotegrator için güvenli limit
  maxConcurrentRequests: 3, // Başlangıçta 3 eşzamanlı istek
  initialBackoff: 500,      // 500ms başlangıç bekleme
  maxBackoff: 15000,        // Maksimum 15 saniye bekleme
  retryCount: 3             // Başarısız istekleri 3 kez dene
});

export default rateLimiter;