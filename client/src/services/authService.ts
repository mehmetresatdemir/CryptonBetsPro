import { apiRequest } from '@/lib/queryClient';

export interface UserCredentials {
  username: string;
  password: string;
  language?: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  balance?: number;
  status?: string;
}

export interface AuthResponse {
  user: UserData;
  token: string;
}

// Normal kullanıcı girişi
export const login = async (credentials: UserCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Giriş sırasında bir hata oluştu');
    }

    return await response.json();
  } catch (error) {
    console.error('Giriş hatası:', error);
    throw error;
  }
};

// Admin girişi
export const adminLogin = async (credentials: UserCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Admin girişi yapılamadı');
    }

    return await response.json();
  } catch (error) {
    console.error('Admin giriş hatası:', error);
    throw error;
  }
};

// Çıkış yapma
export const logout = async (): Promise<{ success: boolean }> => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Çıkış yapılamadı');
    }

    // Token'ı ve local storage'daki kullanıcı bilgilerini temizle
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');

    return { success: true };
  } catch (error) {
    console.error('Çıkış hatası:', error);
    throw error;
  }
};

// Mevcut kullanıcı bilgilerini al
export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Kullanıcı bilgisi alma hatası:', error);
    return null;
  }
};

// Token'ı local storage'a kaydet
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Token'ı local storage'dan al
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Kullanıcı bilgilerini local storage'a kaydet
export const setCurrentUser = (user: UserData): void => {
  localStorage.setItem('user', JSON.stringify(user));
  if (user.role === 'admin') {
    localStorage.setItem('isAdmin', 'true');
  }
};

// Kullanıcı bilgilerini local storage'dan al
export const getCurrentUserFromStorage = (): UserData | null => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

// Admin kontrolü
export const isAdminUser = (): boolean => {
  return localStorage.getItem('isAdmin') === 'true';
};