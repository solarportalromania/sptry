
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { UserRole, Project, Quote, ProjectStatus, Installer, Homeowner, Admin, UserStatus, HistoryLog, User, RoofType, BlogPost, Conversation, ChatMessage, Notification, FinancialRecord, FinancialRecordStatus, ProjectWithDetails, EquipmentBrand, PanelModel, InverterModel, BatteryModel, AdminTab, Review } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import ClientDashboard from './components/ClientDashboard';
import InstallerDashboard from './components/InstallerDashboard';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import QuoteDetailsPage from './components/QuoteDetailsPage';
import InstallerProfilePage from './components/InstallerProfilePage';
import HistoryPage from './components/HistoryPage';
import ChatPage from './components/ChatPage';
import InstallerDirectoryPage from './components/InstallerDirectoryPage';
import BlogPage from './components/BlogPage';
import BlogPostPage from './components/BlogPostPage';
import FloatingChatButton from './components/FloatingChatButton';
import CongratsModal from './components/CongratsModal';
import CookieConsentBanner from './components/CookieConsentBanner';
import LoginPage from './LoginPage';
import RegistrationPage from './RegistrationPage';
import HomeownerProjectRegistrationPage from './HomeownerProjectRegistrationPage';
import InstallerRegistrationPage from './InstallerRegistrationPage';
import TermsPage from './components/TermsPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import { useLanguage } from './components/LanguageContext';
import { 
    mockProjects, mockInstallers, mockHomeowners, mockAdmins, mockHistory, 
    mockRoofTypes, mockBlogPosts, mockConversations, mockNotifications, 
    mockFinancialRecords, mockCommissionRate, mockEquipmentBrands, 
    mockPanelModels, mockInverterModels, mockBatteryModels, placeholderImage,
    mockReviews
} from './data/mock';
import AdminProjectDetailsPage from './components/AdminProjectDetailsPage';
import AdminUserDetailsPage from './components/AdminUserDetailsPage';

type View = 
  | 'landing'
  | 'login'
  | 'register'
  | 'register-homeowner-project'
  | 'register-installer'
  | 'dashboard'
  | 'quoteDetails'
  | 'installerProfile'
  | 'history'
  | 'chat'
  | 'installerDirectory'
  | 'blog'
  | 'blogPost'
  | 'terms'
  | 'privacyPolicy'
  | 'adminProjectDetails'
  | 'adminUserDetails';
  
type ViewState = 
  | { view: Extract<View, 'landing' | 'login' | 'register' | 'register-homeowner-project' | 'register-installer' | 'dashboard' | 'history' | 'installerDirectory' | 'blog' | 'terms' | 'privacyPolicy'>; subView?: { main: string; sub?: string; } }
  | { view: 'quoteDetails'; projectId: string; quoteId: string }
  | { view: 'installerProfile'; installerId: string }
  | { view: 'chat'; conversationId: string }
  | { view: 'blogPost'; postId: string }
  | { view: 'adminProjectDetails'; projectId: string }
  | { view: 'adminUserDetails'; userId: string };
  
type ImpersonationState = {
  originalUser: User;
} | null;


