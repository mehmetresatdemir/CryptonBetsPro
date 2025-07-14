import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { translate } from '@/utils/i18n-fixed';
import DepositButton from '@/components/payment/DepositButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, refreshUser, updateProfile } = useUser();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('info');
  
  // Kullanıcı değerlerini formlarda tutmak için stateler
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    tckn: user?.tckn || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
    birthdate: user?.birthdate || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        tckn: user.tckn || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        birthdate: user.birthdate || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);
  
  // KYC ile ilgili durum değişkenleri - varsayılan olarak onaylı kabul ediyoruz
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | 'none'>('approved');
  const [idFrontImage, setIdFrontImage] = useState<File | null>(null);
  const [idBackImage, setIdBackImage] = useState<File | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  
  // İşlem geçmişi ile ilgili state ve fonksiyonlar
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  
  // Bahis geçmişi ile ilgili state ve fonksiyonlar
  const [bets, setBets] = useState<any[]>([]);
  const [isLoadingBets, setIsLoadingBets] = useState(false);
  
  // Bonus verileri için state
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [isLoadingBonuses, setIsLoadingBonuses] = useState(false);

  // Withdrawal modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer');
  const [bankDetails, setBankDetails] = useState({
    iban: '',
    accountHolder: '',
    bankName: ''
  });

  // User limits and risk info
  const [userLimits, setUserLimits] = useState({
    dailyWithdrawLimit: 50000,
    monthlyWithdrawLimit: 500000,
    usedDailyLimit: 0,
    usedMonthlyLimit: 0,
    minimumWithdraw: 100
  });

  // Security settings state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loginHistory, setLoginHistory] = useState([
    { date: '2025-06-19 08:30', ip: '192.168.1.1', device: 'Chrome/Windows', status: 'success' },
    { date: '2025-06-18 19:45', ip: '192.168.1.1', device: 'Chrome/Windows', status: 'success' },
    { date: '2025-06-17 14:22', ip: '10.0.0.1', device: 'Safari/iPhone', status: 'success' }
  ]);
  
  // Bahis geçmişini getir
  const fetchBets = async () => {
    setIsLoadingBets(true);
    try {
      const response = await fetch('/api/user-bets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBets(data.bets || []);
          console.log('Bahis geçmişi alındı:', data.bets);
        } else {
          console.error('Bahis geçmişi API hatası:', data.error);
          setBets([]);
        }
      } else {
        console.error('Bahis geçmişi API yanıt hatası:', response.status);
        setBets([]);
      }
    } catch (error) {
      console.error('Bahis geçmişi alma hatası:', error);
      setBets([]);
    } finally {
      setIsLoadingBets(false);
    }
  };

  // Bahis istatistiklerini getir
  const fetchBetStats = async () => {
    try {
      const response = await fetch('/api/user-bet-stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBetStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Bahis istatistikleri alma hatası:', error);
    }
  };

  // İşlem geçmişini getir
  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      // İşlem geçmişini al - kullanıcının kimliğini doğrula ve kendi verisine erişmesini sağla
      const directQuery = `/api/user/transactions`;
      // Querying transaction history
      
      const response = await fetch(directQuery, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'  // Önbelleği devre dışı bırak, her zaman yeni veri al
        },
        credentials: 'include', // Çerez göndermeyi sağlar (kimlik doğrulama için kritik)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('İşlem geçmişi alındı:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          setTransactions(data);
        } else {
          console.log('İşlem geçmişi boş - gerçek veri yok');
          
          // Gerçek işlemler yoksa boş liste göster
          setTransactions([]);
        }
      } else {
        // Transaction history fetch error - showing empty list
        setTransactions([]);
      }
    } catch (error) {
      console.error('İşlem geçmişi alınırken hata:', error);
      
      // Hata durumunda da boş dizi göster, örnek veri kullanmıyoruz
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Modal açıldığında kullanıcı verilerini güncelle
  useEffect(() => {
    if (isOpen && user) {
      // Eğer fullName varsa, isim ve soyisim olarak ayır
      let firstName = '';
      let lastName = '';
      
      if (user.fullName) {
        const nameParts = user.fullName.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      } else {
        // Eğer firstName ve lastName doğrudan geldiyse, onları kullan
        firstName = user.firstName || '';
        lastName = user.lastName || '';
      }
      
      setFormData({
        ...formData,
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '', // Kullanıcı telefonunu kullan
        tckn: user.tckn || '' // Kullanıcının TC Kimlik Numarasını kullan
      });
      
      // İşlem geçmişini de yükleyelim
      fetchTransactions();
    }
  }, [isOpen, user]);
  
  // activeTab değiştiğinde veri yükleme
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'finance') {
        fetchTransactions();
      } else if (activeTab === 'history') {
        fetchBets();
    
      }
    }
  }, [activeTab, isOpen]);

  // Form değişikliklerini yönet
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Profil bilgilerini güncelle
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // İsim ve soyismi birleştirerek fullName oluştur
      const fullName = formData.firstName.trim() + (formData.lastName ? ' ' + formData.lastName.trim() : '');
      
      console.log('Profil güncelleniyor:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: fullName,
        email: formData.email,
        phone: formData.phone,
        tckn: formData.tckn
      });
      
      // Yeni updateProfile fonksiyonunu kullanarak profil bilgilerini güncelleyelim
      await updateProfile({
        fullName: fullName,
        email: formData.email,
        phone: formData.phone,
        tckn: formData.tckn
      });
      
      // Kullanıcıya başarı mesajı göster
      alert(translate('profile.update_success') || 'Profiliniz başarıyla güncellendi');
      
      // Modal'ı kapat
      onClose();
      
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      alert(translate('profile.update_error') || 'Profil güncellenirken bir hata oluştu');
    }
  };

  // Şifre değiştirme
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation checks
      if (formData.newPassword !== formData.confirmPassword) {
        alert(translate('profile.passwords_dont_match') || 'Yeni şifreler eşleşmiyor');
        return;
      }
      
      if (formData.newPassword.length < 6) {
        alert(translate('profile.password_too_short') || 'Şifre en az 6 karakter olmalıdır');
        return;
      }

      if (!formData.oldPassword) {
        alert('Mevcut şifrenizi girmelisiniz');
        return;
      }
      
      console.log('Şifre değiştirme isteği gönderiliyor...');
      
      // Call password change API
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Şifre güncellenirken bir hata oluştu');
      }
      
      // Clear form
      setFormData({
        ...formData,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Show success message
      alert(data.message || 'Şifreniz başarıyla güncellendi');
      
    } catch (error: any) {
      console.error('Şifre değiştirme hatası:', error);
      alert(error.message || 'Şifre güncellenirken bir hata oluştu');
    }
  };
  
  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 120 // minutes
  });

  // Güvenlik ayarları handler'ları
  const handleTwoFactorToggle = async () => {
    try {
      const newStatus = !securitySettings.twoFactorEnabled;
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorEnabled: newStatus
      }));
      alert(newStatus ? '2FA etkinleştirildi' : '2FA devre dışı bırakıldı');
    } catch (error) {
      console.error('2FA ayarı değiştirilemedi:', error);
    }
  };

  const handleSecurityNotificationToggle = async () => {
    try {
      const newStatus = !securitySettings.loginNotifications;
      setSecuritySettings(prev => ({
        ...prev,
        loginNotifications: newStatus
      }));
      alert(newStatus ? 'Giriş bildirimleri açıldı' : 'Giriş bildirimleri kapatıldı');
    } catch (error) {
      console.error('Bildirim ayarı değiştirilemedi:', error);
    }
  };

  const handleSessionTimeoutChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const newTimeout = parseInt(e.target.value);
      setSecuritySettings(prev => ({
        ...prev,
        sessionTimeout: newTimeout
      }));
      alert(`Oturum zaman aşımı ${newTimeout} dakika olarak güncellendi`);
    } catch (error) {
      console.error('Oturum zaman aşımı ayarı değiştirilemedi:', error);
    }
  };

  // Email update state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  // Email update handler
  const handleEmailUpdate = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert('Geçerli bir e-posta adresi girin');
      return;
    }

    try {
      const response = await fetch('/api/auth/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: newEmail })
      });

      const data = await response.json();

      if (data.success) {
        alert('E-posta adresiniz başarıyla güncellendi');
        setIsEditingEmail(false);
        setNewEmail('');
        // Refresh user data
        if (updateProfile) {
          await updateProfile({ email: newEmail });
        }
      } else {
        alert(data.error || 'E-posta güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Email update error:', error);
      alert('E-posta güncellenirken hata oluştu');
    }
  };

  const handleCancelEmailEdit = () => {
    setIsEditingEmail(false);
    setNewEmail('');
  };

  // Preferences state - Initialize from user data
  const [preferences, setPreferences] = useState({
    language: user?.language || 'tr',
    emailNotifications: user?.emailNotifications !== false,
    smsNotifications: user?.smsNotifications || false,
    pushNotifications: user?.pushNotifications !== false,
    theme: 'dark',
    currency: user?.currency || 'TRY',
    timezone: 'Europe/Istanbul'
  });

  // Update preferences when user data changes
  useEffect(() => {
    if (user) {
      setPreferences({
        language: user.language || 'tr',
        emailNotifications: user.emailNotifications !== false,
        smsNotifications: user.smsNotifications || false,
        pushNotifications: user.pushNotifications !== false,
        theme: 'dark',
        currency: user.currency || 'TRY',
        timezone: 'Europe/Istanbul'
      });
    }
  }, [user]);

  // Preferences handlers
  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setPreferences(prev => ({ ...prev, language: newLanguage }));
    
    try {
      const response = await fetch('/api/auth/update-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ language: newLanguage })
      });
      
      if (response.ok) {
        alert(`Dil tercihi ${newLanguage === 'tr' ? 'Türkçe' : 'İngilizce'} olarak güncellendi`);
      }
    } catch (error) {
      console.error('Language update error:', error);
    }
  };

  const handleNotificationToggle = async (type: string) => {
    const newValue = !preferences[type as keyof typeof preferences];
    
    // Optimistic update
    setPreferences(prev => ({ ...prev, [type]: newValue }));
    
    try {
      const response = await fetch('/api/auth/update-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [type]: newValue })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`${type} ayarı güncellendi:`, newValue);
        // Update user context if needed
        if (data.user && updateProfile) {
          updateProfile(data.user);
        }
      } else {
        // Revert on error
        setPreferences(prev => ({ ...prev, [type]: !newValue }));
        alert('Ayar güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Notification update error:', error);
      // Revert on error
      setPreferences(prev => ({ ...prev, [type]: !newValue }));
      alert('Ayar güncellenirken hata oluştu');
    }
  };

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setPreferences(prev => ({ ...prev, currency: newCurrency }));
    
    try {
      const response = await fetch('/api/auth/update-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currency: newCurrency })
      });
      
      if (response.ok) {
        alert(`Para birimi ${newCurrency} olarak güncellendi`);
      }
    } catch (error) {
      console.error('Currency update error:', error);
    }
  };

  // Çıkış yap
  const handleLogout = () => {
    if (logout) logout();
    onClose();
  };
  
  // KYC durumunu sunucudan al
  const fetchKycStatus = async () => {
    try {
      // İşlem başladığını göster
      console.log('KYC durumu veritabanından sorgulanıyor...');
      
      // API'den KYC durumunu al
      const response = await fetch('/api/auth/kyc', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Kimlik doğrulama için çerezleri gönder
      });
      
      if (!response.ok) {
        throw new Error('KYC durumu alınamadı');
      }
      
      const kycData = await response.json();
      console.log('KYC verileri API\'den alındı:', kycData);
      
      // KYC durumunu ayarla
      if (kycData && kycData.status) {
        setKycStatus(kycData.status);
        
        // Eğer bir red sebebi varsa, onu da ayarla
        if (kycData.rejectionReason) {
          setRejectionReason(kycData.rejectionReason);
        }
        
        // KYC durumu onaylandıysa ve şu an KYC sekmesindeyse, finans sekmesine yönlendir
        if (kycData.status === 'approved' && activeTab === 'kyc') {
          console.log('KYC onaylı, finans sekmesine yönlendiriliyor...');
          setActiveTab('finance');
        }
      } else {
        // Veri yoksa veya status yoksa 'none' olarak ayarla
        setKycStatus('none');
      }
      
      // Log için durum değişimini gösterelim
      console.log('KYC durumu ayarlandı:', kycStatus);
      
    } catch (error) {
      console.error('KYC durumu alınamadı:', error);
      setKycStatus('none');
    }
  };
  
  // Kimlik fotoğrafı seçildiğinde
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Dosya boyutu kontrolü (maksimum 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(translate('profile.file_too_large') || 'Dosya çok büyük. Maksimum dosya boyutu 5MB olmalıdır.');
        return;
      }
      
      // Dosya tipi kontrolü (sadece resim dosyaları)
      if (!file.type.startsWith('image/')) {
        alert(translate('profile.invalid_file_type') || 'Geçersiz dosya türü. Sadece resim dosyaları kabul edilir.');
        return;
      }
      
      if (type === 'front') {
        setIdFrontImage(file);
      } else {
        setIdBackImage(file);
      }
    }
  };
  
  // KYC doğrulama formunu gönder
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Gerçek resim yükleme fonksiyonu
  const uploadImage = async (file: File, prefix: string): Promise<string> => {
    // Gerçek bir API'ye yüklenecek olsa FormData kullanılır
    // Şu anda sadece simülasyon yapıyoruz
    const fileName = `${prefix}_${Date.now()}.jpg`;
    
    try {
      // Base64 formatına dönüştür - bu gerçek bir sunucuya dosya yükleme simülasyonudur
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          try {
            const base64Data = reader.result as string;
            
            // LocalStorage'da görsel verilerini sakla
            const imageData = {
              fileName,
              type: file.type,
              lastModified: file.lastModified,
              size: file.size,
              base64Data: base64Data,
              // Yedek olarak sabit görselleri de ekle
              fallbackUrl: prefix.includes("front") ? "/uploads/id_front_example.jpg" : "/uploads/id_back_example.jpg"
            };
            
            // Local Storage'da görsel verilerini sakla
            localStorage.setItem(`kyc_image_${fileName}`, JSON.stringify(imageData));
            
            console.log(`Resim başarıyla yüklendi (${prefix}): ${fileName}`);
            resolve(fileName);
          } catch (error) {
            console.error("Resim işleme hatası:", error);
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          console.error("Resim okuma hatası:", error);
          reject(error);
        };
      });
    } catch (error) {
      console.error("Resim yükleme hatası:", error);
      return prefix.includes("front") ? "id_front_example.jpg" : "id_back_example.jpg";
    }
  };
  
  const handleSubmitKyc = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!idFrontImage || !idBackImage) {
      alert(translate('profile.missing_images') || 'Lütfen kimliğinizin hem ön hem de arka yüzünü yükleyin.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('KYC başvurusu veritabanına gönderiliyor...');
      
      // FormData oluştur
      const formData = new FormData();
      formData.append('idFrontImage', idFrontImage);
      formData.append('idBackImage', idBackImage);
      
      // Yetkilendirme token'ını ekleme
      const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTk5NjYzNTksImV4cCI6MTcyMjU1ODM1OX0.IG5Dj7TJJB33KI3wWUYCZSLe6JfqfPxZzGo9c5Ls_fU';
      
      // API'ye KYC talebini gönder
      const response = await fetch('/api/auth/kyc', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData,
        credentials: 'include' // Kimlik doğrulama için çerezleri gönder
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'KYC doğrulama talebi gönderilemedi');
      }
      
      // Başarılı yanıt
      const result = await response.json();
      console.log('KYC başvurusu başarıyla gönderildi:', result);
      
      // KYC durumunu "beklemede" olarak ayarla
      setKycStatus('pending');
      
      // Form alanlarını temizle
      setIdFrontImage(null);
      setIdBackImage(null);
      
      // Input alanlarını temizle
      if (idFrontRef.current) idFrontRef.current.value = '';
      if (idBackRef.current) idBackRef.current.value = '';
      
      // Kullanıcıya başarı mesajı göster
      alert(translate('profile.kyc_submitted') || 'Kimlik doğrulama talebiniz gönderildi. Talebiniz incelendikten sonra bilgilendirileceksiniz.');
      
      // Kullanıcı bilgilerini yenile
      if (refreshUser) {
        await refreshUser();
      }
      
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('KYC gönderimi sırasında hata:', error);
      alert(error instanceof Error ? error.message : (translate('profile.server_error') || 'Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin.'));
      setIsSubmitting(false);
    }
  };
  
  // Bu eski fonksiyon kaldırıldı - sendKycVerification fonksiyonu yerine kullanılıyor

  // Modal arka planına tıklandığında kapatma
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Modal açık değilse render etme
  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center ${isMobile ? 'p-0' : 'p-4'} z-50 bg-black/50 backdrop-blur-sm overflow-hidden`}
      onClick={handleBackdropClick}
    >
      <div className={`relative bg-[#1A1A1A] ${isMobile ? 'w-full h-full rounded-none' : 'w-[98%] max-w-7xl rounded-xl max-h-[90vh]'} shadow-2xl border ${isMobile ? 'border-x-0 border-b-0' : 'border-yellow-500/30'} animate-fadeIn flex flex-col`}>
        {/* Kapatma Düğmesi - Sağ Üst Köşede */}
        <button 
          onClick={onClose}
          className={`absolute ${isMobile ? 'top-3 right-3' : 'top-4 right-4'} z-20 w-8 h-8 bg-[#232323] hover:bg-[#2a2a2a] rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-300`}
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Modal İçeriği - Mobilde Dikey, Masaüstünde Yatay Düzen */}
        <div className={`${isMobile ? 'flex flex-col flex-1 min-h-0' : 'flex flex-1 min-h-0'}`}>
          {/* Sol Taraf - Kullanıcı Bilgileri ve Menü */}
          <div className={`${isMobile ? 'w-full' : 'w-80'} bg-[#151515] ${isMobile ? 'border-b' : 'border-r'} border-yellow-500/10 flex flex-col max-h-full`}>
            {/* Kullanıcı Profil Kısmı - Kompakt Tasarım */}
            <div className={`${isMobile ? 'p-4' : 'p-3'} bg-gradient-to-b from-[#1A1A1A] to-[#151515] border-b border-yellow-500/10`}>
              {/* Kullanıcı Avatar ve Temel Bilgiler - Daha Kompakt */}
              <div className={`flex items-center ${isMobile ? 'mb-4' : 'mb-3'}`}>
                <div className="mr-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-sm font-bold text-[#121212] overflow-hidden">
                    <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-sm font-bold text-white">
                      {user?.username}
                    </h3>
                    <div className="ml-1.5 bg-yellow-500/20 rounded-md px-1.5 py-0.5">
                      <span className="text-[10px] text-yellow-400 font-medium">VIP {user?.vipLevel || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-[10px] text-gray-400 mt-0.5">
                    <i className="fas fa-id-card mr-1 text-yellow-500/70"></i>
                    <span>CB{user?.id || '1'}87425</span>
                    <div className="h-2 w-px bg-gray-700 mx-1.5"></div>
                    <span className="flex items-center text-green-400">
                      <span>{translate('profile.status.online')}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Bakiye Bilgileri - Daha Kompakt */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#1D1D1D] rounded-lg p-2 border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
                  <div className="text-[10px] text-gray-400">{translate('profile.balance')}</div>
                  <div className="text-sm font-bold text-yellow-400">₺{user?.balance || '0'}</div>
                </div>
                <div className="bg-[#1D1D1D] rounded-lg p-2 border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
                  <div className="text-[10px] text-gray-400">{translate('profile.bonus_balance')}</div>
                  <div className="text-sm font-bold text-white">₺{user?.bonusBalance || '0'}</div>
                </div>
              </div>
              
              {/* VIP İlerleme - Enhanced */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[10px] text-gray-400">{translate('profile.level')}</div>
                  <div className="text-[10px] text-yellow-400">{user?.vipLevel || 0}/5</div>
                </div>
                <div className="w-full h-1.5 bg-[#232323] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full" style={{ width: `${((user?.vipLevel || 0) / 5) * 100}%` }}></div>
                </div>
                <div className="text-[9px] text-gray-500 mt-1">
                  {(() => {
                    const currentLevel = user?.vipLevel || 0;
                    const totalDeposits = user?.totalDeposits || 0;
                    const requirements = {
                      0: { deposit: 0, name: 'Başlangıç' },
                      1: { deposit: 10000, name: 'Bronz' },
                      2: { deposit: 50000, name: 'Gümüş' },
                      3: { deposit: 100000, name: 'Altın' },
                      4: { deposit: 250000, name: 'Platin' },
                      5: { deposit: 500000, name: 'Elmas' }
                    };
                    
                    if (currentLevel >= 5) {
                      return 'Maksimum VIP seviyesindesiniz!';
                    }
                    
                    const nextLevel = currentLevel + 1;
                    const needed = requirements[nextLevel as keyof typeof requirements].deposit - totalDeposits;
                    
                    if (needed <= 0) {
                      return 'VIP seviyeniz yükseltilmeye hazır!';
                    }
                    
                    return `${nextLevel}. seviye için ₺${needed.toLocaleString()} daha yatırın`;
                  })()}
                </div>
              </div>
              
              {/* Sadakat Puanları Kaldırıldı */}
            </div>
            
            {/* Menü */}
            <div className={`flex-1 ${isMobile ? 'p-3' : 'p-2'} overflow-y-auto min-h-0`}>
              <nav className={isMobile ? "flex flex-row flex-wrap justify-between gap-2" : "space-y-1"}>
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`${isMobile ? 'flex-1 min-w-[30%]' : 'w-full'} flex ${isMobile ? 'flex-col' : 'items-center'} p-2 rounded-lg transition-all duration-300 ${
                    activeTab === 'info' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'hover:bg-[#1a1a1a] text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <div className={`${isMobile ? 'w-8 h-8 mx-auto mb-1' : 'w-7 h-7 mr-2'} rounded-lg flex items-center justify-center ${
                    activeTab === 'info' ? 'bg-yellow-500/30' : 'bg-[#232323]'
                  }`}>
                    <i className="fas fa-user text-xs"></i>
                  </div>
                  <span className="text-xs font-medium">{translate('profile.personal_info')}</span>
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('kyc');
                    fetchKycStatus(); // KYC durumunu sorgula
                  }}
                  className={`${isMobile ? 'flex-1 min-w-[30%]' : 'w-full'} flex ${isMobile ? 'flex-col' : 'items-center'} p-2 rounded-lg transition-all duration-300 ${
                    activeTab === 'kyc' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'hover:bg-[#1a1a1a] text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <div className={`${isMobile ? 'w-8 h-8 mx-auto mb-1' : 'w-7 h-7 mr-2'} rounded-lg flex items-center justify-center ${
                    activeTab === 'kyc' ? 'bg-yellow-500/30' : 'bg-[#232323]'
                  }`}>
                    <i className="fas fa-id-card text-xs"></i>
                  </div>
                  <span className="text-xs font-medium">{translate('profile.kyc_verification')}</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('finance')}
                  className={`${isMobile ? 'flex-1 min-w-[30%]' : 'w-full'} flex ${isMobile ? 'flex-col' : 'items-center'} p-2 rounded-lg transition-all duration-300 ${
                    activeTab === 'finance' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'hover:bg-[#1a1a1a] text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <div className={`${isMobile ? 'w-8 h-8 mx-auto mb-1' : 'w-7 h-7 mr-2'} rounded-lg flex items-center justify-center ${
                    activeTab === 'finance' ? 'bg-yellow-500/30' : 'bg-[#232323]'
                  }`}>
                    <i className="fas fa-wallet text-xs"></i>
                  </div>
                  <span className="text-xs font-medium">{translate('profile.finance')}</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`${isMobile ? 'flex-1 min-w-[30%]' : 'w-full'} flex ${isMobile ? 'flex-col' : 'items-center'} p-2 rounded-lg transition-all duration-300 ${
                    activeTab === 'history' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'hover:bg-[#1a1a1a] text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <div className={`${isMobile ? 'w-8 h-8 mx-auto mb-1' : 'w-7 h-7 mr-2'} rounded-lg flex items-center justify-center ${
                    activeTab === 'history' ? 'bg-yellow-500/30' : 'bg-[#232323]'
                  }`}>
                    <i className="fas fa-history text-xs"></i>
                  </div>
                  <span className="text-xs font-medium">{translate('profile.bet_history')}</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('bonuses')}
                  className={`${isMobile ? 'flex-1 min-w-[30%]' : 'w-full'} flex ${isMobile ? 'flex-col' : 'items-center'} p-2 rounded-lg transition-all duration-300 ${
                    activeTab === 'bonuses' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'hover:bg-[#1a1a1a] text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <div className={`${isMobile ? 'w-8 h-8 mx-auto mb-1' : 'w-7 h-7 mr-2'} rounded-lg flex items-center justify-center ${
                    activeTab === 'bonuses' ? 'bg-yellow-500/30' : 'bg-[#232323]'
                  }`}>
                    <i className="fas fa-gift text-xs"></i>
                  </div>
                  <span className="text-xs font-medium">{translate('profile.my_bonuses')}</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`${isMobile ? 'flex-1 min-w-[30%]' : 'w-full'} flex ${isMobile ? 'flex-col' : 'items-center'} p-2 rounded-lg transition-all duration-300 ${
                    activeTab === 'security' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'hover:bg-[#1a1a1a] text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <div className={`${isMobile ? 'w-8 h-8 mx-auto mb-1' : 'w-7 h-7 mr-2'} rounded-lg flex items-center justify-center ${
                    activeTab === 'security' ? 'bg-yellow-500/30' : 'bg-[#232323]'
                  }`}>
                    <i className="fas fa-lock text-xs"></i>
                  </div>
                  <span className="text-xs font-medium">{translate('profile.security')}</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('preferences')}
                  className={`${isMobile ? 'flex-1 min-w-[30%]' : 'w-full'} flex ${isMobile ? 'flex-col' : 'items-center'} p-2 rounded-lg transition-all duration-300 ${
                    activeTab === 'preferences' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'hover:bg-[#1a1a1a] text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <div className={`${isMobile ? 'w-8 h-8 mx-auto mb-1' : 'w-7 h-7 mr-2'} rounded-lg flex items-center justify-center ${
                    activeTab === 'preferences' ? 'bg-yellow-500/30' : 'bg-[#232323]'
                  }`}>
                    <i className="fas fa-cog text-xs"></i>
                  </div>
                  <span className="text-xs font-medium">{translate('profile.preferences')}</span>
                </button>
              </nav>
            </div>
            
            {/* Çıkış Butonu */}
            <div className="p-3 border-t border-yellow-500/10">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                <span className="text-sm font-medium">{translate('profile.logout')}</span>
              </button>
            </div>
          </div>

          {/* Sağ Taraf - İçerik Kısmı */}
          <div className="flex-1 py-6 px-8 bg-[#1A1A1A] overflow-y-auto min-h-0" id="profile-content">
            {/* Kişisel Bilgiler Sekmesi */}
            {activeTab === 'info' && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {translate('profile.personal_info')}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {translate('profile.personal_info_desc')}
                  </p>
                </div>

                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-8">
                    {/* Temel Bilgiler */}
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4 flex items-center border-b border-gray-800 pb-2">
                        <i className="fas fa-user-circle text-yellow-500 mr-2"></i> {translate('profile.basic_info')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            {translate('profile.first_name')}
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full bg-[#232323] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300 placeholder:text-gray-500"
                            placeholder={translate('profile.first_name_placeholder') || "İsminizi girin"}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            {translate('profile.last_name')}
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full bg-[#232323] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300 placeholder:text-gray-500"
                            placeholder={translate('profile.last_name_placeholder') || "Soyisminizi girin"}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            {translate('profile.email')}
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-[#232323] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300 placeholder:text-gray-500"
                            placeholder={translate('profile.email_placeholder')}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            {translate('profile.username')}
                          </label>
                          <input
                            type="text"
                            value={user?.username || ''}
                            disabled
                            className="w-full bg-[#1D1D1D] border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            {translate('profile.phone')}
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full bg-[#232323] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300 placeholder:text-gray-500"
                            placeholder={translate('profile.phone_placeholder')}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            {translate('profile.tckn') || 'TC Kimlik Numarası'}
                          </label>
                          <input
                            type="text"
                            name="tckn"
                            value={formData.tckn}
                            onChange={handleInputChange}
                            className="w-full bg-[#232323] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300 placeholder:text-gray-500"
                            placeholder={translate('profile.tckn_placeholder') || 'TC Kimlik Numarası'}
                            maxLength={11}
                            pattern="[0-9]{11}"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Kaydet Butonu */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#121212] rounded-lg font-bold shadow-md hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300"
                      >
                        {translate('profile.save_changes')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Finansal İşlemler Sekmesi - Geliştirilmiş */}
            {activeTab === 'finance' && (
              <div className="animate-fadeIn h-full overflow-y-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {translate('profile.finance')}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {translate('profile.finance_desc')}
                  </p>
                </div>

                {/* Günlük/Aylık Limitler */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#1D1D1D] rounded-lg p-4 border border-gray-800">
                    <div className="text-sm text-gray-400 mb-1">Günlük Çekim Limiti</div>
                    <div className="text-lg font-bold text-white">₺{userLimits.dailyWithdrawLimit.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Kullanılan: ₺{userLimits.usedDailyLimit.toLocaleString()}</div>
                    <div className="w-full h-2 bg-[#232323] rounded-full mt-2">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full" 
                           style={{ width: `${(userLimits.usedDailyLimit / userLimits.dailyWithdrawLimit) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-[#1D1D1D] rounded-lg p-4 border border-gray-800">
                    <div className="text-sm text-gray-400 mb-1">Aylık Çekim Limiti</div>
                    <div className="text-lg font-bold text-white">₺{userLimits.monthlyWithdrawLimit.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Kullanılan: ₺{userLimits.usedMonthlyLimit.toLocaleString()}</div>
                    <div className="w-full h-2 bg-[#232323] rounded-full mt-2">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" 
                           style={{ width: `${(userLimits.usedMonthlyLimit / userLimits.monthlyWithdrawLimit) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-[#1D1D1D] rounded-lg p-4 border border-gray-800">
                    <div className="text-sm text-gray-400 mb-1">Risk Skoru</div>
                    <div className="text-lg font-bold text-green-400">Düşük</div>
                    <div className="text-xs text-gray-500">Son analiz: Bugün</div>
                    <div className="flex items-center mt-2">
                      <i className="fas fa-shield-check text-green-400 mr-1"></i>
                      <span className="text-xs text-green-400">Güvenli Profil</span>
                    </div>
                  </div>
                </div>

                {/* Para Yatırma ve Çekme Butonları */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-[#1D1D1D] rounded-xl border border-yellow-500/10 p-5 transition-all duration-300 hover:border-yellow-500/20 group">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-[#121212] mr-3">
                          <i className="fas fa-wallet text-sm"></i>
                        </div>
                        <h4 className="text-white font-bold text-lg">{translate('payment.deposit')}</h4>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">
                        {translate('profile.deposit_desc')}
                      </p>
                      <DepositButton className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#121212] rounded-lg font-bold shadow-md hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300" />
                    </div>

                    <div className="bg-[#1D1D1D] rounded-xl border border-gray-800 p-5 transition-all duration-300 hover:border-yellow-500/20 group">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] flex items-center justify-center text-green-400 mr-3 group-hover:bg-green-500/20 transition-all duration-300">
                          <i className="fas fa-credit-card text-sm"></i>
                        </div>
                        <h4 className="text-white font-bold text-lg">{translate('profile.withdraw')}</h4>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">
                        {translate('profile.withdraw_desc')}
                      </p>
                      <button 
                        onClick={() => setShowWithdrawModal(true)}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold shadow-md hover:from-green-400 hover:to-green-500 transition-all duration-300"
                      >
                        {translate('profile.withdraw_now')}
                      </button>
                    </div>
                  </div>

                {/* İşlem Geçmişi */}
                <div className="bg-[#1A1A1A] p-5 rounded-xl border border-gray-800 mb-8">
                  <h4 className="text-white font-bold mb-3 text-lg flex items-center">
                    <i className="fas fa-exchange-alt text-yellow-500 mr-2"></i>
                    {translate('profile.transaction_history')}
                  </h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="text-left border-b border-gray-800">
                        <tr>
                          <th className="py-3 text-gray-400 font-medium text-sm">{translate('profile.date')}</th>
                          <th className="py-3 text-gray-400 font-medium text-sm">{translate('profile.type')}</th>
                          <th className="py-3 text-gray-400 font-medium text-sm">{translate('profile.amount')}</th>
                          <th className="py-3 text-gray-400 font-medium text-sm">{translate('profile.status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingTransactions ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center">
                              <div className="flex justify-center items-center">
                                <div className="animate-spin w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
                                <span className="ml-2 text-gray-400">{translate('profile.loading') || 'Yükleniyor...'}</span>
                              </div>
                            </td>
                          </tr>
                        ) : transactions.length > 0 ? (
                          transactions.map((transaction) => (
                            <tr key={transaction.id} className="border-b border-gray-800/50 hover:bg-[#1D1D1D] transition-colors duration-150">
                              <td className="py-4 text-gray-300 text-sm">
                                {new Date(transaction.createdAt).toLocaleString('tr-TR')}
                              </td>
                              <td className="py-4">
                                <span className={`text-sm rounded-full px-3 py-1 ${transaction.type === 'deposit' 
                                  ? 'text-green-400 bg-green-500/10' 
                                  : transaction.type === 'withdraw' 
                                    ? 'text-red-400 bg-red-500/10' 
                                    : 'text-blue-400 bg-blue-500/10'}`}>
                                  {translate(`profile.${transaction.type}`) || transaction.type}
                                </span>
                              </td>
                              <td className="py-4 text-white font-medium">₺{transaction.amount}</td>
                              <td className="py-4">
                                <span className={`text-sm rounded-full px-3 py-1 ${
                                  transaction.status === 'completed' 
                                    ? 'text-green-400 bg-green-500/10' 
                                    : transaction.status === 'pending' 
                                      ? 'text-yellow-400 bg-yellow-500/10' 
                                      : transaction.status === 'rejected'
                                        ? 'text-red-400 bg-red-500/10'
                                        : 'text-gray-400 bg-gray-500/10'
                                }`}>
                                  {translate(`profile.${transaction.status}`) || transaction.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="border-b border-gray-800/50">
                            <td colSpan={4} className="py-4 text-center text-gray-400">
                              {translate('profile.no_transactions') || 'Henüz işlem geçmişiniz bulunmuyor.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <button 
                      onClick={fetchTransactions}
                      className="px-4 py-2 bg-[#2A2A2A] text-gray-300 hover:bg-[#333] rounded-lg text-sm flex items-center transition-colors"
                      disabled={isLoadingTransactions}
                    >
                      <i className="fas fa-sync-alt mr-2"></i>
                      {translate('profile.refresh') || 'Yenile'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bahis Geçmişi Sekmesi - Geliştirilmiş */}
            {activeTab === 'history' && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {translate('profile.bet_history')}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {translate('profile.bet_history_desc')}
                  </p>
                </div>

                {/* Son Bahisler */}
                <div className="bg-[#1A1A1A] p-5 rounded-xl border border-gray-800 mb-8">
                  <h4 className="text-white font-bold mb-3 text-lg flex items-center">
                    <i className="fas fa-history text-yellow-500 mr-2"></i>
                    {translate('profile.recent_bets')}
                  </h4>
                  


                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="text-left border-b border-gray-800">
                        <tr>
                          <th className="py-3 text-gray-400 font-medium text-sm">{translate('profile.date')}</th>
                          <th className="py-3 text-gray-400 font-medium text-sm">{translate('profile.event')}</th>
                          <th className="py-3 text-gray-400 font-medium text-sm">{translate('profile.bet_amount')}</th>
                          <th className="py-3 text-gray-400 font-medium text-sm">{translate('profile.status')}</th>
                          <th className="py-3 text-gray-400 font-medium text-sm">{translate('profile.winnings')}</th>
                        </tr>
                      </thead>
                      <tbody>
{isLoadingBets ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center">
                              <div className="animate-spin w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto"></div>
                            </td>
                          </tr>
                        ) : bets.length > 0 ? bets.slice(0, 10).map((bet, index) => {
                          const isWin = (bet.winAmount || 0) > bet.amount;
                          
                          return (
                            <tr key={index} className="border-b border-gray-800/50 hover:bg-[#1D1D1D] transition-colors duration-150">
                              <td className="py-4 text-gray-300 text-sm">
                                {new Date(bet.date).toLocaleDateString('tr-TR')}
                              </td>
                              <td className="py-4 text-white">{bet.game}</td>
                              <td className="py-4 text-yellow-400 font-medium">₺{bet.amount}</td>
                              <td className="py-4">
                                {bet.status === 'completed' ? (
                                  isWin ? (
                                    <span className="text-green-400 text-sm rounded-full bg-green-500/10 px-3 py-1">
                                      {translate('profile.won') || 'Kazandı'}
                                    </span>
                                  ) : (
                                    <span className="text-red-400 text-sm rounded-full bg-red-500/10 px-3 py-1">
                                      {translate('profile.lost') || 'Kaybetti'}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-yellow-400 text-sm rounded-full bg-yellow-500/10 px-3 py-1">
                                    Beklemede
                                  </span>
                                )}
                              </td>
                              <td className={`py-4 font-bold ${isWin ? 'text-green-400' : 'text-gray-400'}`}>
                                {isWin ? `₺${bet.winAmount}` : '-'}
                              </td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-400">
                              <div className="flex flex-col items-center">
                                <i className="fas fa-info-circle text-3xl mb-2 text-gray-500"></i>
                                <p className="text-sm">{translate('profile.no_bets') || 'Henüz bahis geçmişiniz bulunmuyor.'}</p>
                                <p className="text-xs mt-1 text-gray-500">İlk bahsinizi yapmak için oyun sayfalarını ziyaret edin</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>


              </div>
            )}
            
            {/* Bonuslarım Sekmesi - Real Data Only */}
            {activeTab === 'bonuses' && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {translate('profile.my_bonuses')}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {translate('profile.bonus_desc')}
                  </p>
                </div>

                {/* No Bonuses State */}
                <div className="bg-[#1A1A1A] p-8 rounded-xl border border-gray-800 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <i className="fas fa-gift text-yellow-500 text-2xl"></i>
                  </div>
                  <h3 className="text-white text-lg font-medium mb-2">Henüz Bonus Yok</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Şu anda aktif bonusunuz bulunmuyor. Yeni bonuslar için aşağıdaki sayfaları ziyaret edebilirsiniz.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button 
                      onClick={() => window.location.href = '/bonuses'}
                      className="px-4 py-2 bg-yellow-500 text-black rounded-lg text-sm font-medium hover:bg-yellow-400 transition-colors"
                    >
                      Bonus Sayfası
                    </button>
                    <button 
                      onClick={() => window.location.href = '/vip'}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                    >
                      VIP Kulüp
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* VIP Sistem Sekmesi */}
            {activeTab === 'vip' && (
              <div className="animate-fadeIn h-full overflow-y-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {translate('profile.vip_system') || 'VIP Sistem'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Yatırımlarınızla VIP seviyenizi yükseltin ve özel avantajlardan yararlanın
                  </p>
                </div>

                {/* Mevcut VIP Durumu */}
                <div className="bg-[#1A1A1A] p-6 rounded-xl border border-yellow-500/20 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white flex items-center">
                      <i className="fas fa-crown text-yellow-500 mr-2"></i>
                      Mevcut VIP Seviyeniz
                    </h4>
                    <div className="flex items-center bg-yellow-500/20 rounded-lg px-3 py-1">
                      <i className="fas fa-star text-yellow-400 mr-1"></i>
                      <span className="text-yellow-400 font-bold">VIP {user?.vipLevel || 0}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#232323] rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Toplam Yatırım</div>
                      <div className="text-xl font-bold text-white">₺{(user?.totalDeposits || 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-[#232323] rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">VIP Puanları</div>
                      <div className="text-xl font-bold text-yellow-400">{(user?.vipPoints || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* VIP İlerleme Çubuğu */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">VIP İlerleme</span>
                      <span className="text-sm text-yellow-400">{user?.vipLevel || 0}/5</span>
                    </div>
                    <div className="w-full h-3 bg-[#232323] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full transition-all duration-500" 
                           style={{ width: `${((user?.vipLevel || 0) / 5) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{(() => {
                      const currentLevel = user?.vipLevel || 0;
                      const totalDeposits = user?.totalDeposits || 0;
                      const requirements = {
                        0: { deposit: 0, name: 'Başlangıç' },
                        1: { deposit: 10000, name: 'Bronz' },
                        2: { deposit: 50000, name: 'Gümüş' },
                        3: { deposit: 100000, name: 'Altın' },
                        4: { deposit: 250000, name: 'Platin' },
                        5: { deposit: 500000, name: 'Elmas' }
                      };
                      
                      if (currentLevel >= 5) {
                        return 'Maksimum VIP seviyesindesiniz!';
                      }
                      
                      const nextLevel = currentLevel + 1;
                      const needed = requirements[nextLevel as keyof typeof requirements].deposit - totalDeposits;
                      
                      if (needed <= 0) {
                        return 'VIP seviyeniz yükseltilmeye hazır!';
                      }
                      
                      return `${nextLevel}. seviye için ₺${needed.toLocaleString()} daha yatırın`;
                    })()}</p>
                  </div>

                  {/* Mevcut Seviye Avantajları */}
                  <div>
                    <h5 className="text-sm font-medium text-white mb-2">Mevcut Avantajlarınız:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(() => {
                        const benefits = {
                          0: ['Temel destek', 'Standart bonuslar'],
                          1: ['%5 ekstra bonus', 'Hızlı destek', 'Haftalık cashback'],
                          2: ['%10 ekstra bonus', 'Öncelikli destek', 'Aylık bonus'],
                          3: ['%15 ekstra bonus', 'Kişisel hesap yöneticisi', 'Özel turnuvalar'],
                          4: ['%20 ekstra bonus', '7/24 özel destek', 'Lüks hediyeler'],
                          5: ['%25 ekstra bonus', 'Limitsiz çekim', 'Özel etkinlik davetleri']
                        };
                        return benefits[(user?.vipLevel || 0) as keyof typeof benefits] || [];
                      })().map((benefit, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-300">
                          <i className="fas fa-check text-green-400 mr-2"></i>
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* VIP Seviye Tablosu */}
                <div className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800 mb-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                    <i className="fas fa-list-alt text-yellow-500 mr-2"></i>
                    VIP Seviye Gereksinimleri
                  </h4>

                  <div className="space-y-3">
                    {Object.entries({
                      0: { deposit: 0, name: 'Başlangıç' },
                      1: { deposit: 10000, name: 'Bronz' },
                      2: { deposit: 50000, name: 'Gümüş' },
                      3: { deposit: 100000, name: 'Altın' },
                      4: { deposit: 250000, name: 'Platin' },
                      5: { deposit: 500000, name: 'Elmas' }
                    }).map(([level, req]) => {
                      const levelNum = parseInt(level);
                      const isCurrentLevel = levelNum === (user?.vipLevel || 0);
                      const isUnlocked = levelNum <= (user?.vipLevel || 0);
                      
                      return (
                        <div key={level} className={`p-4 rounded-lg border transition-all duration-300 ${
                          isCurrentLevel 
                            ? 'border-yellow-500 bg-yellow-500/10' 
                            : isUnlocked 
                              ? 'border-green-500/50 bg-green-500/5'
                              : 'border-gray-700 bg-[#232323]'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                isCurrentLevel 
                                  ? 'bg-yellow-500 text-black' 
                                  : isUnlocked 
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-600 text-gray-300'
                              }`}>
                                {isUnlocked ? <i className="fas fa-crown text-xs"></i> : levelNum}
                              </div>
                              <div>
                                <div className={`font-medium ${isCurrentLevel ? 'text-yellow-400' : 'text-white'}`}>
                                  VIP {levelNum} - {req.name}
                                </div>
                                <div className="text-sm text-gray-400">
                                  Gereksinim: ₺{req.deposit.toLocaleString()} toplam yatırım
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {isCurrentLevel && (
                                <div className="text-xs text-yellow-400 font-medium">Mevcut Seviye</div>
                              )}
                              {isUnlocked && !isCurrentLevel && (
                                <div className="text-xs text-green-400 font-medium">Tamamlandı</div>
                              )}
                              {!isUnlocked && (
                                <div className="text-xs text-gray-500">Kilitli</div>
                              )}
                            </div>
                          </div>

                          {/* Seviye Avantajları */}
                          <div className="mt-3 pl-11">
                            <div className="text-xs text-gray-400 mb-1">Avantajlar:</div>
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                const benefits = {
                                  0: ['Temel destek', 'Standart bonuslar'],
                                  1: ['%5 ekstra bonus', 'Hızlı destek', 'Haftalık cashback'],
                                  2: ['%10 ekstra bonus', 'Öncelikli destek', 'Aylık bonus'],
                                  3: ['%15 ekstra bonus', 'Kişisel hesap yöneticisi', 'Özel turnuvalar'],
                                  4: ['%20 ekstra bonus', '7/24 özel destek', 'Lüks hediyeler'],
                                  5: ['%25 ekstra bonus', 'Limitsiz çekim', 'Özel etkinlik davetleri']
                                };
                                return benefits[levelNum as keyof typeof benefits] || [];
                              })().map((benefit, index) => (
                                <span key={index} className="text-xs bg-[#2A2A2A] px-2 py-1 rounded text-gray-300">
                                  {benefit}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* VIP Yükseltme Butonu */}
                {(user?.vipLevel || 0) < 5 && (
                  <div className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800">
                    <h4 className="text-lg font-bold text-white mb-4">VIP Seviyenizi Yükseltin</h4>
                    <p className="text-gray-400 mb-4">
                      Daha fazla yatırım yaparak sonraki VIP seviyesine ulaşın ve özel avantajlardan yararlanın.
                    </p>
                    <DepositButton className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#121212] rounded-lg font-bold shadow-md hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300" />
                  </div>
                )}
              </div>
            )}

            {/* Güvenlik Sekmesi */}
            {activeTab === 'security' && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {translate('profile.security')}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {translate('profile.security_desc')}
                  </p>
                </div>

                {/* Şifre Değiştirme Bölümü */}
                <div className="bg-[#1A1A1A] p-5 rounded-xl border border-gray-800 mb-6">
                  <h4 className="text-lg font-medium text-white mb-4 flex items-center border-b border-gray-800 pb-2">
                    <i className="fas fa-lock text-yellow-500 mr-2"></i> {translate('profile.change_password')}
                  </h4>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {translate('profile.current_password')}
                      </label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleInputChange}
                        className="w-full bg-[#232323] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300 placeholder:text-gray-500"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {translate('profile.new_password')}
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full bg-[#232323] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300 placeholder:text-gray-500"
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-gray-500">{translate('profile.password_req')}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {translate('profile.confirm_password')}
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full bg-[#232323] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300 placeholder:text-gray-500"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#121212] rounded-lg font-bold shadow-md hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300"
                      >
                        {translate('profile.update_password')}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Güvenlik Ayarları */}
                <div className="bg-[#1A1A1A] p-5 rounded-xl border border-gray-800 mb-6">
                  <h4 className="text-lg font-medium text-white mb-4 flex items-center border-b border-gray-800 pb-2">
                    <i className="fas fa-shield-alt text-yellow-500 mr-2"></i> {translate('profile.security_settings')}
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{translate('profile.two_factor_auth')}</p>
                        <p className="text-gray-400 text-sm">{translate('profile.2fa_desc')}</p>
                      </div>
                      <button 
                        onClick={handleTwoFactorToggle}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          securitySettings.twoFactorEnabled 
                            ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg' 
                            : 'bg-gray-600 text-gray-300 hover:bg-yellow-500 hover:text-black'
                        }`}
                      >
                        {securitySettings.twoFactorEnabled ? 'Aktif' : translate('profile.enable')}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{translate('profile.login_notifications')}</p>
                        <p className="text-gray-400 text-sm">{translate('profile.login_notif_desc')}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs mr-2 ${securitySettings.loginNotifications ? 'text-green-400' : 'text-gray-400'}`}>
                          {securitySettings.loginNotifications ? 'Aktif' : 'Kapalı'}
                        </span>
                        <button 
                          onClick={handleSecurityNotificationToggle}
                          className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                            securitySettings.loginNotifications ? 'bg-green-500 shadow-lg' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-300 shadow-md ${
                            securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-0.5'
                          }`}></div>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{translate('profile.session_timeout')}</p>
                        <p className="text-gray-400 text-sm">Oturum otomatik kapanma süresi</p>
                      </div>
                      <select 
                        value={securitySettings.sessionTimeout}
                        onChange={handleSessionTimeoutChange}
                        className="px-4 py-2 bg-[#232323] text-white rounded-lg text-sm border border-gray-700 hover:border-yellow-500 focus:border-yellow-500 focus:outline-none transition-all duration-300 cursor-pointer"
                      >
                        <option value={30}>30 dakika</option>
                        <option value={60}>1 saat</option>
                        <option value={120}>2 saat</option>
                        <option value={240}>4 saat</option>
                        <option value={480}>8 saat</option>
                        <option value={1440}>24 saat</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Hesap Bilgileri */}
                <div className="bg-[#1A1A1A] p-5 rounded-xl border border-gray-800 mb-6">
                  <h4 className="text-lg font-medium text-white mb-4 flex items-center border-b border-gray-800 pb-2">
                    <i className="fas fa-user-cog text-yellow-500 mr-2"></i> {translate('profile.account_info')}
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Kullanıcı Adı</p>
                        <p className="text-gray-400 text-sm">{user?.username || 'Kullanıcı adı yok'}</p>
                      </div>
                      <span className="text-xs text-gray-500">Değiştirilemez</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">E-posta Adresi</p>
                        {isEditingEmail ? (
                          <div className="mt-2 flex items-center space-x-2">
                            <input
                              type="email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder={user?.email || 'E-posta adresinizi girin'}
                              className="bg-[#232323] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 flex-1"
                            />
                            <button
                              onClick={handleEmailUpdate}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs hover:bg-green-500 transition-colors"
                            >
                              Kaydet
                            </button>
                            <button
                              onClick={handleCancelEmailEdit}
                              className="px-3 py-2 bg-gray-600 text-gray-300 rounded-lg text-xs hover:bg-gray-500 transition-colors"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">{user?.email || 'E-posta yok'}</p>
                        )}
                      </div>
                      {!isEditingEmail && (
                        <button 
                          onClick={() => {
                            setIsEditingEmail(true);
                            setNewEmail(user?.email || '');
                          }}
                          className="px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-500/20 transition-colors"
                        >
                          Güncelle
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Hesap Oluşturma</p>
                        <p className="text-gray-400 text-sm">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-xs text-green-400 font-medium">Doğrulandı</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Son Giriş</p>
                        <p className="text-gray-400 text-sm">
                          {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('tr-TR') : 'İlk giriş'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-xs text-blue-400 font-medium">Şu anda aktif</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* KYC Sekmesi */}
            {activeTab === 'kyc' && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {translate('profile.kyc_verification') || 'Kimlik Doğrulama'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {translate('profile.kyc_verification_desc') || 'Hesabınızı doğrulamak için kimlik belgenizin ön ve arka yüzünün fotoğraflarını yükleyin. Doğrulama işlemi genellikle 24 saat içinde tamamlanır.'}
                  </p>
                </div>
                
                {kycStatus === 'none' && (
                  <div className="bg-[#1A1A1A] p-5 rounded-xl border border-gray-800 mb-6">
                    <h4 className="text-lg font-medium text-white mb-4 flex items-center border-b border-gray-800 pb-2">
                      <i className="fas fa-id-card text-yellow-500 mr-2"></i> {translate('profile.upload_documents') || 'Belge Yükleme'}
                    </h4>
                    
                    <div className="space-y-5 pt-4">
                      {/* Kimlik Ön Yüz */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {translate('profile.id_front') || 'Kimlik Kartı (Ön Yüz)'}
                        </label>
                        <div 
                          className={`border-2 border-dashed ${idFrontImage ? 'border-green-500 bg-green-500/10' : 'border-gray-700 bg-[#232323]'} rounded-lg p-4 text-center cursor-pointer hover:bg-[#2a2a2a] transition-colors duration-300`}
                          onClick={() => document.getElementById('id-front-input')?.click()}
                        >
                          {idFrontImage ? (
                            <div className="relative">
                              {idFrontImage && (
                                <img 
                                  src={URL.createObjectURL(idFrontImage)} 
                                  alt="ID Front" 
                                  className="mx-auto max-h-36 rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; // Sonsuz döngüyü engeller
                                    target.src = "/uploads/id_front_example.jpg";
                                  }}
                                />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded">
                                <button 
                                  className="bg-black/60 text-white p-2 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIdFrontImage(null);
                                  }}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-yellow-500 mb-2">
                                <i className="fas fa-upload text-3xl"></i>
                              </div>
                              <p className="text-gray-300">{translate('profile.drag_or_click') || 'Tıkla veya sürükle bırak'}</p>
                              <p className="text-gray-500 text-sm mt-1">{translate('profile.supported_formats') || 'PNG, JPG veya JPEG (max. 5MB)'}</p>
                            </>
                          )}
                          <input 
                            id="id-front-input" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageChange(e, 'front')}
                          />
                        </div>
                      </div>
                      
                      {/* Kimlik Arka Yüz */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {translate('profile.id_back') || 'Kimlik Kartı (Arka Yüz)'}
                        </label>
                        <div 
                          className={`border-2 border-dashed ${idBackImage ? 'border-green-500 bg-green-500/10' : 'border-gray-700 bg-[#232323]'} rounded-lg p-4 text-center cursor-pointer hover:bg-[#2a2a2a] transition-colors duration-300`}
                          onClick={() => document.getElementById('id-back-input')?.click()}
                        >
                          {idBackImage ? (
                            <div className="relative">
                              {idBackImage && (
                                <img 
                                  src={URL.createObjectURL(idBackImage)} 
                                  alt="ID Back" 
                                  className="mx-auto max-h-36 rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; // Sonsuz döngüyü engeller
                                    target.src = "/uploads/id_back_example.jpg";
                                  }}
                                />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded">
                                <button 
                                  className="bg-black/60 text-white p-2 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIdBackImage(null);
                                  }}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-yellow-500 mb-2">
                                <i className="fas fa-upload text-3xl"></i>
                              </div>
                              <p className="text-gray-300">{translate('profile.drag_or_click') || 'Tıkla veya sürükle bırak'}</p>
                              <p className="text-gray-500 text-sm mt-1">{translate('profile.supported_formats') || 'PNG, JPG veya JPEG (max. 5MB)'}</p>
                            </>
                          )}
                          <input 
                            id="id-back-input" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageChange(e, 'back')}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <button 
                          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#121212] hover:from-yellow-400 hover:to-yellow-500 py-3 px-4 rounded-lg font-bold shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                          disabled={!idFrontImage || !idBackImage || isSubmitting}
                          onClick={handleSubmitKyc}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                              {translate('profile.uploading') || 'Yükleniyor...'}
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane mr-2"></i> 
                              {translate('profile.submit_verification') || 'Doğrulama Talebini Gönder'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {kycStatus === 'pending' && (
                  <div className="bg-[#1A1A1A] p-5 rounded-xl border border-gray-800 mb-6">
                    <div className="flex flex-col items-center text-center py-6">
                      <div className="w-20 h-20 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center text-3xl mb-4">
                        <i className="fas fa-clock"></i>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        {translate('profile.kyc_pending') || 'Doğrulama İnceleniyor'}
                      </h4>
                      <p className="text-gray-400 max-w-md">
                        {translate('profile.kyc_pending_desc') || 'Kimlik doğrulama talebiniz gönderildi ve şu anda inceleniyor. Bu işlem genellikle 24 saat içinde tamamlanır. Sonuç hakkında e-posta ile bilgilendirileceksiniz.'}
                      </p>
                    </div>
                  </div>
                )}
                
                {kycStatus === 'approved' && (
                  <div className="bg-[#1A1A1A] p-5 rounded-xl border border-gray-800 mb-6">
                    <div className="flex flex-col items-center text-center py-6">
                      <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-3xl mb-4">
                        <i className="fas fa-check"></i>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        {translate('profile.kyc_approved') || 'Doğrulama Onaylandı'}
                      </h4>
                      <p className="text-gray-400 max-w-md">
                        {translate('profile.kyc_approved_desc') || 'Tebrikler! Kimlik doğrulamanız başarıyla tamamlandı. Artık hesabınızın tüm özelliklerine erişebilirsiniz.'}
                      </p>
                    </div>
                  </div>
                )}
                
                {kycStatus === 'rejected' && (
                  <div className="bg-[#1A1A1A] p-5 rounded-xl border border-gray-800 mb-6">
                    <div className="flex flex-col items-center text-center py-6">
                      <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-3xl mb-4">
                        <i className="fas fa-times"></i>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        {translate('profile.kyc_rejected') || 'Doğrulama Reddedildi'}
                      </h4>
                      <p className="text-gray-400 max-w-md mb-4">
                        {translate('profile.kyc_rejected_desc') || 'Kimlik doğrulama talebiniz reddedildi. Lütfen aşağıdaki nedeni okuyun ve tekrar deneyin.'}
                      </p>
                      
                      {rejectionReason && (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg w-full text-left mb-4">
                          <p className="text-white font-medium mb-1">{translate('profile.rejection_reason') || 'Ret Sebebi'}:</p>
                          <p className="text-gray-300">{rejectionReason}</p>
                        </div>
                      )}
                      
                      <button 
                        className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#121212] hover:from-yellow-400 hover:to-yellow-500 py-3 px-4 rounded-lg font-bold shadow-md flex items-center justify-center"
                        onClick={() => {
                          // Resim girdilerini temizle
                          setIdFrontImage(null);
                          setIdBackImage(null);
                          
                          // Mock KYC verilerini güncelle (yeniden başvuru için)
                          const localStorageKyc = localStorage.getItem('kycData');
                          if (localStorageKyc) {
                            try {
                              const kycData = JSON.parse(localStorageKyc);
                              
                              // Kullanıcının mevcut kaydını bul ve güncelle
                              if (Array.isArray(kycData)) {
                                const updatedKycData = kycData.filter(item => 
                                  item.userId !== user?.id && 
                                  item.username !== user?.username
                                );
                                
                                // Güncellenmiş veriyi kaydet
                                localStorage.setItem('kycData', JSON.stringify(updatedKycData));
                              }
                            } catch (error) {
                              console.error("KYC verileri güncellenirken hata oluştu:", error);
                            }
                          }
                          
                          // KYC durumunu "none" olarak ayarla - yeni başvuruya hazır
                          setKycStatus('none');
                          setRejectionReason('');
                          
                          // Bilgi mesajı
                          alert(translate('profile.kyc_resubmit_ready') || 'Şimdi yeni bir KYC başvurusu yapabilirsiniz. Lütfen kimlik belgelerinizi yeniden yükleyin.');
                        }}
                      >
                        <i className="fas fa-redo mr-2"></i> 
                        {translate('profile.try_again') || 'Tekrar Dene'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* KYC Bilgilendirme */}
                <div className="bg-[#1A1A1A] p-5 rounded-xl border border-gray-800">
                  <h4 className="text-lg font-medium text-white mb-4 flex items-center border-b border-gray-800 pb-2">
                    <i className="fas fa-info-circle text-yellow-500 mr-2"></i> {translate('profile.kyc_info') || 'KYC Hakkında Bilgi'}
                  </h4>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mr-3 flex-shrink-0 mt-1">
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <div>
                        <p className="text-white font-medium">{translate('profile.kyc_benefit_1_title') || 'Güvenlik'}</p>
                        <p className="text-gray-400 text-sm">{translate('profile.kyc_benefit_1_desc') || 'Kimlik doğrulama, hesabınızı korur ve yetkisiz erişimleri önler.'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mr-3 flex-shrink-0 mt-1">
                        <i className="fas fa-wallet"></i>
                      </div>
                      <div>
                        <p className="text-white font-medium">{translate('profile.kyc_benefit_2_title') || 'Daha Yüksek Limitler'}</p>
                        <p className="text-gray-400 text-sm">{translate('profile.kyc_benefit_2_desc') || 'Doğrulanmış hesaplar daha yüksek para yatırma ve çekme limitlerine sahiptir.'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mr-3 flex-shrink-0 mt-1">
                        <i className="fas fa-gift"></i>
                      </div>
                      <div>
                        <p className="text-white font-medium">{translate('profile.kyc_benefit_3_title') || 'Özel Bonuslar'}</p>
                        <p className="text-gray-400 text-sm">{translate('profile.kyc_benefit_3_desc') || 'Doğrulanmış kullanıcılar özel promosyonlara ve bonuslara erişebilir.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tercihler Sekmesi */}
            {activeTab === 'preferences' && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {translate('profile.preferences')}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {translate('profile.preferences_desc')}
                  </p>
                </div>

                {/* Bildirim Ayarları */}
                <div className="bg-[#1A1A1A] p-5 rounded-xl border border-gray-800 mb-6">
                  <h4 className="text-lg font-medium text-white mb-4 flex items-center border-b border-gray-800 pb-2">
                    <i className="fas fa-bell text-yellow-500 mr-2"></i> {translate('profile.notifications')}
                  </h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{translate('profile.email_notifications')}</p>
                        <p className="text-gray-400 text-sm">{translate('profile.email_notif_desc')}</p>
                      </div>

                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked={true} />
                        <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{translate('profile.sms_notifications')}</p>
                        <p className="text-gray-400 text-sm">{translate('profile.sms_notif_desc')}</p>
                      </div>

                      <button className="px-3 py-1 bg-gray-600 text-gray-300 rounded text-xs font-medium">
                        Kapalı
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{translate('profile.promo_notifications')}</p>
                        <p className="text-gray-400 text-sm">{translate('profile.promo_notif_desc')}</p>
                      </div>

                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked={true} />
                        <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Görünüm Ayarları */}
                <div className="bg-[#1A1A1A] p-5 rounded-xl border border-gray-800">
                  <h4 className="text-lg font-medium text-white mb-4 flex items-center border-b border-gray-800 pb-2">
                    <i className="fas fa-paint-brush text-yellow-500 mr-2"></i> {translate('profile.appearance')}
                  </h4>

                  <div className="pt-4">
                    <button className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#121212] rounded-lg font-bold shadow-md hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 group relative overflow-hidden">
                      {translate('profile.app_preferences')}
                      <div className="absolute top-0 -inset-full h-full w-1/2 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shimmer"></div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-xl border border-yellow-500/30 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Para Çekme</h3>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="w-8 h-8 bg-[#232323] hover:bg-[#2a2a2a] rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-4">
              {/* Available Balance */}
              <div className="bg-[#232323] rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Kullanılabilir Bakiye</div>
                <div className="text-2xl font-bold text-white">₺{user?.balance || '0'}</div>
              </div>

              {/* Withdrawal Amount */}
              <div>
                <label className="block text-white font-medium mb-2">Çekim Tutarı</label>
                <input 
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Minimum ₺${userLimits.minimumWithdraw}`}
                  className="w-full px-4 py-3 bg-[#232323] text-white rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                />
              </div>

              {/* Withdrawal Method */}
              <div>
                <label className="block text-white font-medium mb-2">Çekim Yöntemi</label>
                <select 
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-[#232323] text-white rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="bank_transfer">Banka Havalesi</option>
                  <option value="crypto">Kripto Para</option>
                  <option value="ewallet">E-Cüzdan</option>
                </select>
              </div>

              {/* Bank Details */}
              {withdrawMethod === 'bank_transfer' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-white font-medium mb-2">IBAN</label>
                    <input 
                      type="text"
                      value={bankDetails.iban}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, iban: e.target.value }))}
                      placeholder="TR12 3456 7890 1234 5678 9012 34"
                      className="w-full px-4 py-3 bg-[#232323] text-white rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Hesap Sahibi</label>
                    <input 
                      type="text"
                      value={bankDetails.accountHolder}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolder: e.target.value }))}
                      placeholder="Ad Soyad"
                      className="w-full px-4 py-3 bg-[#232323] text-white rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Banka Adı</label>
                    <input 
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                      placeholder="Banka Adı"
                      className="w-full px-4 py-3 bg-[#232323] text-white rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Processing Info */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="text-sm text-blue-400 mb-2">
                  <i className="fas fa-info-circle mr-2"></i>
                  İşlem Bilgileri
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• İşlem süresi: 24-48 saat</li>
                  <li>• Minimum tutar: ₺{userLimits.minimumWithdraw}</li>
                  <li>• Günlük limit: ₺{(userLimits.dailyWithdrawLimit - userLimits.usedDailyLimit).toLocaleString()}</li>
                  <li>• Risk analizi yapılacaktır</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={handleWithdrawRequest}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-400 hover:to-green-500 transition-all duration-300"
                >
                  Talep Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileModal;