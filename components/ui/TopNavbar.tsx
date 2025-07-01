


import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { APP_NAME } from '../../constants';
import { Building2, UserCircle, LogOut } from 'lucide-react'; // Added UserCircle, LogOut
import { Link } from 'react-router-dom';
import DropdownMenu, { DropdownMenuItem } from './DropdownMenu'; // Added DropdownMenu
import Button from './Button'; // Added Button for trigger

interface TopNavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  openLogoutModal: () => void; // New prop to open logout modal
}

const TopNavbar: React.FC<TopNavbarProps> = ({ theme, toggleTheme, isSidebarCollapsed, openLogoutModal }) => {
  const userMenuItems: DropdownMenuItem[] = [
    {
      id: 'logout',
      label: 'Sair',
      icon: <LogOut size={16} />,
      onClick: openLogoutModal,
      isDanger: true,
    },
    // Add other user menu items here in the future (e.g., "Profile", "Settings")
  ];

  const userMenuTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label="Menu do usuário"
      title="Menu do usuário"
    >
      <UserCircle size={22} />
    </Button>
  );

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors duration-300">
      {/* Left side: App Logo/Name when sidebar is collapsed */}
      <div className={`flex items-center transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {isSidebarCollapsed && (
           <Link to="/home" className="flex items-center group">
            <img src="https://i.postimg.cc/MTL4TC0C/logo.png" alt={APP_NAME} className="h-9 object-contain" />
           </Link>
        )}
      </div>
      
      {/* Right side: Theme Switcher and User Menu */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
        <DropdownMenu 
          items={userMenuItems} 
          trigger={userMenuTrigger} 
          menuAlign="right" 
          ariaLabel="Opções do usuário" 
        />
      </div>
    </header>
  );
};

export default TopNavbar;