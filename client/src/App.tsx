import { Switch, Route, Redirect, useLocation } from "wouter";
import { useLanguage } from "./contexts/LanguageContext";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { LanguageProvider, getCurrentLanguage } from "./contexts/LanguageContext";
import { UserProvider } from "./contexts/UserContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import NotFound from "./pages/not-found";
import Home from "./pages/Home";
import VipPage from "./pages/Vip";
import BonusesPage from "./pages/Bonuses";
import ProfilePage from "./pages/Profile";
// Yeni gelişmiş oyun sayfaları
import SlotsPage from "./pages/SlotsPage";
import SlotPage from "./pages/SlotPage";
import OptimizedSlotsPage from "./pages/slots/OptimizedSlotsPage";
import CasinoPageNew from "./pages/CasinoPageNew";
import AllGames from "./pages/AllGames";
import GamesPageNew from "./pages/GamesPageNew";
import SlotOyunlari from "./pages/SlotOyunlari";


import DepositWorking from "./pages/DepositWorking";
import WithdrawalWorking from "./pages/WithdrawalWorking";
import Withdrawal from "./pages/Withdrawal";
import Payments from "./pages/Payments";
import PaymentReturn from "./pages/PaymentReturn";



// Admin sayfaları için Lazy Loading
import { lazy, Suspense } from "react";

// Mevcut Admin Sayfaları
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminGames = lazy(() => import("./pages/admin/Games"));
const AdminBonuses = lazy(() => import("./pages/admin/Bonuses"));
const AdminNews = lazy(() => import("./pages/admin/News"));

