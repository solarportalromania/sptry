

import React, { useState, useMemo } from 'react';
import { Installer, FinancialRecord, ProjectWithDetails, ProjectStatus, Homeowner, Quote, EquipmentBrand, PanelModel, InverterModel, BatteryModel } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';

interface ReportsTabProps {
    installers: Installer[];
    financialRecords: FinancialRecord[];
    projects: ProjectWithDetails[];
    homeowners: Homeowner[];
    equipmentBrands: EquipmentBrand[];
    panelModels: PanelModel[];
    inverterModels: InverterModel[];
    batteryModels: BatteryModel[];
}

type ReportType = 'commission' | 'performance' | 'projectMetrics' | 'equipment' | 'funnel' | 'geo' | 'userGrowth';

interface ReportDefinition {
    id: ReportType;
    titleKey: string;
    icon: 'finance' | 'chart-bar' | 'presentation-chart-line' | 'cpu-chip' | 'funnel' | 'map' | 'users';
    generator: () => void;
    category: 'financial' | 'metrics' | 'growth';
    requiresDateFilter?: boolean;
    requiresInstallerFilter?: boolean;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ installers, financialRecords, projects, homeowners, equipmentBrands, panelModels, inverterModels, batteryModels }) => {
    const { t } = useLanguage();
    const [activeReport, setActiveReport] = useState<ReportDefinition | null>(null);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', installerId: '' });
    const [generatedReport, setGeneratedReport] = useState<{ title: string; headers: {key: string, label: string}[]; data: any[]; totals?: any, summaryCards?: any[] } | null>(null);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const applyDateFilter = <T extends { createdAt?: Date, signedDate?: Date }>(data: T[]): T[] => {
        let filteredData = data;
        if (filters.startDate) {
            filteredData = filteredData.filter(item => {
                const itemDate = item.createdAt || item.signedDate;
                return itemDate && new Date(itemDate) >= new Date(filters.startDate);
            });
        }
        if (filters.endDate) {
            filteredData = filteredData.filter(item => {
                const itemDate = item.createdAt || item.signedDate;
                return itemDate && new Date(itemDate) <= new Date(filters.endDate);
            });
        }
        return filteredData;
    };

    const reportDefinitions: ReportDefinition[] = [
        // Financial
        { id: 'commission', titleKey: 'Commission Report', icon: 'finance', generator: generateCommissionReport, category: 'financial', requiresDateFilter: true, requiresInstallerFilter: true },
        // Metrics
        { id: 'projectMetrics', titleKey: 'Project Metrics', icon: 'presentation-chart-line', generator: generateProjectMetricsReport, category: 'metrics', requiresDateFilter: true },
        { id: 'equipment', titleKey: 'Equipment Popularity', icon: 'cpu-chip', generator: generateEquipmentReport, category: 'metrics', requiresDateFilter: true },
        // Growth
        { id: 'funnel', titleKey: 'Conversion Funnel', icon: 'funnel', generator: generateConversionFunnelReport, category: 'growth', requiresDateFilter: true },
        { id: 'geo', titleKey: 'Geographic Lead Report', icon: 'map', generator: generateGeoReport, category: 'growth', requiresDateFilter: true },
        { id: 'userGrowth', titleKey: 'User Growth', icon: 'users', generator: generateUserGrowthReport, category: 'growth', requiresDateFilter: true },
        { id: 'performance', titleKey: 'Installer Performance', icon: 'chart-bar', generator: generatePerformanceReport, category: 'growth' },
    ];
    
    function generateCommissionReport() {
        let data = applyDateFilter([...financialRecords]);
        if (filters.installerId) data = data.filter(r => r.installerId === filters.installerId);

        const reportData = data.map(r => ({
            projectCity: r.projectCity,
            installerName: installers.find(i => i.id === r.installerId)?.name || 'N/A',
            signedDate: new Date(r.signedDate).toLocaleDateString(),
            finalPrice: r.finalPrice,
            commissionAmount: r.commissionAmount
        }));
        
        const totals = {
            finalPrice: data.reduce((acc, r) => acc + r.finalPrice, 0),
            commissionAmount: data.reduce((acc, r) => acc + r.commissionAmount, 0)
        };

        setGeneratedReport({
            title: t('Commission Report'),
            headers: [
                { key: 'projectCity', label: t('Project City') },
                { key: 'installerName', label: t('Installer') },
                { key: 'signedDate', label: t('Signed Date') },
                { key: 'finalPrice', label: t('Final Price') },
                { key: 'commissionAmount', label: t('Commission Amount') },
            ],
            data: reportData,
            totals
        });
    };

    function generatePerformanceReport() {
        const data = installers.map(installer => {
            const leadsReceived = projects.filter(p => p.status >= ProjectStatus.APPROVED && installer.serviceCounties.includes(p.address.county)).length;
            const quotesSubmitted = projects.reduce((acc, p) => acc + p.quotes.filter(q => q.installerId === installer.id).length, 0);
            const dealsWon = projects.filter(p => p.winningInstallerId === installer.id).length;
            const quoteRate = leadsReceived > 0 ? (quotesSubmitted / leadsReceived * 100).toFixed(1) + '%' : '0.0%';
            const winRate = quotesSubmitted > 0 ? (dealsWon / quotesSubmitted * 100).toFixed(1) + '%' : '0.0%';

            return {
                installerName: installer.name,
                leadsReceived,
                quotesSubmitted,
                quoteRate,
                dealsWon,
                winRate
            };
        });

        setGeneratedReport({
            title: t('Installer Performance'),
            headers: [
                { key: 'installerName', label: t('Installer') },
                { key: 'leadsReceived', label: t('Leads Received')},
                { key: 'quotesSubmitted', label: t('Quotes Submitted') },
                { key: 'quoteRate', label: t('Quote Rate') },
                { key: 'dealsWon', label: t('Deals Won') },
                { key: 'winRate', label: t('Win Rate') },
            ],
            data,
        });
    };

    function generateProjectMetricsReport() {
        const filteredProjects = applyDateFilter(projects);
        const allQuotes = filteredProjects.flatMap(p => p.quotes);

        const avgSystemSize = allQuotes.length > 0 ? (allQuotes.reduce((sum, q) => sum + q.systemSizeKw, 0) / allQuotes.length).toFixed(2) : 0;
        const avgPrice = allQuotes.length > 0 ? (allQuotes.reduce((sum, q) => sum + q.price, 0) / allQuotes.length) : 0;

        setGeneratedReport({
            title: t('Project Metrics'),
            headers: [],
            data: [],
            summaryCards: [
                { label: t('Average System Size'), value: `${avgSystemSize} kW` },
                { label: t('Average Quote Price'), value: `${avgPrice.toLocaleString(undefined, {maximumFractionDigits: 0})} ${t('currency_symbol')}` },
            ]
        });
    }

    function generateEquipmentReport() {
        const filteredProjects = applyDateFilter(projects);
        const allQuotes = filteredProjects.flatMap(p => p.quotes);
        
        const countModels = (modelIds: string[], allModels: (PanelModel | InverterModel | BatteryModel)[]) => {
            const counts: {[key: string]: number} = {};
            modelIds.forEach(id => {
                counts[id] = (counts[id] || 0) + 1;
            });
            return Object.entries(counts).map(([id, count]) => {
                const model = allModels.find(m => m.id === id);
                const brand = equipmentBrands.find(b => b.id === model?.brandId);
                return { name: `${brand?.name || ''} ${model?.name || 'Unknown'}`, count };
            }).sort((a,b) => b.count - a.count);
        }

        const panels = countModels(allQuotes.map(q => q.panelModelId), panelModels);
        const inverters = countModels(allQuotes.map(q => q.inverterModelId), inverterModels);
        const batteries = countModels(allQuotes.map(q => q.batteryModelId).filter((id): id is string => !!id), batteryModels);


         setGeneratedReport({
            title: t('Equipment Popularity'),
            headers: [ // This is a bit of a hack since we have multiple tables
                {key: 'panel', label: t('Most Popular Panels')},
                {key: 'inverter', label: t('Most Popular Inverters')},
                {key: 'battery', label: t('Most Popular Batteries')},
            ],
            data: [{panels, inverters, batteries}], // Data is structured for special rendering
        });
    }
    
    function generateConversionFunnelReport() {
        const filteredProjects = applyDateFilter(projects);
        const createdCount = filteredProjects.length;
        const approvedCount = filteredProjects.filter(p => p.status >= ProjectStatus.APPROVED).length;
        const quotedCount = filteredProjects.filter(p => p.quotes.length > 0).length;
        const signedCount = filteredProjects.filter(p => p.status === ProjectStatus.SIGNED).length;

        const data = [
            { stage: t('Created'), projects: createdCount, conversion: '100%' },
            { stage: t('Approved'), projects: approvedCount, conversion: createdCount > 0 ? `${(approvedCount / createdCount * 100).toFixed(1)}%` : '0%' },
            { stage: t('Quoted'), projects: quotedCount, conversion: approvedCount > 0 ? `${(quotedCount / approvedCount * 100).toFixed(1)}%` : '0%' },
            { stage: t('Signed'), projects: signedCount, conversion: quotedCount > 0 ? `${(signedCount / quotedCount * 100).toFixed(1)}%` : '0%' },
        ];
        
        setGeneratedReport({
            title: t('Conversion Funnel'),
            headers: [
                {key: 'stage', label: t('Stage')},
                {key: 'projects', label: t('Projects')},
                {key: 'conversion', label: t('Conversion')},
            ],
            data,
        });
    }
    
    function generateGeoReport() {
        const filteredProjects = applyDateFilter(projects);
        const countyCounts: {[key: string]: number} = {};
        filteredProjects.forEach(p => {
            countyCounts[p.address.county] = (countyCounts[p.address.county] || 0) + 1;
        });
        const data = Object.entries(countyCounts)
            .map(([county, leadCount]) => ({ county, leadCount }))
            .sort((a, b) => b.leadCount - a.leadCount);
        
         setGeneratedReport({
            title: t('Geographic Lead Report'),
            headers: [
                {key: 'county', label: t('County')},
                {key: 'leadCount', label: t('Lead Count')},
            ],
            data,
        });
    }
    
    function generateUserGrowthReport() {
        const newHomeowners = applyDateFilter(homeowners).length;
        const newInstallers = applyDateFilter(installers).length;
        
         setGeneratedReport({
            title: t('User Growth'),
            headers: [],
            data: [],
            summaryCards: [
                { label: t('New Homeowners'), value: newHomeowners },
                { label: t('New Installers'), value: newInstallers },
            ]
        });
    }

    const handleGenerate = () => {
        activeReport?.generator();
    };
    
    const handleDownloadCsv = () => {
        if (!generatedReport) return;
        
        const { headers, data, title } = generatedReport;
        if(title === t('Equipment Popularity')) return; // Special case, no easy CSV

        const csvRows = [
            headers.map(h => h.label).join(','),
            ...data.map(row => 
                headers.map(header => {
                    let value = row[header.key as keyof typeof row] as any;
                    if(typeof value === 'string' && value.includes(',')) return `"${value}"`;
                    return value;
                }).join(',')
            )
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `${title.replace(/\s/g, '_')}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    
    const handlePrint = () => {
        window.print();
    }
    
    const renderReportSelector = (category: 'financial' | 'metrics' | 'growth') => {
        return (
             <Card>
                <h3 className="text-xl font-bold text-white mb-4">{t(`${category.charAt(0).toUpperCase() + category.slice(1)} Reports`)}</h3>
                <div className="flex flex-wrap gap-4">
                    {reportDefinitions.filter(r => r.category === category).map(def => (
                        <Button 
                            key={def.id}
                            onClick={() => setActiveReport(def)} 
                            variant={activeReport?.id === def.id ? 'primary' : 'secondary'} 
                            icon={<Icon name={def.icon} className="w-5 h-5"/>}
                        >
                            {t(def.titleKey)}
                        </Button>
                    ))}
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <style>{`
                @media print {
                    body > div > *:not(main),
                    main > *:not(.printable-report-area),
                    .no-print {
                        display: none !important;
                    }
                    main, .printable-report-area {
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: #fff !important;
                        color: #000 !important;
                    }
                     .printable-report-area, .printable-report-area * {
                        background: #fff !important;
                        color: #000 !important;
                        box-shadow: none !important;
                        border-color: #ccc !important;
                     }
                }
            `}</style>

            <div className="space-y-6">
                {renderReportSelector('financial')}
                {renderReportSelector('metrics')}
                {renderReportSelector('growth')}
            </div>

            {activeReport && (
                <Card>
                    <h3 className="text-xl font-bold text-white mb-4">{t('Filters')} for {t(activeReport.titleKey)}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {activeReport.requiresDateFilter && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('Start Date')}</label>
                                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('End Date')}</label>
                                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2" />
                                </div>
                            </>
                        )}
                        {activeReport.requiresInstallerFilter && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('Filter by Installer')}</label>
                                <select name="installerId" value={filters.installerId} onChange={handleFilterChange} className="w-full bg-slate-700 border-slate-600 rounded-md text-white px-3 py-2">
                                    <option value="">{t('All Installers')}</option>
                                    {installers.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="self-end">
                            <Button onClick={handleGenerate} className="w-full">{t('Generate')}</Button>
                        </div>
                    </div>
                </Card>
            )}

            {generatedReport && (
                <Card className="printable-report-area">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">{generatedReport.title}</h2>
                        <div className="flex gap-2 no-print">
                            <Button variant="secondary" onClick={handlePrint} icon={<Icon name="print" className="w-4 h-4"/>}>{t('Print Report')}</Button>
                            <Button variant="secondary" onClick={handleDownloadCsv} icon={<Icon name="download" className="w-4 h-4"/>}>{t('Download CSV')}</Button>
                        </div>
                    </div>
                    
                    {generatedReport.summaryCards && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {generatedReport.summaryCards.map(card => (
                                <Card key={card.label} className="text-center bg-slate-900">
                                    <p className="text-lg font-semibold text-gray-400">{card.label}</p>
                                    <p className="text-3xl font-bold text-solar-green-400">{card.value}</p>
                                </Card>
                            ))}
                        </div>
                    )}
                    
                    {generatedReport.data.length > 0 ? (
                        generatedReport.title === t('Equipment Popularity') ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <h4 className="font-bold text-lg mb-2 text-white">{t('Most Popular Panels')}</h4>
                                    <div className="space-y-2">
                                        {generatedReport.data[0].panels.map((item: any) => (
                                            <div key={item.name} className="flex justify-between p-2 bg-slate-800 rounded"><span>{item.name}</span><strong>{item.count}</strong></div>
                                        ))}
                                    </div>
                                </div>
                                 <div>
                                    <h4 className="font-bold text-lg mb-2 text-white">{t('Most Popular Inverters')}</h4>
                                    <div className="space-y-2">
                                        {generatedReport.data[0].inverters.map((item: any) => (
                                            <div key={item.name} className="flex justify-between p-2 bg-slate-800 rounded"><span>{item.name}</span><strong>{item.count}</strong></div>
                                        ))}
                                    </div>
                                </div>
                                 <div>
                                    <h4 className="font-bold text-lg mb-2 text-white">{t('Most Popular Batteries')}</h4>
                                    <div className="space-y-2">
                                        {generatedReport.data[0].batteries.map((item: any) => (
                                            <div key={item.name} className="flex justify-between p-2 bg-slate-800 rounded"><span>{item.name}</span><strong>{item.count}</strong></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                             <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-300">
                                    <thead className="text-xs text-gray-400 uppercase bg-slate-700/50">
                                        <tr>
                                            {generatedReport.headers.map(h => <th key={h.key} className="px-6 py-3">{h.label}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generatedReport.data.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800">
                                                {generatedReport.headers.map(header => (
                                                    <td key={header.key} className="px-6 py-4">{typeof row[header.key] === 'number' ? row[header.key].toLocaleString() : row[header.key]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                        {generatedReport.totals && (
                                            <tr className="bg-slate-700 font-bold text-white">
                                                <td colSpan={generatedReport.headers.length - 2} className="px-6 py-3 text-right uppercase">{t('Total')}</td>
                                                <td className="px-6 py-3">{generatedReport.totals.finalPrice.toLocaleString()}</td>
                                                <td className="px-6 py-3">{generatedReport.totals.commissionAmount.toLocaleString()}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : <p className="text-center text-gray-400 py-8">{t('No data available for this report and filter combination.')}</p>}
                </Card>
            )}
        </div>
    );
};

export default ReportsTab;