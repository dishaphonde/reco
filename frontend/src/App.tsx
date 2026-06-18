import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './layouts/MainLayout';
import Discover from './pages/Discover';
import Onboarding from './pages/Onboarding';
import Matches from './pages/Matches';
import DealRoom from './pages/DealRoom';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Messages from './pages/Messages';
import Landing from './pages/Landing';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './components/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <h2 className="text-2xl font-bold text-slate-400">{title} Page Coming Soon</h2>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  
  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/landing" replace />;

  // If not on profile setup and profile doesn't exist, redirect to profile setup
  const isProfileSetup = window.location.pathname === '/profile/setup';
  if (!profile && !isProfileSetup) {
    return <Navigate to="/profile/setup" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/landing" element={<Landing />} />

            <Route path="/profile/setup" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />

            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/discover" replace />} />
              <Route path="discover" element={<Discover />} />
              <Route path="matches" element={<Matches />} />
              <Route path="deal-room/:matchId" element={<DealRoom />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
          </Router>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
