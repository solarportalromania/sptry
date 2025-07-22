


import { UserRole, UserStatus, ProjectStatus, FinancialRecordStatus, Homeowner, Installer, Admin, Project, RoofType, BlogPost, Conversation, Notification, FinancialRecord, HistoryLog, EquipmentBrand, PanelModel, InverterModel, BatteryModel, Review } from '../types';

export const placeholderImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const mockHomeowners: Homeowner[] = [
    { id: 'ho1', name: 'Testuser 1', email: 'testuser1@example.com', password: 'password123', phone: '0722 123 456', status: UserStatus.ACTIVE, createdAt: new Date('2024-05-10T09:00:00Z') },
    { id: 'ho2', name: 'Testuser 2', email: 'testuser2@example.com', password: 'password123', phone: '0744 987 654', status: UserStatus.ACTIVE, createdAt: new Date('2024-05-18T11:20:00Z') },
    { id: 'ho3', name: 'Testuser 3', email: 'testuser3@example.com', password: 'password123', phone: '0755 111 222', status: UserStatus.ACTIVE, createdAt: new Date('2024-05-22T15:00:00Z') },
];
export const mockAdmins: Admin[] = [
    { id: 'admin1', name: 'Testadmin 1', email: 'admin@solarportal.com', password: 'adminpassword', status: UserStatus.ACTIVE, role: 'Super Admin', createdAt: new Date('2024-01-01T00:00:00Z'), permissions: { canLoginAs: true, visibleTabs: ['projects', 'users', 'blog', 'finance', 'reports', 'settings'] } },
];
export const mockInstallers: Installer[] = [
  {
    id: 'inst1', name: 'Testinstaller 1', password: 'password123', establishmentDate: new Date('2010-03-15T00:00:00Z'), registrationNumber: 'RO12345678', licenseNumber: '', logoDataUrl: placeholderImage, about: 'Testinstaller 1 has been a leader in renewable energy for over a decade, specializing in high-efficiency residential and commercial solar panel installations. Our commitment is to provide sustainable energy solutions with top-tier customer service and long-term support.', specialties: ['Residential', 'Commercial', 'Battery Backup'], serviceCounties: ['Cluj', 'Bihor', 'Sălaj'], contact: { email: 'contact@testinstaller1.com', phone: '0721 000 111' }, portfolio: [{ imageDataUrl: placeholderImage, caption: 'Modern home installation in Cluj-Napoca' }], status: UserStatus.ACTIVE, createdAt: new Date('2024-02-15T10:00:00Z'),
  },
  {
    id: 'inst2', name: 'Testinstaller 2', password: 'password123', establishmentDate: new Date('2018-07-20T00:00:00Z'), registrationNumber: 'RO87654321', licenseNumber: 'ANRE-112233', logoDataUrl: placeholderImage, about: 'As Testinstaller 2, we bring cutting-edge technology to the Romanian market, offering integrated solutions including Solar Roof, Powerwall batteries, and seamless integration with EV chargers.', specialties: ['Tesla Solar Roof', 'Powerwall Batteries', 'EV Chargers'], serviceCounties: ['București', 'Ilfov', 'Prahova'], contact: { email: 'contact@testinstaller2.com', phone: '0722 000 222' }, portfolio: [], status: UserStatus.ACTIVE, createdAt: new Date('2024-03-01T12:00:00Z'),
  },
];
export const mockEquipmentBrands: EquipmentBrand[] = [ { id: 'brand_p_1', name: 'Canadian Solar', type: 'panel' }, { id: 'brand_i_1', name: 'Fronius', type: 'inverter' }, { id: 'brand_b_1', name: 'Tesla', type: 'battery' } ];
export const mockPanelModels: PanelModel[] = [ { id: 'model_p_1', brandId: 'brand_p_1', name: 'HiKu6', wattage: 455, efficiency: 21.2 } ];
export const mockInverterModels: InverterModel[] = [ { id: 'model_i_1', brandId: 'brand_i_1', name: 'Primo GEN24', efficiency: 97.6 } ];
export const mockBatteryModels: BatteryModel[] = [ { id: 'model_b_1', brandId: 'brand_b_1', name: 'Powerwall 2', capacityKwh: 13.5, efficiency: 90.0 } ];

export const mockReviews: Review[] = [
    {
        id: 'rev1',
        projectId: 'p1',
        installerId: 'inst1',
        homeownerId: 'ho1',
        homeownerName: 'Testuser 1',
        rating: 5,
        comment: 'Fantastic job! The team was professional, efficient, and very clean. Our system is working perfectly. Highly recommend!',
        createdAt: new Date('2024-06-15T14:00:00Z')
    }
];

