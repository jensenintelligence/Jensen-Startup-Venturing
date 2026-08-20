import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Layout from '@/components/Layout';
import AdminLayout from '@/components/AdminLayout';
import AdminRoute from '@/components/AdminRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import Papers from '@/pages/Papers';
import PaperDetail from '@/pages/PaperDetail';
import Portfolio from '@/pages/Portfolio';
import MarketPulse from '@/pages/MarketPulse';
import ChartLab from '@/pages/ChartLab';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPapers from '@/pages/admin/AdminPapers';
import AdminPaperEditor from '@/pages/admin/AdminPaperEditor';
import AdminNews from '@/pages/admin/AdminNews';
import AdminTrades from '@/pages/admin/AdminTrades';
import AdminCharts from '@/pages/admin/AdminCharts';
import AdminMarketPulse from '@/pages/admin/AdminMarketPulse';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Public */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/papers" element={<Papers />} />
        <Route path="/papers/:id" element={<PaperDetail />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/markets" element={<MarketPulse />} />
        <Route path="/charts" element={<ChartLab />} />
      </Route>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Admin workspace */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/papers" element={<AdminPapers />} />
          <Route path="/admin/papers/new" element={<AdminPaperEditor />} />
          <Route path="/admin/papers/:id/edit" element={<AdminPaperEditor />} />
          <Route path="/admin/news" element={<AdminNews />} />
          <Route path="/admin/trades" element={<AdminTrades />} />
          <Route path="/admin/charts" element={<AdminCharts />} />
          <Route path="/admin/markets" element={<AdminMarketPulse />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App