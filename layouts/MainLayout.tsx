


import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Building2, Settings2, ShieldCheck, HelpCircle, Lightbulb, ChevronLeft, Home as HomeIcon, LogOut, UserCircle, Sparkles, ClipboardList, Megaphone, MessageSquare } from 'lucide-react'; 
import { APP_NAME } from '../constants';
import Button from '../components/ui/Button';
import TopNavbar from '../components/ui/TopNavbar';
import { useAuth } from '../contexts/AuthContext';
import LogoutConfirmModal from '../components/auth/LogoutConfirmModal';
import * as announcementService from '../services/announcementService'; // Import announcement service

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  badgeCount?: number; // New prop for badge
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isCollapsed, badgeCount }) => {
  const location = useLocation();
  
  let isActive = location.pathname === to;
  if (to !== '/' && to.length > 1 && location.pathname.startsWith(to)) {
    isActive = true;
  } else if (to === '/home' && (location.pathname === '/' || location.pathname === '/home')) {
    isActive = true; 
  }

  return (
    <Link
      to={to}
      title={isCollapsed ? label : undefined} 
      className={`relative flex items-center py-2.5 rounded-md transition-all duration-150 group
        ${isCollapsed ? 'justify-center px-2.5 h-10' : 'px-3.5'} 
        ${
          isActive
            ? 'bg-primary/10 text-primary dark:bg-sky-700 dark:text-sky-300 font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200'
        }`}
    >
      <span className={`transition-colors ${isCollapsed ? '' : 'mr-2.5'} ${isActive ? 'text-primary dark:text-sky-300' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>{icon}</span>
      {!isCollapsed && <span className={`text-sm ${isActive ? 'font-medium' : 'font-normal'} truncate`}>{label}</span>}
      {!isCollapsed && badgeCount && badgeCount > 0 && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
      {isCollapsed && badgeCount && badgeCount > 0 && (
         <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" title={`${badgeCount} não lido(s)`}></span>
      )}
    </Link>
  );
};

interface NavGroupProps {
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
    children: React.ReactNode;
    initialOpen?: boolean;
    basePath?: string; 
}

const NavGroup: React.FC<NavGroupProps> = ({ icon, label, isCollapsed, children, initialOpen = false, basePath }) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const location = useLocation();

    useEffect(() => {
        if (basePath && location.pathname.startsWith(basePath)) {
            setIsOpen(true);
        }
    }, [location.pathname, basePath]);

    if (isCollapsed) {
        return (
            <div title={label} className="flex items-center justify-center px-2.5 h-10 text-gray-500 dark:text-gray-400">
                {icon}
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-2.5 px-3.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
            >
                <div className="flex items-center">
                    <span className="mr-2.5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">{icon}</span>
                    <span className="truncate font-medium">{label}</span>
                </div>
                <ChevronLeft size={16} className={`transform transition-transform duration-200 ${isOpen ? '-rotate-90' : 'rotate-0'}`} />
            </button>
            {isOpen && (
                <div className="pl-5 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 ml-[18px]">
                    {children}
                </div>
            )}
        </div>
    );
};


const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const location = useLocation();
  const [unreadAnnouncementsCount, setUnreadAnnouncementsCount] = useState(0);

  useEffect(() => {
    const updateUnreadCount = () => {
      setUnreadAnnouncementsCount(announcementService.getUnreadAnnouncementsCount());
    };
    updateUnreadCount(); // Initial count
    window.addEventListener('announcementsUpdated', updateUnreadCount);
    return () => window.removeEventListener('announcementsUpdated', updateUnreadCount);
  }, []);


  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    try {
      const storedCollapsedState = localStorage.getItem('sidebarCollapsed');
      if (storedCollapsedState !== null) {
        setIsCollapsed(JSON.parse(storedCollapsedState));
      }
    } catch (error) {
      console.error("Failed to access localStorage for sidebar state:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    } catch (error) {
       console.error("Failed to access localStorage for sidebar state:", error);
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const handleLogout = () => {
    logout(); 
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <aside className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${isCollapsed ? 'w-[72px]' : 'w-64'} transition-all duration-300 ease-in-out shadow-sm overflow-x-hidden`}>
         <div className={`h-16 flex items-center border-b border-gray-200 dark:border-gray-700 shrink-0 ${isCollapsed ? 'justify-center px-2' : 'justify-center px-4'} transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <Link to="/home" className="flex items-center group" title={isCollapsed ? APP_NAME : undefined}>
            <img src="https://i.postimg.cc/MTL4TC0C/logo.png" alt={APP_NAME} className="h-10 object-contain" />
          </Link>
        </div>
        
        <nav className="flex-grow p-2.5 space-y-1.5 overflow-y-auto overflow-x-hidden">
          <NavLink to="/home" icon={<HomeIcon size={20} />} label="Home" isCollapsed={isCollapsed} />
          <NavLink 
            to="/announcements" 
            icon={<Megaphone size={20} />} 
            label="Comunicados" 
            isCollapsed={isCollapsed}
            badgeCount={unreadAnnouncementsCount > 0 ? unreadAnnouncementsCount : undefined} // Pass undefined if count is 0
          />
          <NavLink to="/calendar" icon={<CalendarDays size={20} />} label="Calendário" isCollapsed={isCollapsed} />
          <NavLink to="/event-management" icon={<Settings2 size={20} />} label="Gestão de Eventos" isCollapsed={isCollapsed} />
          <NavLink to="/policies" icon={<ShieldCheck size={20} />} label="Políticas" isCollapsed={isCollapsed} />
          <NavLink to="/faq" icon={<HelpCircle size={20} />} label="FAQ" isCollapsed={isCollapsed} />
          <NavLink to="/suggestions" icon={<Lightbulb size={20} />} label="Sugestões" isCollapsed={isCollapsed} />
          
          <NavGroup 
            icon={<Sparkles size={20} />} 
            label="Aceleradores IA" 
            isCollapsed={isCollapsed}
            basePath="/ai-accelerators"
            initialOpen={location.pathname.startsWith('/ai-accelerators')}
          >
            <NavLink to="/ai-accelerators/prompts" icon={<ClipboardList size={18} />} label="Prompts" isCollapsed={isCollapsed} />
            <NavLink to="/ai-accelerators/chat" icon={<MessageSquare size={18} />} label="Chat" isCollapsed={isCollapsed} />
          </NavGroup>
        </nav>
        
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700 shrink-0">
            <div className={`${isCollapsed ? 'py-1.5 px-1.5' : 'p-1.5'}`}>
                <Button
                    variant="ghost"
                    onClick={toggleSidebar}
                    className="w-full flex items-center justify-center h-10 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-sky-400 hover:bg-primary/5 dark:hover:bg-sky-400/10 focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-sky-400 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 transition-all duration-150 rounded-md"
                    aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
                    title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
                >
                    <ChevronLeft size={20} className={`transition-transform duration-300 ease-in-out ${isCollapsed ? 'rotate-180' : ''}`} />
                </Button>
            </div>
            {!isCollapsed && (
              <div className="pb-2 pt-1 px-3 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700/50">
                © {new Date().getFullYear()} Empresa Inc.
              </div>
            )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
            theme={theme} 
            toggleTheme={toggleTheme} 
            isSidebarCollapsed={isCollapsed}
            openLogoutModal={() => setIsLogoutModalOpen(true)} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-4">
           {children}
          </div>
        </main>
      </div>
      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default MainLayout;