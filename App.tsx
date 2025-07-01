
import React from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import CalendarPage from './pages/CalendarPage';
import EventManagementPage from './pages/EventManagementPage';
import PoliciesPage from './pages/PoliciesPage';
import FAQPage from './pages/FAQPage';
import SuggestionsPage from './pages/SuggestionsPage';
import AIPromptsPage from './pages/AIPromptsPage';
import AIChatPage from './pages/AIChatPage'; // Nova página de Chat IA
import AnnouncementsPage from './pages/AnnouncementsPage'; // Nova página de Comunicados
import LoginPage from './pages/LoginPage'; 
import DashboardHomePage from './pages/DashboardHomePage'; 
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext'; 

// Componente para proteger rotas
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Carregando...</p></div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider> 
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayoutWithAuth />}> 
                <Route path="/home" element={<DashboardHomePage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/event-management" element={<EventManagementPage />} />
                <Route path="/policies" element={<PoliciesPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/suggestions" element={<SuggestionsPage />} />
                <Route path="/ai-accelerators/prompts" element={<AIPromptsPage />} />
                <Route path="/ai-accelerators/chat" element={<AIChatPage />} />
                
                <Route path="/" element={<Navigate to="/home" replace />} /> 
              </Route>
            </Route>
            
            <Route path="*" element={<RootRedirect />} />

          </Routes>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

const MainLayoutWithAuth: React.FC = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

const RootRedirect: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><p>Carregando...</p></div>;
    }
    return <Navigate to={isAuthenticated ? "/home" : "/login"} replace />;
}


export default App;