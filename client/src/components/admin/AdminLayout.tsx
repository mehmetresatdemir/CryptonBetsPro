import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAdminTranslation } from '@/utils/admin-translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LiveNotifications from './LiveNotifications';
import { NotificationCenter } from './NotificationCenter';
import logoPath from '@assets/logo.png';
import { 
  LayoutDashboard, 
  Users, 
  Gamepad, 
  Gift, 
  FileText, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  Menu, 
  LogOut,
  UserCheck,
  DollarSign,
  BanknoteIcon,
  CreditCard,
  Wallet,
  Palette,
  Globe,
  Cog,
  Plug,
  MessagesSquare,
  ImageIcon,
  UserCog,
  Shield,
  PieChart,
  HelpCircle,
  Mail,
  Zap,
  Bell,
  Newspaper
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const t = (key: string) => getAdminTranslation(key, language as 'tr' | 'en');
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [collapsed, setCollapsed] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // WebSocket bağlantı durumu simülasyonu
  useEffect(() => {
    setStatus('connecting');
    const timer = setTimeout(() => {
      setStatus('connected');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Logout fonksiyonu
  const handleLogout = async () => {
    try {
      // API logout çağrısı yap
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Local storage'ı temizle
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
        
        toast({
          title: "Çıkış yapıldı",
          description: "Güvenli bir şekilde çıkış yaptınız"
        });
        
        // Login sayfasına yönlendir
        setLocation('/admin/login');
      } else {
        throw new Error('Çıkış yapılamadı');
      }
    } catch (error) {
      console.error('Logout error:', error);
      
      // Hata olsa bile local storage'ı temizle
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
      
      toast({
        title: "Çıkış yapıldı",
        description: "Oturum temizlendi"
      });
      
      setLocation('/admin/login');
    }
  };

  const isActive = (path: string) => location === path;

  const sidebarItems = [
    {
      group: t('admin.dashboard'),
      items: [
        { 
          icon: LayoutDashboard, 
          label: t('admin.dashboard'), 
          path: '/admin', 
          active: location === '/admin' || location === '/admin/dashboard'
        },
        { 
          icon: BarChart3, 
          label: t('admin.analytics'), 
          path: '/admin/analytics'
        },
        { 
          icon: PieChart, 
          label: 'Gelişmiş Analytics', 
          path: '/admin/advanced-analytics'
        },
        { 
          icon: Zap, 
          label: 'Oyun Optimizasyonu', 
          path: '/admin/game-optimization'
        },
        { 
          icon: Bell, 
          label: 'Gerçek Zamanlı Bildirimler', 
          path: '/admin/real-time-notifications'
        },
        { 
          icon: FileText, 
          label: t('admin.sidebar_reports'), 
          path: '/admin/reports'
        }
      ]
    },
    {
      group: t('admin.user_management'),
      items: [
        { 
          icon: Users, 
          label: t('admin.users'), 
          path: '/admin/users'
        },
        { 
          icon: UserCheck, 
          label: t('admin.kyc_management'), 
          path: '/admin/kyc'
        },
        { 
          icon: UserCog, 
          label: t('admin.user_logs'), 
          path: '/admin/user-logs'
        },

      ]
    },
    {
      group: t('admin.financial_management'),
      items: [
        { 
          icon: DollarSign, 
          label: t('admin.transactions'), 
          path: '/admin/transactions'
        },
        { 
          icon: BanknoteIcon, 
          label: t('admin.deposits'), 
          path: '/admin/deposits'
        },
        { 
          icon: CreditCard, 
          label: t('admin.withdrawals'), 
          path: '/admin/withdrawals'
        },

      ]
    },
    {
      group: 'Güvenlik & Risk Yönetimi',
      items: [
        { 
          icon: Shield, 
          label: 'Gelişmiş Güvenlik Merkezi', 
          path: '/admin/advanced-security'
        }
      ]
    },
    {
      group: t('admin.content_management'),
      items: [
        { 
          icon: Gamepad, 
          label: t('admin.games'), 
          path: '/admin/games'
        },
        { 
          icon: Gift, 
          label: t('admin.bonuses'), 
          path: '/admin/bonuses'
        },

        { 
          icon: ImageIcon, 
          label: t('admin.banners'), 
          path: '/admin/banners'
        }
      ]
    },
    {
      group: t('admin.system_settings'),
      items: [
        { 
          icon: Settings, 
          label: t('admin.settings'), 
          path: '/admin/settings'
        },
        { 
          icon: Palette, 
          label: t('admin.content'), 
          path: '/admin/themes'
        },
        { 
          icon: Plug, 
          label: t('admin.integrations'), 
          path: '/admin/integrations'
        }
      ]
    },
    {
      group: t('admin.communication'),
      items: [
        { 
          icon: MessagesSquare, 
          label: t('admin.messages'), 
          path: '/admin/messages'
        },
        { 
          icon: Mail, 
          label: 'Email Şablonları', 
          path: '/admin/email-templates'
        },
        { 
          icon: HelpCircle, 
          label: t('admin.support'), 
          path: '/admin/support'
        }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`${
          collapsed ? 'w-20' : 'w-80'
        } bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col relative z-20`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!collapsed && (
                <div>
                  <h1 className="text-xl font-bold text-yellow-500">CryptonBets</h1>
                  <p className="text-sm text-gray-400">{t('admin.dashboard')}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {sidebarItems.map((group, groupIndex) => (
              <div key={groupIndex}>
                {!collapsed && (
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {group.group}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    const active = isActive(item.path) || item.active;
                    
                    return (
                      <Link key={itemIndex} href={item.path}>
                        <div className={`
                          flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer
                          ${active 
                            ? 'bg-yellow-500/20 text-yellow-400 border-r-2 border-yellow-500' 
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }
                          ${collapsed ? 'justify-center' : 'justify-start'}
                        `}>
                          <Icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
                          {!collapsed && (
                            <span className="font-medium">{item.label}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <UserCog className="h-5 w-5 text-gray-900" />
            </div>
            {!collapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-400">admin@example.com</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="mt-3 flex items-center text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış Yap
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-700">
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-white">CryptonBets Admin</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              
              <div className={`flex items-center ${status === 'connected' ? 'text-green-500' : status === 'connecting' ? 'text-yellow-500' : 'text-red-500'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${status === 'connected' ? 'bg-green-500' : status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className="text-xs hidden sm:inline">
                  {status === 'connected' ? 
                    (language === 'tr' ? 'Bağlı' : 'Connected') : 
                   status === 'connecting' ? 
                    (language === 'tr' ? 'Bağlanıyor' : 'Connecting') : 
                    (language === 'tr' ? 'Bağlantı Kesildi' : 'Disconnected')}
                </span>
              </div>
              
              <NotificationCenter />
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-950" data-language={language} key={`main-content-${language}`}>
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
export { AdminLayout };