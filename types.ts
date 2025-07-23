
export enum UserRole {
  CLIENT,
  INSTALLER,
  ADMIN,
  NONE,
}

export enum ProjectStatus {
  PENDING_APPROVAL,
  APPROVED,
  COMPLETED,
  ON_HOLD,
  SIGNED,
  DELETED,
  CONTACT_SHARED,
}

export enum UserStatus {
  ACTIVE,
  ON_HOLD,
  DELETED,
  PENDING_VERIFICATION,
}

export enum FinancialRecordStatus {
    PENDING,
    PAID
}

export enum BlogPostStatus {
    PUBLISHED,
    HIDDEN,
}

export interface BilingualString {
    en: string;
    ro: string;
}

export interface Notification {
    id: string;
    userId: string;
    messageKey: string;
    messageParams: Record<string, string | number>;
    link: string;
    isRead: boolean;
    createdAt: Date;
}

export interface HistoryLog {
  id: string;
  timestamp: Date;
  actor: {
    id: string;
    name: string;
    role: UserRole;
  };
  action: string;
  target: {
    type: 'project' | 'user' | 'setting' | 'blog' | 'finance' | 'equipment';
    id: string;
    name: string;
  };
}

export interface Installer {
  id: string;
  name: string;
  password: string;
  establishmentDate: Date;
  registrationNumber: string; // CUI in Romania
  licenseNumber?: string;
  logoDataUrl: string;
  about: string;
  specialties: string[];
  serviceCounties: string[];
  contact: {
    email: string;
    phone: string;
  };
  portfolio: {
    imageDataUrl: string;
    caption: string;
  }[];
  status: UserStatus;
  createdAt: Date;
}

export interface Quote {
  id:string;
  installerId: string;
  price: number;
  priceWithoutBattery?: number;
  systemSizeKw: number;
  panelModelId: string;
  inverterModelId: string;
  batteryModelId?: string;
  warranty: string;
  estimatedAnnualProduction: number;
  costBreakdown: {
    equipment: number;
    labor: number;
    permits: number;
  };
}

export interface Homeowner {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  status: UserStatus;
  createdAt: Date;
}

export type AdminTab = 'projects' | 'users' | 'blog' | 'settings' | 'finance' | 'reports' | 'profile';

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  status: UserStatus;
  role: string;
  createdAt: Date;
  permissions: {
    canLoginAs: boolean;
    visibleTabs: AdminTab[];
  };
}

export type User = Homeowner | Installer | Admin;

export interface Project {
  id: string;
  homeownerId: string;
  address: {
    street: string;
    city: string;
    county: string;
  };
  energyBill: number;
  roofType: string;
  notes: string;
  wantsBattery: boolean;
  photoDataUrl?: string;
  quotes: Quote[];
  status: ProjectStatus;
  finalPrice?: number;
  signedDate?: Date;
  sharedWithInstallerIds?: string[];
  winningInstallerId?: string;
  createdAt: Date;
  reviewSubmitted: boolean;
}

export interface ProjectWithDetails extends Project {
    homeowner: Homeowner;
}

export interface RoofType {
    id: string;
    name: string;
}

export interface BlogPost {
    id: string;
    title: BilingualString;
    content: BilingualString;
    authorId: string;
    imageDataUrl: string;
    createdAt: Date;
    status: BlogPostStatus;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    isAlert?: boolean;
}

export interface Conversation {
    id: string; // Typically linked to projectId or a support thread like `support-userId`
    participants: string[]; // List of user IDs
    messages: ChatMessage[];
}

export interface FinancialRecord {
    id: string;
    projectId: string;
    projectCity: string;
    installerId: string;
    finalPrice: number;
    commissionRate: number;
    commissionAmount: number;
    status: FinancialRecordStatus;
    signedDate: Date;
    paidDate?: Date;
}

// Structured Equipment
export type EquipmentType = 'panel' | 'inverter' | 'battery';

export interface EquipmentBrand {
    id: string;
    name: string;
    type: EquipmentType;
}

export interface PanelModel {
    id: string;
    brandId: string;
    name: string;
    wattage: number;
    efficiency: number;
}

export interface InverterModel {
    id: string;
    brandId: string;
    name: string;
    efficiency: number;
}

export interface BatteryModel {
    id: string;
    brandId: string;
    name: string;
    capacityKwh: number;
    efficiency: number;
}

export interface Review {
  id: string;
  projectId: string;
  installerId: string;
  homeownerId: string;
  homeownerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

export interface FeasibilityReport {
    estimatedSystemSizeKw: string;
    estimatedAnnualProductionKwh: string;
    summary: string;
    potentialBenefits: string[];
}