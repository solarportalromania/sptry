
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserRole, Notification, User } from '../types';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';
import Button from './Button';
import Logo from './Logo';


interface HeaderProps {
  isLoggedIn: boolean;
  user: User | null;
  isImpersonating: boolean;
  onStopImpersonation: () => void;
  onViewHistory: () => void;
  onViewInstallerDirectory: () => void;
  onViewBlog: () => void;
  onLogout: () => void;
  onNavigate: (view: 'login' | 'landing') => void;
  notifications: Notification[];
  onMarkNotificationRead: (notificationId: string, link: string) => void;
  onBackToDashboard: () => void;
  onNavigateToLanding: () => void;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { 
    isLoggedIn, user, isImpersonating, onStopImpersonation, 
    onViewHistory, onViewInstallerDirectory, onViewBlog, onLogout, onNavigate,
    notifications, onMarkNotificationRead, onBackToDashboard, onNavigateToLanding
  } = props;
  
  const { t, language, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleLanguageToggle = () => {
    setLanguage(language === 'ro' ? 'en' : 'ro');
  };
  
  const handleViewClick = (viewHandler: () => void) => {
      viewHandler();
      setIsMobileMenuOpen(false);
  }
  
  const userRole = useMemo(() => {
    if (!user) return UserRole.NONE;
    if ('serviceCounties' in user) return UserRole.INSTALLER;
    if ('role' in user) return UserRole.ADMIN;
    return UserRole.CLIENT;
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationRef]);

  const NavButton: React.FC<{ label: string; icon?: React.ReactNode; onClick: () => void; active?: boolean }> = ({ label, icon, onClick, active }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 w-full text-left ${
        active
          ? 'bg-solar-green-600 text-white'
          : 'text-gray-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <header className="bg-gray-900 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={onNavigateToLanding}
          >
            <Logo className="h-10 w-auto" />
            <span className="text-2xl font-bold text-white tracking-tight">SolarPortal</span>
          </div>

          {isImpersonating && (
             <Button onClick={onStopImpersonation} size="sm" variant="danger" className="flex-shrink-0">
                {t('Return to Admin')}
             </Button>
          )}

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {isLoggedIn && <NavButton label={t('Dashboard')} onClick={onBackToDashboard} icon={<Icon name="chart-bar" className="w-5 h-5"/>}/>}
            <NavButton label={t('Installer Companies')} onClick={onViewInstallerDirectory} icon={<Icon name="tools" className="w-5 h-5"/>}/>
            <NavButton label={t('Blog')} onClick={onViewBlog} icon={<Icon name="blog" className="w-5 h-5"/>}/>
            <div className="w-px h-6 bg-slate-600 mx-2"></div>
            {isLoggedIn ? (
                <>
                    {userRole === UserRole.ADMIN && !isImpersonating && (
                        <NavButton label={t('History')} icon={<Icon name="history" className="w-5 h-5"/>} onClick={() => handleViewClick(onViewHistory)} />
                    )}
                    <div className="relative" ref={notificationRef}>
                        <button onClick={() => setNotificationMenuOpen(prev => !prev)} className="relative p-2 text-gray-300 hover:text-white rounded-full hover:bg-slate-700">
                            <Icon name="bell" className="w-6 h-6"/>
                            {notifications.length > 0 && <span className="absolute top-0 right-0 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                        </button>
                        {isNotificationMenuOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1">
                                <div className="px-4 py-2 font-bold text-white border-b border-slate-700">{t('Notifications')}</div>
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div key={n.id} onClick={() => { onMarkNotificationRead(n.id, n.link); setNotificationMenuOpen(false); }} className="px-4 py-3 text-sm text-gray-300 hover:bg-slate-700 cursor-pointer">
                                            {t(n.messageKey, n.messageParams)}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-400">{t('No new notifications')}</div>
                                )}
                            </div>
                        )}
                    </div>
                    <Button variant="secondary" onClick={onLogout}>{t('Logout')}</Button>
                </>
            ) : (
                <>
                    <Button variant="secondary" onClick={() => onNavigate('login')}>{t('Login')}</Button>
                </>
            )}

            <div className="w-px h-6 bg-slate-600 mx-2"></div>
            <button
              onClick={handleLanguageToggle}
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-200"
            >
              <span className={language === 'ro' ? 'text-solar-green-400' : ''}>RO</span>
              <span className="mx-1 text-gray-500">|</span>
              <span className={language === 'en' ? 'text-solar-green-400' : ''}>EN</span>
            </button>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white focus:outline-none">
                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {isLoggedIn && <NavButton label={t('Dashboard')} icon={<Icon name="chart-bar" className="w-5 h-5"/>} onClick={() => {handleViewClick(onBackToDashboard); setIsMobileMenuOpen(false);}} />}
                <NavButton label={t('Installer Companies')} icon={<Icon name="tools" className="w-5 h-5"/>} onClick={() => {handleViewClick(onViewInstallerDirectory); setIsMobileMenuOpen(false);}} />
                <NavButton label={t('Blog')} icon={<Icon name="blog" className="w-5 h-5"/>} onClick={() => {handleViewClick(onViewBlog); setIsMobileMenuOpen(false);}} />
                <div className="border-t border-slate-700 my-2"></div>
                 {isLoggedIn ? (
                    <>
                        {userRole === UserRole.ADMIN && !isImpersonating && (
                            <NavButton label={t('History')} icon={<Icon name="history" className="w-5 h-5"/>} onClick={() => {handleViewClick(onViewHistory); setIsMobileMenuOpen(false);}} />
                        )}
                         <NavButton label={t('Logout')} icon={<Icon name="arrow-right" className="w-5 h-5"/>} onClick={() => {onLogout(); setIsMobileMenuOpen(false);}} />
                    </>
                ) : (
                    <>
                         <NavButton label={t('Login')} icon={<Icon name="user" className="w-5 h-5"/>} onClick={() => {onNavigate('login'); setIsMobileMenuOpen(false);}} />
                    </>
                )}
            </div>
             <div className="border-t border-slate-700 py-3 px-4">
                <button
                  onClick={handleLanguageToggle}
                  className="text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-200 w-full text-center"
                >
                  <span className={language === 'ro' ? 'text-solar-green-400' : ''}>RO</span>
                  <span className="mx-1 text-gray-500">|</span>
                  <span className={language === 'en' ? 'text-solar-green-400' : ''}>EN</span>
                </button>
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;