const App: React.FC = () => {
  const { t } = useLanguage();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [installers, setInstallers] = useState<Installer[]>(mockInstallers);
  const [homeowners, setHomeowners] = useState<Homeowner[]>(mockHomeowners);
  const [admins, setAdmins] = useState<Admin[]>(mockAdmins);
  const [history, setHistory] = useState<HistoryLog[]>(mockHistory);
  const [roofTypes, setRoofTypes] = useState<RoofType[]>(mockRoofTypes);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(mockFinancialRecords);
  const [commissionRate, setCommissionRate] = useState(mockCommissionRate);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  
  const [equipmentBrands, setEquipmentBrands] = useState<EquipmentBrand[]>(mockEquipmentBrands);
  const [panelModels, setPanelModels] = useState<PanelModel[]>(mockPanelModels);
  const [inverterModels, setInverterModels] = useState<InverterModel[]>(mockInverterModels);
  const [batteryModels, setBatteryModels] = useState<BatteryModel[]>(mockBatteryModels);

  const [isLoading, setIsLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>({ view: 'landing' });
  const [impersonation, setImpersonation] = useState<ImpersonationState>(null);
  const [congratsModalInfo, setCongratsModalInfo] = useState<{title: string, message: string} | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  
  const isLoggedIn = !!currentUser;
  const userRole = useMemo(() => {
    if (!currentUser) return UserRole.NONE;
    if ('serviceCounties' in currentUser) return UserRole.INSTALLER;
    if ('role' in currentUser) return UserRole.ADMIN;
    return UserRole.CLIENT;
  }, [currentUser]);

  const viewerRole = useMemo(() => {
    const u = impersonation ? impersonation.originalUser : currentUser;
    if (!u) return UserRole.NONE;
    if ('serviceCounties' in u) return UserRole.INSTALLER;
    if ('role' in u) return UserRole.ADMIN;
    return UserRole.CLIENT;
  }, [currentUser, impersonation]);

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) {
        setShowCookieBanner(true);
    }
  }, []);

  const handleCookieConsent = () => {
      localStorage.setItem('cookie_consent', 'true');
      setShowCookieBanner(false);
  };

  const logAction = useCallback((action: string, target: HistoryLog['target']) => {
    if (!currentUser && !impersonation) return;
    const actor = impersonation ? impersonation.originalUser : currentUser;
    if(!actor) return;
    
    let actorRole: UserRole;
    if ('serviceCounties' in actor) actorRole = UserRole.INSTALLER;
    else if ('role' in actor) actorRole = UserRole.ADMIN;
    else actorRole = UserRole.CLIENT;

    const logEntry: HistoryLog = {
      id: `hist-${Date.now()}`,
      timestamp: new Date(),
      actor: { id: actor.id, name: actor.name, role: actorRole },
      action,
      target,
    };
    setHistory(prev => [logEntry, ...prev]);
  }, [currentUser, impersonation]);

  const addNotification = useCallback((userId: string, messageKey: string, messageParams: Record<string, string | number> = {}, link: string) => {
    const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        userId,
        messageKey,
        messageParams,
        link,
        isRead: false,
        createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const handleLogin = (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    return new Promise(resolve => {
        setTimeout(() => {
            const allUsers: User[] = [...homeowners, ...installers, ...admins];
            const foundUser = allUsers.find(u => {
              if (!u) return false;
              let userEmail;
              if ('contact' in u && u.contact && typeof u.contact === 'object' && typeof u.contact.email === 'string') {
                  userEmail = u.contact.email;
              } else if ('email' in u && typeof u.email === 'string') {
                  userEmail = u.email;
              }
              if (!userEmail) return false;
              return userEmail.toLowerCase() === email.toLowerCase() && u.password === password;
            });
            
            if (foundUser) {
                setCurrentUser(foundUser);
                handleBackToDashboard();
            }

            setIsLoading(false);
            resolve(!!foundUser);
        }, 500);
    });
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setViewState({ view: 'landing' });
  };
  
  const handleRegisterInstaller = (data: Omit<Installer, 'id' | 'status' | 'createdAt' | 'portfolio' | 'about' | 'logoDataUrl' >): Promise<void> => {
    setIsLoading(true);
    return new Promise(resolve => {
        setTimeout(() => {
            const newUser: Installer = {
                ...data,
                id: `inst${Date.now()}`,
                status: UserStatus.ACTIVE,
                createdAt: new Date(),
                portfolio: [],
                about: t('A professional company providing solar installation services.'),
                logoDataUrl: placeholderImage
            };
            setInstallers(prev => [...prev, newUser]);
            setCurrentUser(newUser);
            logAction('Installer Registered', { type: 'user', id: newUser.id, name: newUser.name });
            handleBackToDashboard();
            setIsLoading(false);
            resolve();
        }, 500);
    });
  };

  const handleRegisterHomeownerAndProject = useCallback((
    homeownerData: Omit<Homeowner, 'id' | 'status' | 'createdAt'>,
    projectData: Omit<Project, 'id' | 'homeownerId' | 'quotes' | 'status' | 'createdAt' | 'reviewSubmitted'>
  ) => {
    setIsLoading(true);
    
    // Create new homeowner
    const newHomeowner: Homeowner = {
        ...homeownerData,
        id: `ho${Date.now()}`,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
    };
    setHomeowners(prev => [...prev, newHomeowner]);
    logAction('Homeowner Registered', { type: 'user', id: newHomeowner.id, name: newHomeowner.name });

    // Create new project
    const newProject: Project = { 
      ...projectData, 
      homeownerId: newHomeowner.id,
      id: `p${Date.now()}`, 
      quotes: [], 
      status: ProjectStatus.PENDING_APPROVAL,
      createdAt: new Date(),
      reviewSubmitted: false,
    };
    setProjects(prev => [newProject, ...prev]);
    logAction('Project Created', { type: 'project', id: newProject.id, name: `${newProject.address.street}, ${newProject.address.city}` });
    admins.forEach(admin => addNotification(admin.id, 'adminNewProject', { homeownerName: newHomeowner.name }, `/admin/projects/pending`));

    // Login and navigate
    setCurrentUser(newHomeowner);
    handleBackToDashboard();
    setIsLoading(false);
  }, [admins, logAction, addNotification]);

  const handleProjectSubmit = useCallback((
    projectData: Omit<Project, 'id' | 'quotes' | 'status' | 'createdAt' | 'reviewSubmitted'>,
  ) => {
    setIsLoading(true);
    const newProject: Project = { 
      ...projectData, 
      id: `p${Date.now()}`, 
      quotes: [], 
      status: ProjectStatus.PENDING_APPROVAL,
      createdAt: new Date(),
      reviewSubmitted: false,
    };
    setProjects(prev => [newProject, ...prev]);
    const homeowner = homeowners.find(h => h.id === projectData.homeownerId);
    logAction('Project Created', { type: 'project', id: newProject.id, name: `${newProject.address.street}, ${newProject.address.city}` });
    admins.forEach(admin => addNotification(admin.id, 'adminNewProject', { homeownerName: homeowner?.name || 'N/A' }, `/admin/projects/pending`));

    setIsLoading(false);
  }, [homeowners, admins, logAction, addNotification]);

  const handleQuoteSubmit = useCallback((projectId: string, quoteData: Omit<Quote, 'id'>, existingQuoteId?: string) => {
    setProjects(prevProjects => prevProjects.map(p => {
        if (p.id === projectId) {
            const installer = installers.find(i => i.id === quoteData.installerId);
            if (!installer) return p;

            let updatedQuotes;
            let quoteIdForLink = '';
            if (existingQuoteId) {
                updatedQuotes = p.quotes.map(q => q.id === existingQuoteId ? { ...q, ...quoteData, id: q.id } : q);
                quoteIdForLink = existingQuoteId;
                logAction('Quote Revised', { type: 'project', id: projectId, name: `${p.address.street}, ${p.address.city}` });
                addNotification(p.homeownerId, 'homeownerQuoteRevised', { installerName: installer.name }, `/quote/${projectId}/${quoteIdForLink}`);
            } else {
                const newQuote = { ...quoteData, id: `q${Date.now()}` };
                updatedQuotes = [...p.quotes, newQuote];
                quoteIdForLink = newQuote.id;
                logAction('Quote Submitted', { type: 'project', id: projectId, name: `${p.address.street}, ${p.address.city}` });
                addNotification(p.homeownerId, 'homeownerNewQuote', { installerName: installer.name }, `/quote/${projectId}/${quoteIdForLink}`);
            }
            return { ...p, quotes: updatedQuotes };
        }
        return p;
    }));
  }, [installers, logAction, addNotification]);

  const handleUpdateProjectStatus = useCallback((projectId: string, status: ProjectStatus) => {
    setProjects(prevProjects => prevProjects.map(p => {
        if (p.id === projectId) {
            logAction(`Project status changed to ${ProjectStatus[status]}`, { type: 'project', id: projectId, name: `${p.address.street}, ${p.address.city}` });
            return { ...p, status };
        }
        return p;
    }));
  }, [logAction]);
  
  const handleApproveProject = useCallback((projectId: string, photoDataUrl?: string) => {
     setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            logAction(`Project status changed to APPROVED`, { type: 'project', id: projectId, name: `${p.address.street}, ${p.address.city}` });
            installers.forEach(inst => {
                if (inst.serviceCounties.includes(p.address.county)) {
                    addNotification(inst.id, 'installerNewLead', { city: p.address.city }, `/installer/newLeads`);
                }
            });
            return { ...p, status: ProjectStatus.APPROVED, photoDataUrl: photoDataUrl || p.photoDataUrl };
        }
        return p;
    }));
  }, [logAction, addNotification, installers]);

  const handleEditProject = useCallback((updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    logAction('Project Edited', { type: 'project', id: updatedProject.id, name: `${updatedProject.address.street}, ${updatedProject.address.city}` });
  }, [logAction]);
  
  const handleUpdateUserStatus = useCallback((userId: string, userType: 'homeowner' | 'installer' | 'admin', status: UserStatus) => {
    const updateUser = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        setter(prev => prev.map(u => {
            if (u.id === userId) {
                logAction(`User status changed to ${UserStatus[status]}`, { type: 'user', id: u.id, name: u.name });
                return { ...u, status };
            }
            return u;
        }));
    };
    if (userType === 'homeowner') updateUser(setHomeowners as any);
    if (userType === 'installer') updateUser(setInstallers as any);
    if (userType === 'admin') updateUser(setAdmins as any);
  }, [logAction]);
  
  const handleEditUser = useCallback((user: User) => {
    let collectionSetter: React.Dispatch<React.SetStateAction<any[]>> | null = null;
    if ('serviceCounties' in user) collectionSetter = setInstallers;
    else if ('role' in user) collectionSetter = setAdmins;
    else collectionSetter = setHomeowners;
    
    if (collectionSetter) {
        collectionSetter(prev => prev.map(u => u.id === user.id ? user : u));
        logAction('User Edited', { type: 'user', id: user.id, name: user.name });
    }
  }, [logAction]);

  const handleMarkAsSigned = useCallback((projectId: string, finalPrice: number, winningInstallerId: string) => {
    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            const winningInstaller = installers.find(i => i.id === winningInstallerId);
            const homeowner = homeowners.find(h => h.id === p.homeownerId);
            
            logAction(`Project marked as SIGNED for ${finalPrice} with ${winningInstaller?.name}`, { type: 'project', id: projectId, name: `${p.address.street}, ${p.address.city}` });
            
            const commissionAmount = finalPrice * commissionRate;
            const newRecord: FinancialRecord = {
                id: `fin-${Date.now()}`, projectId, projectCity: p.address.city, installerId: winningInstallerId,
                finalPrice, commissionRate, commissionAmount, status: FinancialRecordStatus.PENDING, signedDate: new Date(),
            };
            setFinancialRecords(prev => [newRecord, ...prev]);

            admins.forEach(admin => addNotification(admin.id, 'adminDealSigned', { finalPrice: finalPrice, installerName: winningInstaller?.name || 'N/A' }, `/admin/finance/pending`));
            if(winningInstaller) addNotification(winningInstaller.id, 'installerDealWon', { homeownerName: homeowner?.name || 'N/A' }, `/installer/signedDeals`);
            if(winningInstaller && homeowner) addNotification(winningInstaller.id, 'installerContactShared', { homeownerName: homeowner.name }, `/installer/sharedContacts`);

            return { 
                ...p, 
                status: ProjectStatus.SIGNED, 
                finalPrice,
                signedDate: new Date(),
                winningInstallerId: winningInstallerId,
                sharedWithInstallerIds: [...new Set([...(p.sharedWithInstallerIds || []), winningInstallerId])]
            };
        }
        return p;
    }));
  }, [logAction, addNotification, installers, homeowners, admins, commissionRate]);

  const handleAcceptOffer = useCallback((projectId: string, quoteId: string) => {
    const project = projects.find(p => p.id === projectId);
    const quote = project?.quotes.find(q => q.id === quoteId);
    if (!quote || !project) return;
    const installer = installers.find(i => i.id === quote.installerId);
    if (!installer) return;

    handleMarkAsSigned(projectId, quote.price, quote.installerId);
    setCongratsModalInfo({
        title: t('congratsTitle'),
        message: t('congratsMessage', { installerName: installer.name })
    });
  }, [projects, installers, t, handleMarkAsSigned]);

  const handleShareContact = useCallback((projectId: string, installerId: string) => {
    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            const installer = installers.find(i => i.id === installerId);
            if(!installer) return p;
            const homeowner = homeowners.find(h => h.id === p.homeownerId);

            logAction(`Contact shared with ${installer.name}`, { type: 'project', id: projectId, name: `${p.address.street}, ${p.address.city}` });
            if(homeowner) addNotification(installerId, 'installerContactShared', { homeownerName: homeowner.name }, `/installer/sharedContacts`);

            return {
                ...p,
                status: ProjectStatus.CONTACT_SHARED,
                sharedWithInstallerIds: [...new Set([...(p.sharedWithInstallerIds || []), installerId])]
            };
        }
        return p;
    }));
  }, [logAction, addNotification, installers, homeowners]);
  
  const handleLeaveReview = useCallback((projectId: string, installerId: string, rating: number, comment: string) => {
    const project = projects.find(p => p.id === projectId);
    const homeowner = homeowners.find(h => h.id === project?.homeownerId);
    if (!project || !homeowner) return;

    const newReview: Review = {
        id: `rev-${Date.now()}`,
        projectId,
        installerId,
        homeownerId: homeowner.id,
        homeownerName: homeowner.name,
        rating,
        comment,
        createdAt: new Date(),
    };

    setReviews(prev => [...prev, newReview]);
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, reviewSubmitted: true } : p));

    logAction('Review Submitted', { type: 'project', id: projectId, name: `Review for ${project.address.city}` });
    addNotification(installerId, 'installerNewReview', { homeownerName: homeowner.name }, `/installerProfile/${installerId}`);
  }, [projects, homeowners, logAction, addNotification]);

  const handleAddAdmin = useCallback((adminData: {name: string, email: string, role: string, password: string, permissions: Admin['permissions']}) => {
    const newAdmin: Admin = {
        id: `admin-${Date.now()}`,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        ...adminData
    };
    setAdmins(prev => [...prev, newAdmin]);
    logAction(`Admin Created: ${newAdmin.name}`, { type: 'user', id: newAdmin.id, name: newAdmin.name });
  }, [logAction]);

  const handleRoofTypeChange = useCallback((updatedRoofTypes: RoofType[]) => {
    setRoofTypes(updatedRoofTypes);
    logAction('Roof types updated', { type: 'setting', id: 'roofTypes', name: 'Roof Types' });
  }, [logAction]);

  const handleBlogPostChange = useCallback((updatedBlogPosts: BlogPost[]) => {
    setBlogPosts(updatedBlogPosts);
  }, []);
  
  const handleEquipmentChange = (type: 'brands' | 'panelModels' | 'inverterModels' | 'batteryModels', data: any[]) => {
    const setterMap = {
        brands: setEquipmentBrands,
        panelModels: setPanelModels,
        inverterModels: setInverterModels,
        batteryModels: setBatteryModels,
    };
    setterMap[type](data as any);
  };
  
  const handleSendMessage = useCallback((conversationId: string, text: string) => {
    if(!currentUser) return;
    const newMessage: ChatMessage = { id: `msg-${Date.now()}`, senderId: currentUser.id, text, timestamp: new Date() };
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, messages: [...c.messages, newMessage] } : c));
  }, [currentUser]);
  
  const ensureConversationExists = (participants: string[], conversationId: string) => {
    const existingConversation = conversations.find(c => c.id === conversationId);
    if (!existingConversation) {
        const allAdminIds = admins.map(a => a.id);
        const newConversation: Conversation = { id: conversationId, participants: [...new Set([...participants, ...allAdminIds])], messages: [] };
        setConversations(prev => [...prev, newConversation]);
    }
    return conversationId;
  }
  
  const handleUpdateCommissionRate = (rate: number) => { 
      setCommissionRate(rate);
      logAction(`Commission rate updated to ${rate * 100}%`, { type: 'setting', id: 'commission', name: 'Commission Rate' });
  }
  const handleUpdateFinancialRecord = (updatedRecord: FinancialRecord) => { 
      setFinancialRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
      logAction(`Financial record updated for project ${updatedRecord.projectId}`, { type: 'finance', id: updatedRecord.id, name: `Project ${updatedRecord.projectId}` });
  }

  const handleMarkNotificationRead = (notificationId: string, link: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    
    const parts = link.split('/').filter(Boolean);
    if (link.startsWith('/quote/')) setViewState({ view: 'quoteDetails', projectId: parts[1], quoteId: parts[2] });
    else if (link.startsWith('/chat/')) setViewState({ view: 'chat', conversationId: parts[1] });
    else if (link.startsWith('/installerProfile/')) setViewState({ view: 'installerProfile', installerId: parts[1] });
    else if (link.startsWith('/admin/')) setViewState({ view: 'dashboard', subView: { main: parts[1], sub: parts[2] } });
    else if (link.startsWith('/installer/')) setViewState({ view: 'dashboard', subView: { main: parts[1] } });
    else handleBackToDashboard();
  }

  const handleLoginAs = useCallback((role: UserRole, userId: string) => {
    const allUsers: User[] = [...homeowners, ...installers, ...admins];
    const targetUser = allUsers.find(u => u.id === userId);
    if(targetUser && currentUser) {
        setImpersonation({ originalUser: currentUser });
        setCurrentUser(targetUser);
        handleBackToDashboard();
    }
  }, [currentUser, homeowners, installers, admins]);

  const handleStopImpersonation = useCallback(() => {
    if (impersonation) {
      setCurrentUser(impersonation.originalUser);
      setImpersonation(null);
      handleBackToDashboard();
    }
  }, [impersonation]);

  const handleViewQuoteDetails = (projectId: string, quoteId: string) => setViewState({ view: 'quoteDetails', projectId, quoteId });
  const handleViewInstallerProfile = (installerId: string) => setViewState({ view: 'installerProfile', installerId });
  const handleViewHistory = () => setViewState({ view: 'history' });
  const handleViewInstallerDirectory = () => setViewState({ view: 'installerDirectory' });
  const handleViewBlog = () => setViewState({ view: 'blog' });
  const handleViewBlogPost = (postId: string) => setViewState({ view: 'blogPost', postId });
  const handleViewTerms = () => setViewState({ view: 'terms' });
  const handleViewPrivacyPolicy = () => setViewState({ view: 'privacyPolicy' });
  const handleNavigate = (view: View) => setViewState({ view: view as any });
  const handleViewAdminProjectDetails = (projectId: string) => setViewState({ view: 'adminProjectDetails', projectId });
  const handleViewAdminUserDetails = (userId: string) => setViewState({ view: 'adminUserDetails', userId });

  const handleViewChat = (projectId: string, homeownerId: string, installerId: string) => {
      const conversationId = ensureConversationExists([homeownerId, installerId], projectId);
      setViewState({ view: 'chat', conversationId });
  };
  const handleChatWithAdmin = () => {
      if(!currentUser) return;
      const conversationId = `support-${currentUser.id}`;
      ensureConversationExists([currentUser.id], conversationId);
      setViewState({ view: 'chat', conversationId });
  }
  const handleBackToDashboard = () => setViewState({ view: 'dashboard' });

  const handleBackFromInfoPage = () => {
    if(isLoggedIn) {
      handleBackToDashboard();
    } else {
      handleNavigate('landing');
    }
  }
  
  const projectsWithDetails: ProjectWithDetails[] = useMemo(() => {
    return projects.map(p => {
        const homeowner = homeowners.find(h => h.id === p.homeownerId);
        return homeowner ? { ...p, homeowner } : null;
    }).filter((p): p is ProjectWithDetails => p !== null);
  }, [projects, homeowners]);
  
  const allUsers = useMemo(() => [...homeowners, ...installers, ...admins], [homeowners, installers, admins]);
  
  const userNotifications = useMemo(() => {
    return notifications.filter(n => n.userId === currentUser?.id && !n.isRead);
  }, [notifications, currentUser]);

  const selectedData = useMemo(() => {
    switch(viewState.view) {
        case 'quoteDetails': {
            const project = projectsWithDetails.find(p => p.id === viewState.projectId);
            const quote = project?.quotes.find(q => q.id === viewState.quoteId);
            const installer = installers.find(i => i.id === quote?.installerId);
            return { project, quote, installer };
        }
        case 'installerProfile': {
            const installer = installers.find(i => i.id === viewState.installerId);
            const installerReviews = reviews.filter(r => r.installerId === viewState.installerId);
            return { installer, reviews: installerReviews };
        }
        case 'blogPost': {
            const post = blogPosts.find(p => p.id === viewState.postId);
            const author = post ? allUsers.find(u => u.id === post.authorId) : undefined;
            return { post, author };
        }
        case 'chat': {
            let conversation = conversations.find(c => c.id === viewState.conversationId);
            const project = projectsWithDetails.find(p => p.id === viewState.conversationId);
            return { conversation, project };
        }
        case 'adminProjectDetails': {
            const project = projectsWithDetails.find(p => p.id === viewState.projectId);
            const projectConversations = conversations.filter(c => c.id === viewState.projectId || c.id === `support-${project?.homeownerId}`);
            const projectInstallers = installers.filter(i => project?.quotes.some(q => q.installerId === i.id));
            return { project, projectConversations, projectInstallers };
        }
        case 'adminUserDetails': {
            const user = allUsers.find(u => u.id === viewState.userId);
            let userProjects: ProjectWithDetails[] = [];
            if(user) {
                if ('serviceCounties' in user) { // Installer
                    userProjects = projectsWithDetails.filter(p => p.quotes.some(q => q.installerId === user.id));
                } else if ('role' in user) { // Admin
                    // No projects for admins
                }
                else { // Homeowner
                    userProjects = projectsWithDetails.filter(p => p.homeownerId === user.id);
                }
            }
            const userConversations = user ? conversations.filter(c => c.participants.includes(user.id)) : [];
            return { user, userProjects, userConversations };
        }
        default: return {};
    }
  }, [viewState, projectsWithDetails, installers, blogPosts, allUsers, conversations, reviews]);

  const renderContent = () => {
    if (viewState.view === 'terms') {
      return <TermsPage onBack={handleBackFromInfoPage} />;
    }
     if (viewState.view === 'privacyPolicy') {
      return <PrivacyPolicyPage onBack={handleBackFromInfoPage} />;
    }
    if (viewState.view === 'installerDirectory') {
      return <InstallerDirectoryPage installers={installers.filter(i => i.status === UserStatus.ACTIVE)} reviews={reviews} onViewProfile={handleViewInstallerProfile}/>;
    }
    if (viewState.view === 'blog') {
      return <BlogPage posts={blogPosts} onViewPost={handleViewBlogPost} isAdmin={isLoggedIn && userRole === UserRole.ADMIN && !impersonation} onEditPost={handleBlogPostChange} currentUserId={currentUser?.id || null} logAction={logAction}/>;
    }
    if (viewState.view === 'blogPost' && selectedData.post) {
      return <BlogPostPage post={selectedData.post} author={selectedData.author} onBack={handleViewBlog} />;
    }
    if (viewState.view === 'installerProfile' && selectedData.installer) {
        return <InstallerProfilePage 
                    installer={selectedData.installer} 
                    reviews={selectedData.reviews || []}
                    onBack={isLoggedIn ? handleBackToDashboard : handleViewInstallerDirectory} 
                    onEditProfile={(u) => handleEditUser(u as Installer)} 
                    isOwner={isLoggedIn && !!currentUser && currentUser.id === selectedData.installer.id && userRole === UserRole.INSTALLER}
                    viewerRole={viewerRole}
                />;
    }
    if (!isLoggedIn) {
      switch(viewState.view) {
          case 'login': return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => handleNavigate('register')} />;
          case 'register': return <RegistrationPage onNavigate={handleNavigate} />;
          case 'register-homeowner-project': return <HomeownerProjectRegistrationPage onRegister={handleRegisterHomeownerAndProject} onNavigateToLogin={() => handleNavigate('login')} isSubmitting={isLoading} roofTypes={roofTypes} />;
          case 'register-installer': return <InstallerRegistrationPage onRegister={handleRegisterInstaller} onNavigateToLogin={() => handleNavigate('login')} />;
          default: return <LandingPage onNavigateToRegister={() => handleNavigate('register')} />;
      }
    }
    switch(viewState.view) {
        case 'dashboard':
            switch (userRole) {
              case UserRole.CLIENT:
                return <ClientDashboard projects={projectsWithDetails.filter(p => p.homeownerId === currentUser!.id && p.status !== ProjectStatus.DELETED)} installers={installers} onProjectSubmit={handleProjectSubmit} isSubmitting={isLoading} onViewQuote={handleViewQuoteDetails} homeowner={currentUser as Homeowner} onShareContact={handleShareContact} onAcceptOffer={handleAcceptOffer} onEditHomeowner={(u) => handleEditUser(u as Homeowner)} onViewChat={handleViewChat} roofTypes={roofTypes} onLeaveReview={handleLeaveReview} />;
              case UserRole.INSTALLER:
                return <InstallerDashboard projects={projectsWithDetails} onQuoteSubmit={handleQuoteSubmit} installer={currentUser as Installer} onViewProfile={() => handleViewInstallerProfile(currentUser!.id)} onViewQuote={handleViewQuoteDetails} onMarkAsSigned={handleMarkAsSigned} onViewChat={handleViewChat} initialTab={viewState.view === 'dashboard' ? viewState.subView?.main : undefined} equipmentBrands={equipmentBrands} panelModels={panelModels} inverterModels={inverterModels} batteryModels={batteryModels}/>;
              case UserRole.ADMIN:
                return <AdminDashboard projects={projectsWithDetails} homeowners={homeowners} installers={installers} admins={admins} roofTypes={roofTypes} blogPosts={blogPosts} financialRecords={financialRecords} commissionRate={commissionRate} equipmentBrands={equipmentBrands} panelModels={panelModels} inverterModels={inverterModels} batteryModels={batteryModels} onUpdateProjectStatus={handleUpdateProjectStatus} onApproveProject={handleApproveProject} onEditProject={(p) => handleEditProject(p as Project)} onLoginAs={handleLoginAs} onUpdateUserStatus={handleUpdateUserStatus} onEditUser={handleEditUser} onAddAdmin={handleAddAdmin} onRoofTypeChange={handleRoofTypeChange} onBlogPostChange={handleBlogPostChange} onViewChat={handleViewChat} onUpdateCommissionRate={handleUpdateCommissionRate} onUpdateFinancialRecord={handleUpdateFinancialRecord} onEquipmentChange={handleEquipmentChange} logAction={logAction} currentUser={currentUser as Admin} initialView={viewState.view === 'dashboard' ? viewState.subView : undefined} onViewAdminProjectDetails={handleViewAdminProjectDetails} onViewAdminUserDetails={handleViewAdminUserDetails}/>;
              default: return <LandingPage onNavigateToRegister={() => handleNavigate('register')} />;
            }
        case 'quoteDetails':
            if (selectedData.project && selectedData.quote && selectedData.installer) {
              return <QuoteDetailsPage project={selectedData.project} quote={selectedData.quote} installer={selectedData.installer} onBack={handleBackToDashboard} onMarkAsSigned={handleMarkAsSigned} userRole={userRole} currentUserId={currentUser!.id} onReviseQuote={(quoteData) => handleQuoteSubmit(selectedData.project!.id, { ...quoteData, installerId: selectedData.quote!.installerId }, selectedData.quote!.id)} onViewChat={() => handleViewChat(selectedData.project!.id, selectedData.project!.homeownerId, selectedData.installer!.id)} onAcceptOffer={handleAcceptOffer} onViewInstallerProfile={handleViewInstallerProfile} equipmentBrands={equipmentBrands} panelModels={panelModels} inverterModels={inverterModels} batteryModels={batteryModels}/>;
            }
            break;
        case 'history':
            return <HistoryPage history={history} onBack={handleBackToDashboard} projects={projectsWithDetails} users={allUsers}/>;
        case 'chat':
            if (selectedData.conversation && currentUser) {
                const projectForChat = selectedData.project || { id: 'support', address: { city: t('SupportChatTitle'), street: '', county: ''}, homeowner: currentUser as Homeowner } as ProjectWithDetails;
                return <ChatPage conversation={selectedData.conversation} project={projectForChat} currentUser={currentUser} allUsers={allUsers} onSendMessage={(text) => handleSendMessage(selectedData.conversation!.id, text)} onBack={handleBackToDashboard} isAdmin={userRole === UserRole.ADMIN && !impersonation && !viewState.conversationId.startsWith('support-')}/>
            }
            break;
        case 'adminProjectDetails':
            if (selectedData.project) {
                return <AdminProjectDetailsPage project={selectedData.project} installers={selectedData.projectInstallers || []} conversations={selectedData.projectConversations || []} allUsers={allUsers} onBack={handleBackToDashboard} onViewChat={(conversationId) => setViewState({ view: 'chat', conversationId })} />
            }
            break;
        case 'adminUserDetails':
             if (selectedData.user) {
                return <AdminUserDetailsPage user={selectedData.user} projects={selectedData.userProjects || []} conversations={selectedData.userConversations || []} allUsers={allUsers} onBack={handleBackToDashboard} onViewChat={(conversationId) => setViewState({ view: 'chat', conversationId })} onViewProjectDetails={handleViewAdminProjectDetails} />
            }
            break;
        default: return <LandingPage onNavigateToRegister={() => handleNavigate('register')} />;
    }
    return <LandingPage onNavigateToRegister={() => handleNavigate('register')} />;
  };

  return (
    <div className="bg-gray-800 text-gray-200 min-h-screen flex flex-col font-sans">
      <Header isLoggedIn={isLoggedIn} user={currentUser} isImpersonating={!!impersonation} onStopImpersonation={handleStopImpersonation} onViewHistory={handleViewHistory} onViewInstallerDirectory={handleViewInstallerDirectory} onViewBlog={handleViewBlog} onLogout={handleLogout} onNavigate={handleNavigate} notifications={userNotifications} onMarkNotificationRead={handleMarkNotificationRead} onBackToDashboard={handleBackToDashboard} onNavigateToLanding={() => handleNavigate('landing')}/>
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading && <div className="fixed top-0 left-0 w-full h-1 bg-solar-green-500 animate-pulse z-50"></div>}
        {renderContent()}
      </main>
      {isLoggedIn && <FloatingChatButton onChatWithAdmin={handleChatWithAdmin} />}
      {congratsModalInfo && <CongratsModal title={congratsModalInfo.title} message={congratsModalInfo.message} onClose={() => setCongratsModalInfo(null)} />}
      {showCookieBanner && <CookieConsentBanner onAccept={handleCookieConsent} />}
      <Footer onViewTerms={handleViewTerms} onViewPrivacyPolicy={handleViewPrivacyPolicy} />
    </div>
  );
};

export default App;