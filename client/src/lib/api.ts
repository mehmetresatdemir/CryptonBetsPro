// API istemcisi
const API_BASE_URL = '';

// Tip tanımlamaları
interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  phone?: string;
  countryCode?: string;
  birthdate?: string;
}

interface LoginData {
  username: string;
  password: string;
  language?: string;
}

interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    // Diğer kullanıcı bilgileri...
  };
  token: string;
}

// API istekleri için temel fonksiyon
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  token?: string
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  // Eğer token varsa, Authorization header'ını ekle
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log(`API İsteği: ${method} ${endpoint}`, data);
  
  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include', // Çerezleri otomatik olarak gönder
  };
  
  try {
    const response = await fetch(url, config);
    
    console.log(`API Yanıtı: Status ${response.status}`);
    
    // Yanıt başarısız ise, hatayı işle
    if (!response.ok) {
      try {
        // JSON yanıtını parse etmeyi dene
        const errorData = await response.json();
        console.error('API Hata Yanıtı:', errorData);
        
        // Hata mesajını uygun formatta döndür
        if (errorData.error) {
          throw new Error(errorData.error);
        } else if (errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error(`HTTP ${response.status}: İstek başarısız`);
        }
      } catch (parseError) {
        // JSON parse edilemiyorsa (örn. HTML dönerse), genel hata mesajı kullan
        console.error('API JSON Parse Hatası:', parseError);
        throw new Error(`Sunucu hatası (${response.status}): ${response.statusText}`);
      }
    }
    
    // Yanıtın içeriği boş olabilir (örn. PUT veya DELETE istekleri)
    if (response.status === 204) {
      return {} as T;
    }
    
    try {
      // JSON verisini parse et
      const responseData = await response.json();
      console.log('API Yanıt Verileri:', responseData);
      return responseData;
    } catch (e) {
      console.warn('JSON parse edilemedi:', e);
      // Yanıt JSON değilse ve başarılıysa, boş nesne dön
      return {} as T;
    }
  } catch (error) {
    console.error('API İstek Hatası:', error);
    throw error;
  }
}

// Auth API'leri
export const authApi = {
  // Kayıt olma
  register: (data: RegisterData) => 
    apiRequest<AuthResponse>('/api/auth/register', 'POST', data),
  
  // Giriş yapma
  login: (data: LoginData) => 
    apiRequest<AuthResponse>('/api/auth/login', 'POST', data),
  
  // Kullanıcı bilgilerini getir
  getProfile: (token: string) => 
    apiRequest('/api/auth/me', 'GET', undefined, token),
  
  // Profil bilgilerini güncelle (şifre değiştirme dahil)
  updateProfile: (token: string, data: { 
    fullName?: string, 
    email?: string, 
    phone?: string, 
    tckn?: string,
    oldPassword?: string,
    newPassword?: string 
  }) => apiRequest('/api/auth/profile', 'PUT', data, token),
};

// Token yönetimi
export const tokenService = {
  // Token'ı local storage'a kaydet
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token', token); // Oyun modal için ek kayıt
    console.log('🔐 TokenService setToken çağrıldı:', token.substring(0, 20) + '...');
  },
  
  // Token'ı local storage'dan al
  getToken: () => {
    return localStorage.getItem('auth_token') || localStorage.getItem('token');
  },
  
  // Token'ı local storage'dan sil
  removeToken: () => {
    localStorage.removeItem('auth_token');
  }
};