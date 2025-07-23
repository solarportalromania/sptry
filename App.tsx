import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { UserRole, Project, Quote, ProjectStatus, Installer, Homeowner, Admin, UserStatus, HistoryLog, User, RoofType, BlogPost, Conversation, ChatMessage, Notification, FinancialRecord, FinancialRecordStatus, ProjectWithDetails, EquipmentBrand, PanelModel, InverterModel, BatteryModel, AdminTab, Review, BlogPostStatus } from './types';
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
import ForgotPasswordPage from './ForgotPasswordPage';
import VerifyEmailPage from './VerifyEmailPage';
import { useLanguage } from './components/LanguageContext';
import AdminProjectDetailsPage from './components/AdminProjectDetailsPage';
import AdminUserDetailsPage from './components/AdminUserDetailsPage';

const App: React.FC = () => {
  const { t } = useLanguage();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [homeowners, setHomeowners] = useState<Homeowner[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [roofTypes, setRoofTypes] = useState<RoofType[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [commissionRate, setCommissionRate] = useState(0.10);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [equipmentBrands, setEquipmentBrands] = useState<EquipmentBrand[]>([]);
  const [panelModels, setPanelModels] = useState<PanelModel[]>([]);
  const [inverterModels, setInverterModels] = useState<InverterModel[]>([]);
  const [batteryModels, setBatteryModels] = useState<BatteryModel[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewState, setViewState] = useState<any>({ view: 'landing' });
  const [impersonation, setImpersonation] = useState<any>(null);
  const [congratsModalInfo, setCongratsModalInfo] = useState<any>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [passwordResetState, setPasswordResetState] = useState<any>(null);
  const [verificationState, setVerificationState] = useState<any>(null);

  const API_URL = (window as any).process?.env?.REACT_APP_API_URL || '';

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
        const response = await fetch(`${API_URL}/api/initial-data`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();

        const projectsWithDetails: ProjectWithDetails[] = (data.projects || []).map((p: Project) => {
            const homeowner = (data.homeowners || []).find((h: Homeowner) => h.id === p.homeownerId);
            return homeowner ? { ...p, homeowner } : null;
        }).filter((p: ProjectWithDetails | null): p is ProjectWithDetails => p !== null);

        setProjects(projectsWithDetails);
        setInstallers(data.installers || []);
        setHomeowners(data.homeowners || []);
        setAdmins(data.admins || []);
        setReviews(data.reviews || []);
        setBlogPosts(data.blogPosts || []);
        setRoofTypes(data.roofTypes || []);
        setEquipmentBrands(data.equipmentBrands || []);
        setPanelModels(data.panelModels || []);
        setInverterModels(data.inverterModels || []);
        setBatteryModels(data.batteryModels || []);
        // These are not yet implemented on the backend, so we mock them
        setHistory(data.history || []);
        setConversations(data.conversations || []);
        setNotifications(data.notifications || []);
        setFinancialRecords(data.financialRecords || []);
        setCommissionRate(data.commissionRate || 0.10);
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
    } finally {
        setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchAllData();
    if (!localStorage.getItem('cookie_consent')) {
        setShowCookieBanner(true);
    }
  }, [fetchAllData]);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            console.error("Login failed with status:", response.status);
            return false;
        }

        const { user } = await response.json();
        if (user) {
            if (user.status === 'PENDING_VERIFICATION') {
                 setVerificationState({ email: user.email });
                 setViewState({ view: 'verifyEmail' });
                 return false; // Not fully logged in
            }
            setCurrentUser(user);
            setViewState({ view: 'dashboard' }); // This will now route correctly
            return true;
        }
        return false;
    } catch (error) {
        console.error("Login request failed:", error);
        return false;
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleRegisterHomeownerAndProject = async (homeownerData: Omit<Homeowner, 'id' | 'status' | 'createdAt'>, projectData: Omit<Project, 'id' | 'homeownerId' | 'quotes' | 'status' | 'createdAt' | 'reviewSubmitted'>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/register/homeowner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeownerData, projectData }),
      });
      if (response.ok) {
        setVerificationState({ email: homeownerData.email });
        setViewState({ view: 'verifyEmail' });
      } else {
        // Handle error display
        console.error("Registration failed");
      }
    } catch (error) {
      console.error("Registration request failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterInstaller = async (installerData: Omit<Installer, 'id' | 'status' | 'createdAt' | 'portfolio' | 'about' | 'logoDataUrl'>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/register/installer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ installerData }),
      });
      if (response.ok) {
        setVerificationState({ email: installerData.contact.email });
        setViewState({ view: 'verifyEmail' });
      } else {
        console.error("Installer registration failed");
      }
    } catch (error) {
      console.error("Installer registration request failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
   const handleVerifyEmail = async (code: string): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${API_URL}/api/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: verificationState.email, code }),
        });
        if (response.ok) {
          setCongratsModalInfo({
            title: t('Account verified!'),
            message: t('You can now log in with your credentials.'),
          });
          setVerificationState(null);
          setViewState({ view: 'login' });
          return true;
        }
        return false;
      } catch (error) {
        console.error("Verification failed:", error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
  };

  const handleForgotPasswordRequest = async (email: string): Promise<string | true> => {
      // This is now simulated on the frontend, but would call the backend
      console.log("TODO: API Call to request password reset for", email);
      const allUsers: User[] = [...homeowners, ...installers, ...admins];
      const foundUser = allUsers.find(u => ('email' in u ? u.email : (u as Installer).contact.email).toLowerCase() === email.toLowerCase());
      if (!foundUser) return t('User not found.');
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(`--- PASSWORD RESET SIM --- Code for ${email}: ${code}`);
      setPasswordResetState({ email, code });
      return true;
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setViewState({ view: 'landing' });
  };
  
  const handleCookieConsent = () => {
      localStorage.setItem('cookie_consent', 'true');
      setShowCookieBanner(false);
  };
  
  const userRole = useMemo(() => {
    if (!currentUser) return UserRole.NONE;
    if ('serviceCounties' in currentUser) return UserRole.INSTALLER;
    if ('permissions' in currentUser) return UserRole.ADMIN;
    return UserRole.CLIENT;
  }, [currentUser]);

  const renderContent = () => {
    if (!currentUser) {
        switch (viewState.view) {
            case 'login':
                return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setViewState({ view: 'register' })} onNavigateToForgotPassword={() => setViewState({ view: 'forgotPassword' })} />;
            case 'register':
                return <RegistrationPage onNavigate={(view) => setViewState({ view })} />;
            case 'register-homeowner-project':
                return <HomeownerProjectRegistrationPage onRegister={handleRegisterHomeownerAndProject} onNavigateToLogin={() => setViewState({ view: 'login' })} isSubmitting={isSubmitting} roofTypes={roofTypes} />;
            case 'register-installer':
                return <InstallerRegistrationPage onRegister={handleRegisterInstaller} onNavigateToLogin={() => setViewState({ view: 'login' })} />;
            case 'forgotPassword':
                return <ForgotPasswordPage onForgotPasswordRequest={handleForgotPasswordRequest} onVerifyResetCode={async (code) => passwordResetState?.code === code} onResetPassword={async (password) => { console.log("New password (simulated):", password); setCongratsModalInfo({ title: t('Password Reset'), message: t('Your password has been reset successfully. You can now log in.') }); setPasswordResetState(null); setViewState({ view: 'login' }); }} onNavigateToLogin={() => setViewState({ view: 'login' })} />;
            case 'verifyEmail':
                return <VerifyEmailPage onVerify={handleVerifyEmail} />;
            case 'terms':
                return <TermsPage onBack={() => setViewState({ view: 'landing' })} />;
            case 'privacyPolicy':
                return <PrivacyPolicyPage onBack={() => setViewState({ view: 'landing' })} />;
             case 'installerDirectory':
                return <InstallerDirectoryPage installers={installers} reviews={reviews} onViewProfile={(id) => setViewState({ view: 'installerProfile', installerId: id })} />;
            case 'blog':
                return <BlogPage posts={blogPosts} onViewPost={(id) => setViewState({ view: 'blogPost', postId: id })} isAdmin={false} onEditPost={() => {}} currentUserId={null} logAction={() => {}}/>;
            case 'blogPost':
                const post = blogPosts.find(p => p.id === viewState.postId);
                const author = admins.find(a => a.id === post?.authorId);
                return post ? <BlogPostPage post={post} author={author} onBack={() => setViewState({ view: 'blog' })} /> : <p>Post not found</p>;
            default:
                return <LandingPage onNavigateToRegister={() => setViewState({ view: 'register' })} />;
        }
    }

    // User is logged in
    switch (viewState.view) {
        case 'dashboard':
            if (userRole === UserRole.CLIENT) {
                return <ClientDashboard homeowner={currentUser as Homeowner} projects={projects.filter(p => p.homeownerId === currentUser.id)} installers={installers} onProjectSubmit={() => {}} isSubmitting={false} onViewQuote={(projId, quoteId) => setViewState({view: 'quoteDetails', projectId: projId, quoteId: quoteId })} onShareContact={()=>{}} onAcceptOffer={()=>{}} onEditHomeowner={()=>{}} onViewChat={()=>{}} roofTypes={roofTypes} onLeaveReview={()=>{}} />;
            }
            if (userRole === UserRole.INSTALLER) {
                return <InstallerDashboard installer={currentUser as Installer} projects={projects} onQuoteSubmit={()=>{}} onViewProfile={() => setViewState({ view: 'installerProfile', installerId: currentUser.id })} onViewQuote={(projId, quoteId) => setViewState({view: 'quoteDetails', projectId: projId, quoteId: quoteId })} onMarkAsSigned={()=>{}} onViewChat={()=>{}} equipmentBrands={equipmentBrands} panelModels={panelModels} inverterModels={inverterModels} batteryModels={batteryModels} />;
            }
            if (userRole === UserRole.ADMIN) {
                return <AdminDashboard currentUser={currentUser as Admin} projects={projects} homeowners={homeowners} installers={installers} admins={admins} roofTypes={roofTypes} blogPosts={blogPosts} financialRecords={financialRecords} commissionRate={commissionRate} equipmentBrands={equipmentBrands} panelModels={panelModels} inverterModels={inverterModels} batteryModels={batteryModels} onUpdateProjectStatus={() => {}} onApproveProject={() => {}} onEditProject={() => {}} onLoginAs={() => {}} onUpdateUserStatus={() => {}} onEditUser={() => {}} onAddAdmin={() => {}} onRoofTypeChange={() => {}} onBlogPostChange={() => {}} onToggleBlogPostStatus={() => {}} onViewChat={() => {}} onUpdateCommissionRate={() => {}} onUpdateFinancialRecord={() => {}} onEquipmentChange={() => {}} logAction={() => {}} onViewAdminProjectDetails={(id) => setViewState({ view: 'adminProjectDetails', projectId: id})} onViewAdminUserDetails={(id) => setViewState({view: 'adminUserDetails', userId: id})} />;
            }
            return <p>Loading dashboard...</p>;

        case 'quoteDetails':
            const project = projects.find(p => p.id === viewState.projectId);
            const quote = project?.quotes.find(q => q.id === viewState.quoteId);
            const installer = installers.find(i => i.id === quote?.installerId);
            if (!project || !quote || !installer) return <p>Quote not found.</p>;
            return <QuoteDetailsPage project={project} quote={quote} installer={installer} onBack={() => setViewState({view: 'dashboard'})} userRole={userRole} currentUserId={currentUser.id} onMarkAsSigned={()=>{}} onReviseQuote={()=>{}} onViewChat={()=>{}} onAcceptOffer={()=>{}} onViewInstallerProfile={(id) => setViewState({ view: 'installerProfile', installerId: id })} equipmentBrands={equipmentBrands} panelModels={panelModels} inverterModels={inverterModels} batteryModels={batteryModels} />;

        case 'installerProfile':
            const profileInstaller = installers.find(i => i.id === viewState.installerId);
            if (!profileInstaller) return <p>Installer not found.</p>;
            return <InstallerProfilePage installer={profileInstaller} reviews={reviews.filter(r => r.installerId === viewState.installerId)} onBack={() => setViewState({view: 'dashboard'})} onEditProfile={()=>{}} isOwner={currentUser.id === profileInstaller.id} viewerRole={userRole} />;
        
        default:
             // Fallback to dashboard if view is unknown for a logged-in user
             setViewState({ view: 'dashboard' });
             return null;
    }
  }
  
  return (
    <div className="bg-gray-800 text-gray-200 min-h-screen flex flex-col font-sans">
      <Header 
        isLoggedIn={!!currentUser} 
        user={currentUser} 
        isImpersonating={!!impersonation} 
        onStopImpersonation={() => {}} 
        onViewHistory={() => {}} 
        onViewInstallerDirectory={() => setViewState({view: 'installerDirectory'})} 
        onViewBlog={() => setViewState({view: 'blog'})} 
        onLogout={handleLogout} 
        onNavigate={(v) => setViewState({view: v})} 
        notifications={notifications} 
        onMarkNotificationRead={() => {}} 
        onBackToDashboard={() => setViewState({view: 'dashboard'})} 
        onNavigateToLanding={() => setViewState({view: 'landing'})}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading && <div className="fixed top-0 left-0 w-full h-1 bg-solar-green-500 animate-pulse z-50"></div>}
        {renderContent()}
      </main>
      {!!currentUser && <FloatingChatButton onChatWithAdmin={() => {}} />}
      {congratsModalInfo && <CongratsModal title={congratsModalInfo.title} message={congratsModalInfo.message} onClose={() => setCongratsModalInfo(null)} />}
      {showCookieBanner && <CookieConsentBanner onAccept={handleCookieConsent} />}
      <Footer onViewTerms={() => setViewState({ view: 'terms'})} onViewPrivacyPolicy={() => setViewState({view: 'privacyPolicy'})} />
    </div>
  );
};

export default App;