
import React, { useState, useMemo, useEffect } from 'react';
import { ProjectStatus, Homeowner, Installer, Admin, UserRole, User, UserStatus, RoofType, BlogPost, FinancialRecord, FinancialRecordStatus, ProjectWithDetails, EquipmentBrand, PanelModel, InverterModel, BatteryModel, HistoryLog, BlogPostStatus, AdminTab } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';
import ProjectEditModal from './ProjectEditModal';
import UserEditModal from './UserEditModal';
import AddAdminModal from './AddAdminModal';
import BlogEditModal from './BlogEditModal';
import ReportsTab from './ReportsTab';
import EquipmentSettingsTab from './EquipmentSettingsTab';
import { ProjectApprovalModal } from './ProjectApprovalModal';
import ConfirmationModal from './ConfirmationModal';
import PasswordInput from './PasswordInput';
import PasswordStrengthIndicator, { isPasswordStrong } from './PasswordStrengthIndicator';

type ProjectAdminTab = 'all' | 'pending' | 'approved' | 'sharedContact' | 'onHold' | 'signed' | 'deleted';
type UserAdminTab = 'all' | 'homeowners' | 'installers' | 'admins';
type FinanceAdminTab = 'pending' | 'paid';

interface AdminDashboardProps {
    projects: ProjectWithDetails[];
    homeowners: Homeowner[];
    installers: Installer[];
    admins: Admin[];
    roofTypes: RoofType[];
    blogPosts: BlogPost[];
    financialRecords: FinancialRecord[];
    commissionRate: number;
    equipmentBrands: EquipmentBrand[];
    panelModels: PanelModel[];
    inverterModels: InverterModel[];
    batteryModels: BatteryModel[];
    onUpdateProjectStatus: (projectId: string, status: ProjectStatus) => void;
    onApproveProject: (projectId: string, photoDataUrl?: string) => void;
    onEditProject: (project: ProjectWithDetails) => void;
    onLoginAs: (role: UserRole, userId: string) => void;
    onUpdateUserStatus: (userId: string, userType: 'homeowner' | 'installer' | 'admin', status: UserStatus) => void;
    onEditUser: (user: User) => void;
    onAddAdmin: (adminData: { name: string; email: string; role: string, password: string, permissions: Admin['permissions'] }) => void;
    onRoofTypeChange: (roofTypes: RoofType[]) => void;
    onBlogPostChange: (blogPosts: BlogPost[]) => void;
    onToggleBlogPostStatus: (postId: string) => void;
    onViewChat: (projectId: string, homeownerId: string, installerId: string) => void;
    onUpdateCommissionRate: (rate: number) => void;
    onUpdateFinancialRecord: (record: FinancialRecord) => void;
    onEquipmentChange: (type: 'brands' | 'panelModels' | 'inverterModels' | 'batteryModels', data: any[]) => void;
    logAction: (action: string, target: HistoryLog['target']) => void;
    currentUser: Admin;
    initialView?: { main: string; sub?: string; };
    onViewAdminProjectDetails: (projectId: string) => void;
    onViewAdminUserDetails: (userId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { 
        projects, homeowners, installers, admins, roofTypes, blogPosts, financialRecords, commissionRate,
        equipmentBrands, panelModels, inverterModels, batteryModels,
        onUpdateProjectStatus, onApproveProject, onEditProject, onLoginAs, onUpdateUserStatus, 
        onEditUser, onAddAdmin, onRoofTypeChange, onBlogPostChange, onToggleBlogPostStatus, onViewChat,
        onUpdateCommissionRate, onUpdateFinancialRecord, onEquipmentChange,
        logAction, currentUser, initialView,
        onViewAdminProjectDetails, onViewAdminUserDetails
    } = props;
    
    const { t, language } = useLanguage();
    
    const adminPermissions = useMemo(() => {
        return currentUser.permissions || { canLoginAs: false, visibleTabs: [] };
    }, [currentUser]);

    const [activeTab, setActiveTab] = useState<AdminTab>(initialView?.main as AdminTab || 'projects');
    const [activeProjectTab, setProjectTab] = useState<ProjectAdminTab>(initialView?.sub as ProjectAdminTab || 'pending');
    const [activeUserTab, setUserTab] = useState<UserAdminTab>(initialView?.sub as UserAdminTab || 'all');
    const [activeFinanceTab, setFinanceTab] = useState<FinanceAdminTab>(initialView?.sub as FinanceAdminTab || 'pending');
    const [showEquipmentSettings, setShowEquipmentSettings] = useState(false);
    
    useEffect(() => {
        if (initialView) {
            setActiveTab(initialView.main as AdminTab);
            switch(initialView.main) {
                case 'projects': setProjectTab(initialView.sub as ProjectAdminTab || 'all'); break;
                case 'users': setUserTab(initialView.sub as UserAdminTab || 'all'); break;
                case 'finance': setFinanceTab(initialView.sub as FinanceAdminTab || 'pending'); break;
            }
        }
    }, [initialView]);

    const [projectSearch, setProjectSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');

    const [editingProject, setEditingProject] = useState<ProjectWithDetails | null>(null);
    const [approvingProject, setApprovingProject] = useState<ProjectWithDetails | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingPost, setEditingPost] = useState<BlogPost | 'new' | null>(null);
    const [newRoofTypeName, setNewRoofTypeName] = useState('');
    
    const [isAddAdminModalOpen, setAddAdminModalOpen] = useState(false);
    const [tempCommissionRate, setTempCommissionRate] = useState(commissionRate * 100);
    const [editingCommissionRecord, setEditingCommissionRecord] = useState<FinancialRecord | null>(null);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);
    