export const mockProjects: Project[] = [
    { 
        id: 'p1', homeownerId: 'ho1', address: { street: 'Str. Soarelui 45', city: 'Cluj-Napoca', county: 'Cluj' }, energyBill: 1250, roofType: 'Tile', notes: 'Acoperiș orientat spre sud, în stare bună.', wantsBattery: false, 
        quotes: [{ 
            id: 'q1', installerId: 'inst1', price: 85000, systemSizeKw: 7.2, panelModelId: 'model_p_1', inverterModelId: 'model_i_1', batteryModelId: undefined, warranty: '25-Year All-System', estimatedAnnualProduction: 9800, 
            costBreakdown: { equipment: 55000, labor: 25000, permits: 5000 }
        }], 
        status: ProjectStatus.SIGNED, 
        sharedWithInstallerIds: ['inst1'],
        winningInstallerId: 'inst1',
        finalPrice: 84500,
        signedDate: new Date('2024-06-10T10:00:00Z'),
        reviewSubmitted: true,
        createdAt: new Date('2024-05-10T09:00:00Z'), 
    },
    { 
        id: 'p2', homeownerId: 'ho2', address: { street: 'Aleea Florilor 12', city: 'București', county: 'București' }, energyBill: 800, roofType: 'Metal', notes: 'Doresc și o soluție de backup cu baterie.', wantsBattery: true, 
        quotes: [{
            id: 'q2', installerId: 'inst2', price: 72000, systemSizeKw: 5.5, panelModelId: 'model_p_1', inverterModelId: 'model_i_1', batteryModelId: 'model_b_1', warranty: '25-Year Panel, 10-Year Inverter', estimatedAnnualProduction: 6500, 
            costBreakdown: { equipment: 48000, labor: 20000, permits: 4000 }
        }], 
        status: ProjectStatus.SIGNED,
        winningInstallerId: 'inst2',
        finalPrice: 71500,
        signedDate: new Date('2024-06-20T11:00:00Z'),
        reviewSubmitted: false,
        createdAt: new Date('2024-05-18T11:20:00Z'), 
    },
    {
        id: 'p3',
        homeownerId: 'ho3',
        address: { street: 'Bulevardul Dacia 15', city: 'Oradea', county: 'Bihor' },
        energyBill: 600,
        roofType: 'Metal',
        notes: 'I would like to get quotes as soon as possible. The roof is facing south-west.',
        wantsBattery: true,
        quotes: [],
        status: ProjectStatus.PENDING_APPROVAL,
        createdAt: new Date('2024-05-23T10:00:00Z'),
        reviewSubmitted: false,
    }
];

export const mockRoofTypes: RoofType[] = [ { id: 'rt1', name: 'Asphalt Shingle' }, { id: 'rt2', name: 'Tile' }, { id: 'rt3', name: 'Metal' }, { id: 'rt4', name: 'Flat' } ];

export const mockBlogPosts: BlogPost[] = [ 
    { 
        id: 'post1', 
        title: { en: 'Why Go Solar in 2024?', ro: 'De ce să treci la Solar în 2024?' }, 
        content: { en: 'The landscape of renewable energy is rapidly evolving, and 2024 presents a compelling case for homeowners to invest in solar power. With rising electricity costs, increased government incentives, and significant advancements in photovoltaic technology, the financial and environmental benefits have never been more aligned. Modern solar panels are more efficient and durable than ever, ensuring a reliable, long-term energy source that reduces your carbon footprint and enhances your property value. Make the switch this year to secure your energy independence for decades to come.', ro: 'Peisajul energiei regenerabile evoluează rapid, iar 2024 prezintă un argument convingător pentru proprietarii de case să investească în energia solară. Cu creșterea costurilor la electricitate, stimulente guvernamentale mărite și progrese semnificative în tehnologia fotovoltaică, beneficiile financiare și de mediu nu au fost niciodată mai aliniate. Panourile solare moderne sunt mai eficiente și mai durabile ca niciodată, asigurând o sursă de energie fiabilă pe termen lung, care reduce amprenta de carbon și crește valoarea proprietății. Faceți trecerea în acest an pentru a vă asigura independența energetică pentru deceniile următoare.' }, 
        authorId: 'admin1', 
        imageDataUrl: placeholderImage, 
        createdAt: new Date('2024-05-20T10:00:00Z'), 
    } 
];

export const mockConversations: Conversation[] = [];
export const mockNotifications: Notification[] = [];
export const mockFinancialRecords: FinancialRecord[] = [];
export const mockHistory: HistoryLog[] = [];
export const mockCommissionRate = 0.10;