const BannerManagement = lazy(() => import("./pages/admin/BannerManagement"));
const AdminTransactions = lazy(() => import("./pages/admin/Transactions"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminThemes = lazy(() => import("./pages/admin/Themes"));
const AdminIntegrations = lazy(() => import("./pages/admin/Integrations"));
const AdminEmailTemplates = lazy(() => import("./pages/admin/EmailTemplates"));
const AdminSupport = lazy(() => import("./pages/admin/Support"));
const OptimizedGames = lazy(() => import("./pages/admin/OptimizedGames"));
const OptimizedUsers = lazy(() => import("./pages/admin/OptimizedUsers.fixed"));
const AdminStats = lazy(() => import("./pages/admin/Stats"));
const AdminStatsFixed = lazy(() => import("./pages/admin/StatsFixed"));
const AdvancedAnalytics = lazy(() => import("./pages/admin/AdvancedAnalytics"));
const GameOptimization = lazy(() => import("./pages/admin/GameOptimization"));
const RealTimeNotifications = lazy(() => import("./pages/admin/RealTimeNotifications"));


// Yeni Eklenen Sayfalar
const AdminStaff = lazy(() => import("./pages/admin/Staff"));
const AdminKYC = lazy(() => import("./pages/admin/KYC"));
const AdminUserManagement = lazy(() => import("./pages/admin/UserManagement"));
const AdminFinance = lazy(() => import("./pages/admin/Finance"));
const KYCManagement = lazy(() => import("./pages/admin/KYCManagement"));
const TransactionManagement = lazy(() => import("./pages/admin/TransactionManagement"));
const AdminDeposits = lazy(() => import("./pages/admin/Deposits"));
const AdminWithdrawals = lazy(() => import("./pages/admin/Withdrawals"));
const AdminGamesCategories = lazy(() => import("./pages/admin/GamesCategories"));
const AdminNotifications = lazy(() => import("./pages/admin/Notifications"));

const AdvancedSecurity = lazy(() => import("./pages/admin/AdvancedSecurityFixed"));
const AdminFinancialReports = lazy(() => import("./pages/admin/FinancialReports"));
const AdminSlotegratorAPI = lazy(() => import("./pages/admin/SlotegratorAPI"));
const AdminGameProviders = lazy(() => import("./pages/admin/GameProviders"));
const AdminVIPProgram = lazy(() => import("./pages/admin/VIPProgram"));
const AdminPromotions = lazy(() => import("./pages/admin/Promotions"));
// Son eklenen sayfalar
const AdminGameReports = lazy(() => import("./pages/admin/GameReports"));
const AdminContentManagement = lazy(() => import("./pages/admin/ContentManagement"));
const AdminBannerManagement = lazy(() => import("./pages/admin/BannerManagement"));
const AdminMessageCenter = lazy(() => import("./pages/admin/MessageCenter"));
const AdminCMS = lazy(() => import("./pages/admin/CMS"));
const AdminAdmins = lazy(() => import("./pages/admin/Admins"));
const AdminLogs = lazy(() => import("./pages/admin/Logs"));
const AdminSecurity = lazy(() => import("./pages/admin/Security"));

const GamesModern = lazy(() => import("./pages/admin/GamesModern"));

// Admin yetki kontrolü için Higher Order Component
function AdminRoute({ component: Component, ...rest }: any) {
  const [location, setLocation] = useLocation();
  
  const isAdmin = () => {
    // Admin kontrolü - token ve isAdmin değişkeni kontrolü
    const token = localStorage.getItem('token');
    const isAdminUser = localStorage.getItem('isAdmin') === 'true';
    return !!token && isAdminUser;
  };

  if (!isAdmin() && location !== "/admin/login") {
    // Yetkisiz erişimde admin login sayfasına yönlendir
    return <Redirect to="/admin/login" />;
  }

  // Admin bileşenini render et
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-900 text-white">Yükleniyor...</div>}>
      <Component {...rest} />
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      {/* Ana Sayfa */}
      <Route path="/" component={Home} />
      
      {/* Site Rotaları */}
      <Route path="/home" component={Home} />
      <Route path="/slot" component={SlotPage} />
      <Route path="/slots" component={SlotPage} />
      <Route path="/casino" component={CasinoPageNew} />
      <Route path="/oyunlar" component={GamesPageNew} />
      <Route path="/vip" component={VipPage} />
      <Route path="/bonuslar" component={BonusesPage} exact />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/all-games" component={AllGames} />
      <Route path="/slot-oyunlari" component={SlotOyunlari} />
      
      <Route path="/deposit" component={DepositWorking} />
      <Route path="/withdrawal" component={WithdrawalWorking} />
      <Route path="/withdrawal-old" component={Withdrawal} />
      <Route path="/payments" component={Payments} />
      <Route path="/payment/return" component={PaymentReturn} />
      
      {/* Admin Panel Rotaları */}
      <Route path="/admin">
        <Redirect to="/admin/dashboard" />
      </Route>
      <Route path="/admin/login">
        <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-900 text-white">Yükleniyor...</div>}>
          <AdminLogin />
        </Suspense>
      </Route>
      
      {/* Mevcut Admin Sayfaları */}
      <Route path="/admin/dashboard">
        <AdminRoute component={AdminDashboard} />
      </Route>
      <Route path="/admin/users">
        <AdminRoute component={AdminUsers} />
      </Route>
      <Route path="/admin/games">
        <AdminRoute component={AdminGames} />
      </Route>
      <Route path="/admin/bonuses">
        <AdminRoute component={AdminBonuses} />
      </Route>

      <Route path="/admin/banners">
        <AdminRoute component={BannerManagement} />
      </Route>
      <Route path="/admin/transactions">
        <AdminRoute component={AdminTransactions} />
      </Route>
      <Route path="/admin/settings">
        <AdminRoute component={AdminSettings} />
      </Route>
      <Route path="/admin/themes">
        <AdminRoute component={AdminThemes} />
      </Route>
      <Route path="/admin/integrations">
        <AdminRoute component={AdminIntegrations} />
      </Route>
      <Route path="/admin/email-templates">
        <AdminRoute component={AdminEmailTemplates} />
      </Route>
      <Route path="/admin/support">
        <AdminRoute component={AdminSupport} />
      </Route>
      <Route path="/admin/stats">
        <AdminRoute component={AdminStatsFixed} />
      </Route>
      <Route path="/admin/advanced-analytics">
        <AdminRoute component={AdvancedAnalytics} />
      </Route>
      <Route path="/admin/game-optimization">
        <AdminRoute component={GameOptimization} />
      </Route>
      <Route path="/admin/real-time-notifications">
        <AdminRoute component={RealTimeNotifications} />
      </Route>
      <Route path="/admin/optimized-users">
        <AdminRoute component={OptimizedUsers} />
      </Route>
      <Route path="/admin/optimized-games">
        <AdminRoute component={OptimizedGames} />
      </Route>
      
      {/* Yeni Eklenen Sayfalar */}
      <Route path="/admin/staff">
        <AdminRoute component={AdminStaff} />
      </Route>
      <Route path="/admin/kyc">
        <AdminRoute component={AdminKYC} />
      </Route>
      <Route path="/admin/user-management">
        <AdminRoute component={AdminUserManagement} />
      </Route>
      <Route path="/admin/kyc-management">
        <AdminRoute component={KYCManagement} />
      </Route>
      <Route path="/admin/transaction-management">
        <AdminRoute component={TransactionManagement} />
      </Route>
      <Route path="/admin/finance">
        <AdminRoute component={AdminFinance} />
      </Route>
      <Route path="/admin/deposits">
        <AdminRoute component={AdminDeposits} />
      </Route>
      <Route path="/admin/withdrawals">
        <AdminRoute component={AdminWithdrawals} />
      </Route>
      <Route path="/admin/games-categories">
        <AdminRoute component={AdminGamesCategories} />
      </Route>
      <Route path="/admin/notifications">
        <AdminRoute component={AdminNotifications} />
      </Route>

      <Route path="/admin/advanced-security">
        <AdminRoute component={AdvancedSecurity} />
      </Route>
      <Route path="/admin/games-modern">
        <AdminRoute component={GamesModern} />
      </Route>
      <Route path="/admin/reports/financial">
        <AdminRoute component={AdminFinancialReports} />
      </Route>
      <Route path="/admin/slotegrator">
        <AdminRoute component={AdminSlotegratorAPI} />
      </Route>
      <Route path="/admin/game-providers">
        <AdminRoute component={AdminGameProviders} />
      </Route>
      <Route path="/admin/vip">
        <AdminRoute component={AdminVIPProgram} />
      </Route>
      <Route path="/admin/promotions">
        <AdminRoute component={AdminPromotions} />
      </Route>

      {/* Yeni eklenen sayfalar için rotalar */}
      <Route path="/admin/reports/games">
        <AdminRoute component={AdminGameReports} />
      </Route>
      <Route path="/admin/content">
        <AdminRoute component={AdminContentManagement} />
      </Route>
      <Route path="/admin/banners">
        <AdminRoute component={AdminBannerManagement} />
      </Route>
      <Route path="/admin/messages">
        <AdminRoute component={AdminMessageCenter} />
      </Route>
      <Route path="/admin/cms">
        <AdminRoute component={AdminCMS} />
      </Route>
      <Route path="/admin/admins">
        <AdminRoute component={AdminAdmins} />
      </Route>
      <Route path="/admin/analytics">
        <AdminRoute component={lazy(() => import("./pages/admin/Analytics"))} />
      </Route>
      <Route path="/admin/reports">
        <AdminRoute component={lazy(() => import("./pages/admin/ReportsProfessional"))} />
      </Route>
      <Route path="/admin/logs">
        <AdminRoute component={AdminLogs} />
      </Route>
      <Route path="/admin/user-logs">
        <AdminRoute component={lazy(() => import("./pages/admin/UserLogs"))} />
      </Route>
      <Route path="/admin/security">
        <AdminRoute component={AdminSecurity} />
      </Route>
      <Route path="/admin/advanced-security">
        <AdminRoute component={AdvancedSecurity} />
      </Route>

      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <UserProvider>
          <WebSocketProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </WebSocketProvider>
        </UserProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