    const AdminProfileTab = () => {
        const [formData, setFormData] = useState({
            name: currentUser.name,
            email: currentUser.email,
        });
        const [passwordData, setPasswordData] = useState({
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        });
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setError('');
            setSuccess('');
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };
        
        const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setError('');
            setSuccess('');
            const { name, value } = e.target;
            setPasswordData(prev => ({...prev, [name]: value}));
        }

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            setError('');
            setSuccess('');

            let finalPassword = currentUser.password;
            
            if (passwordData.newPassword || passwordData.currentPassword) {
                if (passwordData.currentPassword !== currentUser.password) {
                    setError(t('Current password is incorrect.'));
                    return;
                }
                if (passwordData.newPassword !== passwordData.confirmNewPassword) {
                    setError(t("New passwords don't match."));
                    return;
                }
                if (!isPasswordStrong(passwordData.newPassword)) {
                    setError(t('pw_requirements_not_met'));
                    return;
                }
                finalPassword = passwordData.newPassword;
            }

            const updatedAdmin: Admin = {
                ...currentUser,
                name: formData.name,
                email: formData.email,
                password: finalPassword,
            };
            
            onEditUser(updatedAdmin);
            setSuccess(t('Password updated successfully!'));
            // Clear password fields after successful update
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        }
        
        return (
            <Card>
                <h3 className="text-xl font-bold text-white mb-1">{t('My Profile')}</h3>
                <p className="text-gray-400 mb-6">{t('Update your personal information and password.')}</p>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    {error && <p className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md">{error}</p>}
                    {success && <p className="bg-green-500/20 text-green-300 text-sm p-3 rounded-md">{success}</p>}

                    <fieldset className="space-y-4">
                        <legend className="text-lg font-medium text-white">{t('Personal Details')}</legend>
                        <div>
                            <label htmlFor="admin-name" className="block text-sm font-medium text-gray-300 mb-1">{t('Full Name')}</label>
                            <input type="text" name="name" id="admin-name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                        </div>
                        <div>
                            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-300 mb-1">{t('Email')}</label>
                            <input type="email" name="email" id="admin-email" value={formData.email} onChange={handleChange} required className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                        </div>
                    </fieldset>
                    
                    <fieldset className="space-y-4 pt-4 border-t border-slate-700">
                        <legend className="text-lg font-medium text-white">{t('Change Password')}</legend>
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">{t('Current Password')}</label>
                            <PasswordInput name="currentPassword" id="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">{t('New Password')}</label>
                                <PasswordInput name="newPassword" id="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} />
                            </div>
                            <div>
                                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300 mb-1">{t('Confirm New Password')}</label>
                                <PasswordInput name="confirmNewPassword" id="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} />
                            </div>
                        </div>
                        {passwordData.newPassword && <PasswordStrengthIndicator password={passwordData.newPassword} />}
                    </fieldset>

                    <div className="flex justify-end">
                        <Button type="submit">{t('Save Changes')}</Button>
                    </div>
                </form>
            </Card>
        );
    }
    
    const handleConfirmApproval = (projectId: string, photoDataUrl?: string) => {
        setApprovingProject(null); // Close the approval modal
        setConfirmation({
            title: t('Approve Project'),
            message: t('confirmActionMessage'),
            onConfirm: () => {
                setConfirmation(null); // IMPORTANT: Close confirmation before action
                onApproveProject(projectId, photoDataUrl);
            }
        });
    };
    
    const getStatusChip = (status: ProjectStatus | UserStatus, type: 'project' | 'user') => {
        let text = '';
        let className = '';

        if(type === 'project') {
             switch(status as ProjectStatus) {
                case ProjectStatus.PENDING_APPROVAL: text = t('PENDING_APPROVAL'); className = 'bg-yellow-500/20 text-yellow-300'; break;
                case ProjectStatus.APPROVED: text = t('APPROVED'); className = 'bg-green-500/20 text-green-300'; break;
                case ProjectStatus.CONTACT_SHARED: text = t('CONTACT_SHARED'); className = 'bg-solar-green-500/20 text-solar-green-300'; break;
                case ProjectStatus.ON_HOLD: text = t('ON_HOLD'); className = 'bg-blue-500/20 text-blue-300'; break;
                case ProjectStatus.SIGNED: text = t('SIGNED'); className = 'bg-teal-500/20 text-teal-300'; break;
                case ProjectStatus.DELETED: text = t('DELETED'); className = 'bg-red-500/20 text-red-300'; break;
                default: text = t('Unknown'); className = 'bg-gray-500/20 text-gray-300'; break;
            }
        } else {
             switch(status as UserStatus) {
                case UserStatus.ACTIVE: text = t('ACTIVE'); className = 'bg-green-500/20 text-green-300'; break;
                case UserStatus.ON_HOLD: text = t('ON_HOLD'); className = 'bg-blue-500/20 text-blue-300'; break;
                case UserStatus.DELETED: text = t('DELETED'); className = 'bg-red-500/20 text-red-300'; break;
                default: text = t('Unknown'); className = 'bg-gray-500/20 text-gray-300'; break;
            }
        }
       
        return <div className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${className}`}>{text}</div>
    }

    const filteredProjects = useMemo(() => {
        return projects.filter(p => 
            p.homeowner.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
            p.address.city.toLowerCase().includes(projectSearch.toLowerCase()) ||
            p.address.street.toLowerCase().includes(projectSearch.toLowerCase())
        );
    }, [projects, projectSearch]);

    const projectLists: Record<ProjectAdminTab, ProjectWithDetails[]> = {
        all: filteredProjects,
        pending: filteredProjects.filter(p => p.status === ProjectStatus.PENDING_APPROVAL),
        approved: filteredProjects.filter(p => p.status === ProjectStatus.APPROVED || p.status === ProjectStatus.CONTACT_SHARED),
        sharedContact: filteredProjects.filter(p => p.status === ProjectStatus.CONTACT_SHARED),
        onHold: filteredProjects.filter(p => p.status === ProjectStatus.ON_HOLD),
        signed: filteredProjects.filter(p => p.status === ProjectStatus.SIGNED),
        deleted: filteredProjects.filter(p => p.status === ProjectStatus.DELETED),
    };
    
    const userLists: Record<UserAdminTab, User[]> = useMemo(() => {
        const all = [...homeowners, ...installers, ...admins];
        const searchFiltered = userSearch
            ? all.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || ('email' in u ? u.email : u.contact.email).toLowerCase().includes(userSearch.toLowerCase()))
            : all;

        return {
            all: searchFiltered,
            homeowners: searchFiltered.filter(u => 'phone' in u && !('serviceCounties' in u)),
            installers: searchFiltered.filter(u => 'serviceCounties' in u),
            admins: searchFiltered.filter(u => 'role' in u && !('serviceCounties' in u)),
        }
    }, [homeowners, installers, admins, userSearch]);

    const financialLists: Record<FinanceAdminTab, FinancialRecord[]> = {
        pending: financialRecords.filter(r => r.status === FinancialRecordStatus.PENDING),
        paid: financialRecords.filter(r => r.status === FinancialRecordStatus.PAID),
    };
    
    const handleSavePost = (postData: Omit<BlogPost, 'id' | 'authorId' | 'createdAt' | 'status'>) => {
        let updatedPosts;
        if (editingPost === 'new') {
            const newPost: BlogPost = {
                ...postData,
                id: `post-${Date.now()}`,
                authorId: currentUser!.id,
                createdAt: new Date(),
                status: BlogPostStatus.PUBLISHED,
            };
            updatedPosts = [newPost, ...blogPosts];
            logAction('Blog Post Created', { type: 'blog', id: newPost.id, name: newPost.title.en });
        } else if(editingPost) {
            updatedPosts = blogPosts.map(p => p.id === editingPost.id ? { ...p, ...postData } : p);
            logAction('Blog Post Edited', { type: 'blog', id: editingPost.id, name: postData.title.en });
        } else {
            return;
        }
        onBlogPostChange(updatedPosts);
        setEditingPost(null);
    };

    const handleDeletePost = (postId: string) => {
        const postToDelete = blogPosts.find(p => p.id === postId);
        if (postToDelete) {
            setConfirmation({
                title: t('Delete') + ' ' + t('Blog'),
                message: t('ConfirmDeletePost', { postTitle: postToDelete.title[language] }),
                onConfirm: () => {
                    setConfirmation(null);
                    const updated = blogPosts.filter(p => p.id !== postId);
                    onBlogPostChange(updated);
                    logAction('Blog Post Deleted', { type: 'blog', id: postId, name: postToDelete.title.en });
                }
            });
        }
    };
    
    const handleAddRoofType = () => {
        if(newRoofTypeName.trim() === '') return;
        const newRoofType = { id: `rt-${Date.now()}`, name: newRoofTypeName };
        onRoofTypeChange([...roofTypes, newRoofType]);
        setNewRoofTypeName('');
    };

    const handleDeleteRoofType = (id: string) => {
        setConfirmation({
            title: t('Delete') + ' ' + t('Roof Type'),
            message: t('ConfirmDeleteRoofType'),
            onConfirm: () => {
                setConfirmation(null);
                onRoofTypeChange(roofTypes.filter(rt => rt.id !== id));
            }
        });
    };
    
    const dashboardTabs: {id: AdminTab, icon: React.ComponentProps<typeof Icon>['name'], label: string}[] = [
        { id: 'projects', icon: 'briefcase', label: t('Projects') },
        { id: 'users', icon: 'users', label: t('Users') },
        { id: 'blog', icon: 'blog', label: t('Blog') },
        { id: 'finance', icon: 'finance', label: t('Finance') },
        { id: 'reports', icon: 'chart-bar', label: t('Reports') },
        { id: 'settings', icon: 'settings', label: t('Settings') },
        { id: 'profile', icon: 'user', label: t('My Profile') },
    ];

    if (showEquipmentSettings) {
        return <EquipmentSettingsTab 
                    onBack={() => setShowEquipmentSettings(false)}
                    equipmentBrands={equipmentBrands}
                    panelModels={panelModels}
                    inverterModels={inverterModels}
                    batteryModels={batteryModels}
                    onEquipmentChange={onEquipmentChange}
                    logAction={logAction}
                />
    }

    return (
        <div className="space-y-6">
            {editingProject && <ProjectEditModal project={editingProject} onClose={() => setEditingProject(null)} onSave={onEditProject} roofTypes={roofTypes} />}
            {approvingProject && <ProjectApprovalModal project={approvingProject} onClose={() => setApprovingProject(null)} onConfirmApproval={handleConfirmApproval} />}
            {editingUser && <UserEditModal user={editingUser} onClose={() => setEditingUser(null)} onSave={onEditUser} />}
            {isAddAdminModalOpen && <AddAdminModal onClose={() => setAddAdminModalOpen(false)} onAddAdmin={onAddAdmin} />}
            {editingPost && <BlogEditModal post={editingPost === 'new' ? null : editingPost} onClose={() => setEditingPost(null)} onSave={handleSavePost} />}
            {confirmation && (
                <ConfirmationModal
                    isOpen={!!confirmation}
                    title={confirmation.title}
                    message={confirmation.message}
                    onConfirm={confirmation.onConfirm}
                    onClose={() => setConfirmation(null)}
                />
            )}

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('Admin Dashboard')}</h1>
                    <p className="text-lg text-gray-400">{t('Manage projects and users across the platform.')}</p>
                </div>
            </div>

            <div className="p-2 bg-slate-800 rounded-lg flex flex-wrap gap-2">
                {dashboardTabs.filter(tab => adminPermissions.visibleTabs.includes(tab.id)).map(tab => (
                    <Button key={tab.id} onClick={() => setActiveTab(tab.id)} variant={activeTab === tab.id ? 'primary' : 'secondary'} icon={<Icon name={tab.icon} className="w-4 h-4" />}>
                        {tab.label}
                    </Button>
                ))}
            </div>

            {activeTab === 'projects' && (
                <Card>
                    <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-900/50 rounded-lg">
                            {(Object.keys(projectLists) as ProjectAdminTab[]).map(tabKey => (
                                <button key={tabKey} onClick={() => setProjectTab(tabKey)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${activeProjectTab === tabKey ? 'bg-solar-green-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>
                                    {t(tabKey)} ({projectLists[tabKey].length})
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <input type="text" placeholder={t('Search projects by name, city, or address...')} value={projectSearch} onChange={e => setProjectSearch(e.target.value)} className="bg-slate-700 border-slate-600 rounded-md text-white pl-3 pr-8 py-2 w-full sm:w-64" />
                            <Icon name="tools" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                             <thead className="text-xs text-gray-400 uppercase bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-3">{t('Project')}</th>
                                    <th className="px-6 py-3">{t('Homeowner')}</th>
                                    <th className="px-6 py-3">{t('Status')}</th>
                                    <th className="px-6 py-3">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectLists[activeProjectTab].map(p => (
                                    <tr key={p.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800 cursor-pointer" onClick={() => onViewAdminProjectDetails(p.id)}>
                                        <td className="px-6 py-4">{`${p.address.street}, ${p.address.city}`}</td>
                                        <td className="px-6 py-4">{p.homeowner.name}</td>
                                        <td className="px-6 py-4">{getStatusChip(p.status, 'project')}</td>
                                        <td className="px-6 py-4 flex flex-wrap gap-2" onClick={e => e.stopPropagation()}>
                                            {p.status === ProjectStatus.PENDING_APPROVAL && <Button size="sm" onClick={() => setApprovingProject(p)}>{t('Approve')}</Button>}
                                            <Button size="sm" variant="secondary" onClick={() => setEditingProject(p)} icon={<Icon name="edit" className="w-4 h-4"/>}/>
                                            {p.status !== ProjectStatus.DELETED && p.status !== ProjectStatus.ON_HOLD && <Button size="sm" variant="secondary" onClick={() => setConfirmation({ title: t('Hold') + ' ' + t('Project'), message: t('confirmActionMessage'), onConfirm: () => { setConfirmation(null); onUpdateProjectStatus(p.id, ProjectStatus.ON_HOLD); } })} icon={<Icon name="pause" className="w-4 h-4"/>} title={t('Hold')} />}
                                            {p.status === ProjectStatus.ON_HOLD && <Button size="sm" variant="secondary" onClick={() => setConfirmation({ title: t('Restore') + ' ' + t('Project'), message: t('confirmActionMessage'), onConfirm: () => { setConfirmation(null); onUpdateProjectStatus(p.id, ProjectStatus.APPROVED); } })} icon={<Icon name="play" className="w-4 h-4"/>} title={t('Restore')} />}
                                            {p.status !== ProjectStatus.DELETED && <Button size="sm" variant="danger" onClick={() => setConfirmation({ title: t('Delete') + ' ' + t('Project'), message: t('confirmActionMessage'), onConfirm: () => { setConfirmation(null); onUpdateProjectStatus(p.id, ProjectStatus.DELETED); } })} icon={<Icon name="trash" className="w-4 h-4"/>} />}
                                            {adminPermissions.canLoginAs && <Button size="sm" variant="secondary" onClick={() => onLoginAs(UserRole.CLIENT, p.homeownerId)} title={t('Login As')}><Icon name="eye" className="w-4 h-4"/></Button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {projectLists[activeProjectTab].length === 0 && <p className="text-center py-8 text-gray-400">{t('No projects in this category.')}</p>}
                    </div>
                </Card>
            )}

            {activeTab === 'users' && (
                 <Card>
                    <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-900/50 rounded-lg">
                           {(Object.keys(userLists) as UserAdminTab[]).map(tabKey => (
                                <button key={tabKey} onClick={() => setUserTab(tabKey)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${activeUserTab === tabKey ? 'bg-solar-green-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>
                                    {t(tabKey)} ({userLists[tabKey].length})
                                </button>
                           ))}
                        </div>
                        <div className="relative">
                            <input type="text" placeholder={t('Search users by name or email...')} value={userSearch} onChange={e => setUserSearch(e.target.value)} className="bg-slate-700 border-slate-600 rounded-md text-white pl-3 pr-8 py-2 w-full sm:w-64" />
                            <Icon name="user" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-3">{t('Name')}</th>
                                    <th className="px-6 py-3">{t('Email')}</th>
                                    <th className="px-6 py-3">{t('Role')}</th>
                                    <th className="px-6 py-3">{t('Status')}</th>
                                    <th className="px-6 py-3">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userLists[activeUserTab].map(u => {
                                    const role = 'serviceCounties' in u ? UserRole.INSTALLER : 'role' in u ? UserRole.ADMIN : UserRole.CLIENT;
                                    const userType = role === UserRole.INSTALLER ? 'installer' : role === UserRole.ADMIN ? 'admin' : 'homeowner';
                                    return (
                                        <tr key={u.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800 cursor-pointer" onClick={() => onViewAdminUserDetails(u.id)}>
                                            <td className="px-6 py-4">{u.name}</td>
                                            <td className="px-6 py-4">{'email' in u ? u.email : u.contact.email}</td>
                                            <td className="px-6 py-4">{t(`Role_${UserRole[role]}`)}</td>
                                            <td className="px-6 py-4">{getStatusChip(u.status, 'user')}</td>
                                            <td className="px-6 py-4 flex flex-wrap gap-2" onClick={e => e.stopPropagation()}>
                                                <Button size="sm" variant="secondary" onClick={() => setEditingUser(u)} icon={<Icon name="edit" className="w-4 h-4"/>}/>
                                                {u.status !== UserStatus.DELETED && u.status !== UserStatus.ON_HOLD && <Button size="sm" variant="secondary" onClick={() => setConfirmation({ title: t('Hold') + ' ' + t('User'), message: t('confirmActionMessage'), onConfirm: () => { setConfirmation(null); onUpdateUserStatus(u.id, userType, UserStatus.ON_HOLD); } })} icon={<Icon name="pause" className="w-4 h-4"/>} />}
                                                {u.status === UserStatus.ON_HOLD && <Button size="sm" variant="secondary" onClick={() => setConfirmation({ title: t('Activate') + ' ' + t('User'), message: t('confirmActionMessage'), onConfirm: () => { setConfirmation(null); onUpdateUserStatus(u.id, userType, UserStatus.ACTIVE); } })} icon={<Icon name="play" className="w-4 h-4"/>} />}
                                                {u.status !== UserStatus.DELETED && <Button size="sm" variant="danger" onClick={() => setConfirmation({ title: t('Delete') + ' ' + t('User'), message: t('confirmActionMessage'), onConfirm: () => { setConfirmation(null); onUpdateUserStatus(u.id, userType, UserStatus.DELETED); } })} icon={<Icon name="trash" className="w-4 h-4"/>} />}
                                                {adminPermissions.canLoginAs && u.id !== currentUser.id && <Button size="sm" variant="secondary" onClick={() => onLoginAs(role, u.id)} title={t('Login As')}><Icon name="eye" className="w-4 h-4"/></Button>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {userLists[activeUserTab].length === 0 && <p className="text-center py-8 text-gray-400">{t('No users in this category.')}</p>}
                    </div>
                </Card>
            )}

            {activeTab === 'blog' && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">{t('Manage Blog Posts')}</h3>
                        <Button onClick={() => setEditingPost('new')}>{t('Add New Post')}</Button>
                    </div>
                    <div className="space-y-4">
                        {blogPosts.map(post => {
                            const statusKey = post.status === BlogPostStatus.HIDDEN ? 'HIDDEN' : 'PUBLISHED';
                            const statusClassName = post.status === BlogPostStatus.HIDDEN 
                                ? 'bg-yellow-500/20 text-yellow-300' 
                                : 'bg-green-500/20 text-green-300';

                            return (
                                <div key={post.id} className="p-4 bg-slate-900/50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold">{post.title.en} / {post.title.ro}</span>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusClassName}`}>{t(statusKey)}</span>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            icon={<Icon name={post.status === BlogPostStatus.PUBLISHED ? 'eye-slash' : 'eye'} className="w-4 h-4"/>}
                                            onClick={() => onToggleBlogPostStatus(post.id)}
                                        >
                                            {post.status === BlogPostStatus.PUBLISHED ? t('Hide') : t('Publish')}
                                        </Button>
                                        <Button variant="secondary" size="sm" icon={<Icon name="edit" className="w-4 h-4"/>} onClick={() => setEditingPost(post)} />
                                        <Button variant="danger" size="sm" icon={<Icon name="trash" className="w-4 h-4"/>} onClick={() => handleDeletePost(post.id)}/>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {activeTab === 'finance' && (
                 <Card>
                    <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-900/50 rounded-lg">
                           {(Object.keys(financialLists) as FinanceAdminTab[]).map(tabKey => (
                                <button key={tabKey} onClick={() => setFinanceTab(tabKey)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${activeFinanceTab === tabKey ? 'bg-solar-green-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>
                                    {t(tabKey)} ({financialLists[tabKey].length})
                                </button>
                           ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                             <thead className="text-xs text-gray-400 uppercase bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-3">{t('Project City')}</th>
                                    <th className="px-6 py-3">{t('Installer')}</th>
                                    <th className="px-6 py-3">{t('Final Price')}</th>
                                    <th className="px-6 py-3">{t('Commission')}</th>
                                    <th className="px-6 py-3">{t('Signed Date')}</th>
                                    <th className="px-6 py-3">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financialLists[activeFinanceTab].map(r => (
                                    <tr key={r.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800">
                                        <td className="px-6 py-4">{r.projectCity}</td>
                                        <td className="px-6 py-4">{installers.find(i => i.id === r.installerId)?.name || 'N/A'}</td>
                                        <td className="px-6 py-4">{r.finalPrice.toLocaleString()} {t('currency_symbol')}</td>
                                        <td className="px-6 py-4">{r.commissionAmount.toLocaleString()} {t('currency_symbol')} ({r.commissionRate * 100}%)</td>
                                        <td className="px-6 py-4">{new Date(r.signedDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            {r.status === FinancialRecordStatus.PENDING && (
                                                <Button size="sm" onClick={() => setConfirmation({ title: t('Mark as Collected'), message: t('confirmActionMessage'), onConfirm: () => { setConfirmation(null); onUpdateFinancialRecord({...r, status: FinancialRecordStatus.PAID, paidDate: new Date()}); }}) }>{t('Mark as Collected')}</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'reports' && (
                <ReportsTab 
                    installers={installers}
                    financialRecords={financialRecords}
                    projects={projects}
                    homeowners={homeowners}
                    equipmentBrands={equipmentBrands}
                    panelModels={panelModels}
                    inverterModels={inverterModels}
                    batteryModels={batteryModels}
                />
            )}

            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-xl font-bold text-white mb-4">{t('Manage Roof Types')}</h3>
                        <div className="space-y-2 mb-4">
                            {roofTypes.map(rt => (
                                <div key={rt.id} className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                                    <span>{rt.name}</span>
                                    <Button size="sm" variant="danger" icon={<Icon name="trash" className="w-4 h-4"/>} onClick={() => handleDeleteRoofType(rt.id)}/>
                                </div>
                            ))}
                        </div>
                         <div className="flex gap-2">
                             <input type="text" value={newRoofTypeName} onChange={e => setNewRoofTypeName(e.target.value)} placeholder={t('New Roof Type Name')} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2"/>
                             <Button onClick={handleAddRoofType}>{t('Add')}</Button>
                         </div>
                    </Card>
                     <Card>
                        <h3 className="text-xl font-bold text-white mb-4">{t('Set Commission Rate')}</h3>
                        <form onSubmit={(e) => { e.preventDefault(); onUpdateCommissionRate(tempCommissionRate/100); }} className="flex items-center gap-2">
                            <input type="number" value={tempCommissionRate} onChange={e => setTempCommissionRate(Number(e.target.value))} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2"/>
                            <span className="text-xl font-medium text-gray-400">%</span>
                            <Button type="submit">{t('Save')}</Button>
                        </form>
                    </Card>
                    <Card>
                        <h3 className="text-xl font-bold text-white mb-4">{t('Manage Equipment')}</h3>
                        <p className="text-gray-400 mb-4">Manage all equipment brands and models available for installers to use in quotes.</p>
                        <Button className="w-full" onClick={() => setShowEquipmentSettings(true)} icon={<Icon name="cpu-chip" className="w-5 h-5"/>}>{t('Manage Equipment')}</Button>
                    </Card>
                     <Card>
                        <h3 className="text-xl font-bold text-white mb-4">{t('Add Admin')}</h3>
                        <p className="text-gray-400 mb-4">Create a new administrator account for the platform.</p>
                        <Button className="w-full" onClick={() => setAddAdminModalOpen(true)}>{t('Add New Admin')}</Button>
                    </Card>
                </div>
            )}
            
            {activeTab === 'profile' && <AdminProfileTab />}
        </div>
    )
};

export default AdminDashboard;