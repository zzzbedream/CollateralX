'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseGwei } from 'viem';
import { CONTRACTS } from '../contracts';
import {
    Search, X, TrendingUp, Activity, Zap, Shield, AlertTriangle,
    BarChart3, Settings as SettingsIcon, Store, ChevronRight, ExternalLink,
    RefreshCw, ToggleLeft, ToggleRight, Trash2, Terminal, Cpu, Wheat, Bolt,
    HardHat, ShoppingBag, Container, FileCode2, Fuel, Lock, Vote, Banknote,
    ArrowUpRight, Layers, Clock, CheckCircle2, XCircle, Wallet, CircleDollarSign,
    Landmark, ScrollText,
} from 'lucide-react';

//  CONTRACT SETUP 
const LENDING_POOL_ADDRESS = CONTRACTS.LENDING_POOL;
const NFT_ADDRESS = CONTRACTS.MOCK_NFT;
const MOCK_USDC_ADDRESS = CONTRACTS.MOCK_USDC;

const LENDING_ABI = [
    { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "depositCollateralAndBorrow", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

const NFT_ABI = [
    { inputs: [{ name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], name: "approve", outputs: [], stateMutability: "nonpayable", type: "function" },
    { inputs: [{ name: "tokenId", type: "uint256" }], name: "getApproved", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
    { inputs: [{ name: "tokenId", type: "uint256" }], name: "ownerOf", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
    { inputs: [{ name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], name: "mint", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

const MOCK_USDC_ABI = [
    { inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "mint", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

//  TYPES 
type Sector = 'All' | 'Agro' | 'Tech' | 'Energy' | 'Heavy' | 'Retail' | 'Logistics' | 'Health';
type Tier = 'All' | 'SME' | 'Enterprise';
type RiskRating = 'AAA' | 'AA+' | 'AA' | 'A+' | 'A' | 'BBB' | 'BB+' | 'B+';
type AuditStatus = 'verified' | 'pending' | 'in-review';
type ModalTab = 'overview' | 'contract-logic' | 'history';

interface InstitutionalAsset {
    id: number;
    name: string;
    sector: Exclude<Sector, 'All'>;
    tier: Exclude<Tier, 'All'>;
    valuation: number;
    maxLoan: number;
    riskRating: RiskRating;
    riskScore: number;
    apy: number;
    depreciation: number;
    stylusGasCost: number;
    solidityGasCost: number;
    condition: string;
    year: number;
    image: string;
    status: 'available' | 'collateralized' | 'pending';
    auditStatus: AuditStatus;
    ltvRatio: number;
    maturity: string;
    issuer: string;
}

//  INSTITUTIONAL ASSETS (Hybrid LatAm SME + Enterprise) 
const INSTITUTIONAL_ASSETS: InstitutionalAsset[] = [
    // ── SME Tier (LatAm Reality) ──
    { id: 1,  name: 'Horno Industrial Maigas',              sector: 'Retail',    tier: 'SME',        valuation: 4500,    maxLoan: 2700,    riskRating: 'BB+', riskScore: 38, apy: 12.5, depreciation: 15.0, stylusGasCost: 0.02, solidityGasCost: 42.10, condition: 'Good',      year: 2024, image: '/assets/horno.png',            status: 'available',       auditStatus: 'verified',  ltvRatio: 60, maturity: '6 mo',  issuer: 'PyME LatAm DAO' },
    { id: 2,  name: 'Flota Motos Honda (5u)',               sector: 'Logistics', tier: 'SME',        valuation: 8500,    maxLoan: 5100,    riskRating: 'BB+', riskScore: 35, apy: 11.8, depreciation: 18.0, stylusGasCost: 0.02, solidityGasCost: 43.50, condition: 'Good',      year: 2025, image: '/assets/moto.png',             status: 'available',       auditStatus: 'verified',  ltvRatio: 60, maturity: '12 mo', issuer: 'PyME LatAm DAO' },
    { id: 3,  name: 'Sillón Dental Hidráulico',            sector: 'Health',    tier: 'SME',        valuation: 6200,    maxLoan: 3720,    riskRating: 'BBB', riskScore: 30, apy: 10.2, depreciation: 10.0, stylusGasCost: 0.02, solidityGasCost: 41.80, condition: 'Excellent', year: 2025, image: '/assets/maquinadental.png',    status: 'available',       auditStatus: 'verified',  ltvRatio: 60, maturity: '12 mo', issuer: 'PyME LatAm DAO' },
    // ── Enterprise Tier ──
    { id: 4,  name: 'John Deere 8R Tractor',               sector: 'Agro',      tier: 'Enterprise', valuation: 350000,  maxLoan: 210000,  riskRating: 'AA+', riskScore: 18, apy: 6.8,  depreciation: 7.5,  stylusGasCost: 0.04, solidityGasCost: 48.20, condition: 'Excellent', year: 2025, image: '/assets/johndeere.png',        status: 'available',       auditStatus: 'verified',  ltvRatio: 60, maturity: '24 mo', issuer: 'AgriDAO LatAm' },
    { id: 5,  name: 'Nvidia H100 GPU Cluster (x8)',        sector: 'Tech',      tier: 'Enterprise', valuation: 800000,  maxLoan: 440000,  riskRating: 'A+',  riskScore: 32, apy: 9.8,  depreciation: 18.5, stylusGasCost: 0.06, solidityGasCost: 55.80, condition: 'Excellent', year: 2025, image: '/assets/RAGCPU.png',            status: 'available',       auditStatus: 'in-review', ltvRatio: 55, maturity: '12 mo', issuer: 'TechBridge Inc' },
    { id: 6,  name: 'Vestas Wind Turbine V236',            sector: 'Energy',    tier: 'Enterprise', valuation: 1200000, maxLoan: 780000,  riskRating: 'AAA', riskScore: 8,  apy: 5.2,  depreciation: 3.0,  stylusGasCost: 0.05, solidityGasCost: 52.40, condition: 'New',       year: 2026, image: '/assets/TURBINAEOLICA.png',    status: 'available',       auditStatus: 'verified',  ltvRatio: 65, maturity: '60 mo', issuer: 'GreenVault DAO' },
    { id: 7,  name: 'Netafim Smart Irrigation System',     sector: 'Agro',      tier: 'Enterprise', valuation: 175000,  maxLoan: 105000,  riskRating: 'AAA', riskScore: 12, apy: 5.9,  depreciation: 4.2,  stylusGasCost: 0.03, solidityGasCost: 42.10, condition: 'New',       year: 2026, image: '/assets/Riego.png',             status: 'available',       auditStatus: 'verified',  ltvRatio: 60, maturity: '36 mo', issuer: 'AgriDAO LatAm' },
    { id: 8,  name: 'Case IH 9250 Combine Harvester',     sector: 'Agro',      tier: 'Enterprise', valuation: 520000,  maxLoan: 312000,  riskRating: 'AA',  riskScore: 22, apy: 7.4,  depreciation: 9.8,  stylusGasCost: 0.05, solidityGasCost: 51.30, condition: 'Good',      year: 2024, image: '/assets/cosechadora.png',      status: 'collateralized',  auditStatus: 'verified',  ltvRatio: 60, maturity: '18 mo', issuer: 'AgriDAO LatAm' },
    { id: 9,  name: 'Dell PowerEdge R760 Rack',            sector: 'Tech',      tier: 'Enterprise', valuation: 128000,  maxLoan: 70400,   riskRating: 'A',   riskScore: 28, apy: 8.2,  depreciation: 15.0, stylusGasCost: 0.04, solidityGasCost: 46.50, condition: 'Good',      year: 2024, image: '/assets/RAGCPU.png',            status: 'available',       auditStatus: 'verified',  ltvRatio: 55, maturity: '12 mo', issuer: 'TechBridge Inc' },
    { id: 10, name: 'SunPower Industrial Array (1.2MW)',   sector: 'Energy',    tier: 'Enterprise', valuation: 680000,  maxLoan: 442000,  riskRating: 'AAA', riskScore: 10, apy: 5.5,  depreciation: 2.8,  stylusGasCost: 0.03, solidityGasCost: 44.80, condition: 'New',       year: 2026, image: '/assets/solar.png',             status: 'available',       auditStatus: 'verified',  ltvRatio: 65, maturity: '60 mo', issuer: 'GreenVault DAO' },
    { id: 11, name: 'Caterpillar 330 GC Excavator',       sector: 'Heavy',     tier: 'Enterprise', valuation: 410000,  maxLoan: 246000,  riskRating: 'AA',  riskScore: 24, apy: 7.6,  depreciation: 8.5,  stylusGasCost: 0.05, solidityGasCost: 50.10, condition: 'Good',      year: 2024, image: '/assets/excavadora.png',       status: 'available',       auditStatus: 'verified',  ltvRatio: 60, maturity: '18 mo', issuer: 'InfraBuild DAO' },
    { id: 12, name: 'Volvo FH16 Fleet (x5 Units)',        sector: 'Logistics', tier: 'Enterprise', valuation: 875000,  maxLoan: 525000,  riskRating: 'AA+', riskScore: 20, apy: 7.0,  depreciation: 12.0, stylusGasCost: 0.05, solidityGasCost: 53.60, condition: 'Excellent', year: 2025, image: '/assets/volvo.png',             status: 'available',       auditStatus: 'verified',  ltvRatio: 60, maturity: '24 mo', issuer: 'LogiChain DAO' },
    { id: 13, name: 'BYD Electric Delivery Fleet (x12)',   sector: 'Logistics', tier: 'Enterprise', valuation: 540000,  maxLoan: 324000,  riskRating: 'AA',  riskScore: 22, apy: 7.1,  depreciation: 13.0, stylusGasCost: 0.04, solidityGasCost: 48.90, condition: 'New',       year: 2026, image: '/assets/byd.png',               status: 'available',       auditStatus: 'verified',  ltvRatio: 60, maturity: '24 mo', issuer: 'LogiChain DAO' },
    { id: 14, name: 'Komatsu 930E Mining Truck',          sector: 'Heavy',     tier: 'Enterprise', valuation: 1450000, maxLoan: 870000,  riskRating: 'A',   riskScore: 35, apy: 9.2,  depreciation: 10.5, stylusGasCost: 0.06, solidityGasCost: 56.30, condition: 'Fair',      year: 2022, image: '/assets/komatsu.png',           status: 'pending',         auditStatus: 'pending',   ltvRatio: 60, maturity: '18 mo', issuer: 'MineDAO' },
    { id: 15, name: 'Siemens MRI Magnetom Vida',          sector: 'Health',    tier: 'Enterprise', valuation: 1850000, maxLoan: 1110000, riskRating: 'AAA', riskScore: 9,  apy: 5.0,  depreciation: 7.5,  stylusGasCost: 0.04, solidityGasCost: 47.80, condition: 'Excellent', year: 2025, image: '/assets/MRI.png',               status: 'collateralized',  auditStatus: 'verified',  ltvRatio: 60, maturity: '48 mo', issuer: 'MedChain DAO' },
];

const SECTORS: Sector[] = ['All', 'Agro', 'Tech', 'Energy', 'Heavy', 'Retail', 'Logistics', 'Health'];
const TIERS: Tier[] = ['All', 'SME', 'Enterprise'];

const SECTOR_ICONS: Record<string, React.ReactNode> = {
    Agro: <Wheat size={14} />, Tech: <Cpu size={14} />, Energy: <Zap size={14} />,
    Heavy: <HardHat size={14} />, Retail: <ShoppingBag size={14} />, Logistics: <Container size={14} />, Health: <Shield size={14} />,
};

const SECTOR_COLORS: Record<string, string> = {
    Agro: '#22C55E', Tech: '#3B82F6', Energy: '#F59E0B', Heavy: '#EF4444', Retail: '#A855F7', Logistics: '#06B6D4', Health: '#EC4899',
};

const TIER_CONFIG: Record<Exclude<Tier, 'All'>, { icon: React.ReactNode; label: string; desc: string; color: string; bg: string; border: string }> = {
    SME:        { icon: <Store size={16} />,    label: 'PyME / SME',    desc: 'Small businesses, $1K-$50K assets',     color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30' },
    Enterprise: { icon: <Landmark size={16} />, label: 'Enterprise',    desc: 'Large-scale industrial, $100K-$2M+',    color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
};

const RATING_COLORS: Record<string, string> = {
    'AAA': '#22C55E', 'AA+': '#34D399', 'AA': '#4ADE80', 'A+': '#3B82F6', 'A': '#60A5FA', 'BBB': '#F59E0B', 'BB+': '#FB923C', 'B+': '#EF4444',
};

//  UTILITY HELPERS 
function fmt(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toFixed(2)}`;
}

function fmtFull(n: number): string {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function riskColor(score: number): string {
    if (score <= 15) return '#22C55E';
    if (score <= 25) return '#4ADE80';
    if (score <= 32) return '#F59E0B';
    return '#EF4444';
}

function auditBadge(status: AuditStatus) {
    const m = {
        verified:    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle2 size={10} />, label: 'Verified' },
        pending:     { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   icon: <Clock size={10} />,        label: 'Pending' },
        'in-review': { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    icon: <FileCode2 size={10} />,    label: 'In Review' },
    };
    const s = m[status];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${s.bg} ${s.border} ${s.text}`}>
            {s.icon} {s.label}
        </span>
    );
}

function statusDot(status: InstitutionalAsset['status']) {
    const m = {
        available: { color: 'bg-emerald-400', label: 'Available' },
        collateralized: { color: 'bg-blue-400', label: 'Active Loan' },
        pending: { color: 'bg-amber-400', label: 'Under Review' },
    };
    const s = m[status];
    return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />{s.label}
        </span>
    );
}

function generateStylusFeed(): { time: string; msg: string; type: 'ok' | 'info' | 'warn' }[] {
    const now = new Date();
    return INSTITUTIONAL_ASSETS.slice(0, 10).map((a, i) => {
        const t = new Date(now.getTime() - i * 3800);
        const ts = `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}:${t.getSeconds().toString().padStart(2,'0')}`;
        const msgs = [
            { msg: `stylus::engine - Asset #${a.id.toString().padStart(2,'0')} (${a.riskRating}) depreciation curve computed -> ${a.depreciation}%/yr [${(Math.random()*0.03+0.01).toFixed(3)}s]`, type: 'ok' as const },
            { msg: `stylus::risk - Collateral ratio for "${a.name.split(' ').slice(0,3).join(' ')}" -> LTV ${a.ltvRatio}% | Gas saved: $${(a.solidityGasCost - a.stylusGasCost).toFixed(2)}`, type: 'info' as const },
            { msg: `wasm::valuation - Rating ${a.riskRating} confirmed | Score: ${a.riskScore}/100 | Audit: ${a.auditStatus}`, type: a.riskScore > 30 ? 'warn' as const : 'info' as const },
        ];
        return { time: ts, ...msgs[i % 3] };
    });
}

//  DASHBOARD OVERVIEW 
function DashboardOverview({ onGoToMarket }: { onGoToMarket: () => void }) {
    const totalVal = INSTITUTIONAL_ASSETS.reduce((s, a) => s + a.valuation, 0);
    const totalLoaned = INSTITUTIONAL_ASSETS.filter(a => a.status === 'collateralized').reduce((s, a) => s + a.maxLoan, 0);
    const avgApy = (INSTITUTIONAL_ASSETS.reduce((s, a) => s + a.apy, 0) / INSTITUTIONAL_ASSETS.length).toFixed(1);
    const totalGasSaved = INSTITUTIONAL_ASSETS.reduce((s, a) => s + (a.solidityGasCost - a.stylusGasCost), 0);
    const verifiedCount = INSTITUTIONAL_ASSETS.filter(a => a.auditStatus === 'verified').length;

    const topAssets = [...INSTITUTIONAL_ASSETS].sort((a, b) => b.valuation - a.valuation).slice(0, 5);

    return (
        <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Value Locked', value: fmt(totalVal), sub: `${INSTITUTIONAL_ASSETS.length} assets`, icon: <Layers size={18} />, color: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
                    { label: 'Active Loans', value: fmt(totalLoaned), sub: `${INSTITUTIONAL_ASSETS.filter(a => a.status === 'collateralized').length} positions`, icon: <Banknote size={18} />, color: 'text-blue-400', iconBg: 'bg-blue-500/10' },
                    { label: 'Gas Saved (Stylus)', value: `$${totalGasSaved.toFixed(0)}`, sub: 'vs Solidity baseline', icon: <Fuel size={18} />, color: 'text-amber-400', iconBg: 'bg-amber-500/10' },
                    { label: 'Avg Protocol APY', value: `${avgApy}%`, sub: `${verifiedCount}/${INSTITUTIONAL_ASSETS.length} audited`, icon: <TrendingUp size={18} />, color: 'text-purple-400', iconBg: 'bg-purple-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4 hover:border-slate-700/60 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-9 h-9 rounded-lg ${kpi.iconBg} flex items-center justify-center ${kpi.color}`}>{kpi.icon}</div>
                            <ArrowUpRight size={14} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
                        </div>
                        <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{kpi.label}</p>
                        <p className="text-[10px] text-slate-600 font-mono mt-1">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                {/* Top Assets */}
                <div className="lg:col-span-3 bg-slate-900/40 rounded-xl border border-slate-800/50 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/40">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                            <TrendingUp size={15} className="text-emerald-400" /> Top Assets by Valuation
                        </h3>
                        <button onClick={onGoToMarket} className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                            View All <ChevronRight size={12} />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-800/30">
                        {topAssets.map((a, i) => (
                            <div key={a.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/20 transition-colors">
                                <span className="text-xs font-mono text-slate-600 w-5">{i + 1}</span>
                                <img src={a.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-800/40" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-200 font-medium truncate">{a.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-mono" style={{ color: SECTOR_COLORS[a.sector] }}>{a.sector}</span>
                                        <span className="text-slate-800">.</span>
                                        {statusDot(a.status)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold font-mono text-white">{fmtFull(a.valuation)}</p>
                                    <span className="text-[10px] font-mono font-bold" style={{ color: RATING_COLORS[a.riskRating] }}>{a.riskRating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Protocol Health */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-5">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
                            <Shield size={15} className="text-blue-400" /> Protocol Health
                        </h3>
                        <div className="text-center mb-4">
                            <p className="text-4xl font-black font-mono text-white">
                                {totalVal > 0 ? Math.round(((totalVal - totalLoaned) / totalVal) * 100) : 100}%
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">Over-collateralization Ratio</p>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }} />
                            <div className="h-full bg-amber-500" style={{ width: '20%' }} />
                            <div className="h-full bg-red-500" style={{ width: '10%' }} />
                        </div>
                        <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-600">
                            <span>Healthy</span><span>Watch</span><span>Risk</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-5">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                            <Fuel size={15} className="text-amber-400" /> Stylus Gas Impact
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                <p className="text-[10px] font-mono text-slate-500 mb-1">Solidity Avg</p>
                                <p className="text-lg font-bold font-mono text-red-400">$49.60</p>
                                <p className="text-[9px] text-slate-600">per tx</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-[10px] font-mono text-slate-500 mb-1">Stylus (Rust)</p>
                                <p className="text-lg font-bold font-mono text-emerald-400">$0.04</p>
                                <p className="text-[9px] text-slate-600">per tx</p>
                            </div>
                        </div>
                        <div className="mt-3 text-center">
                            <span className="text-[11px] font-mono text-emerald-400">99.9% cost reduction</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-5">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                            <Lock size={15} className="text-emerald-400" /> Audit Pipeline
                        </h3>
                        {[
                            { label: 'Verified', count: INSTITUTIONAL_ASSETS.filter(a => a.auditStatus === 'verified').length, color: 'bg-emerald-400' },
                            { label: 'In Review', count: INSTITUTIONAL_ASSETS.filter(a => a.auditStatus === 'in-review').length, color: 'bg-blue-400' },
                            { label: 'Pending', count: INSTITUTIONAL_ASSETS.filter(a => a.auditStatus === 'pending').length, color: 'bg-amber-400' },
                        ].map((row, i) => (
                            <div key={i} className="flex items-center justify-between py-1.5">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${row.color}`} />
                                    <span className="text-xs text-slate-400">{row.label}</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-slate-300">{row.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

//  MARKET SECTION 
function MarketSection({ onSelect }: { onSelect: (a: InstitutionalAsset) => void }) {
    const [search, setSearch] = useState('');
    const [sector, setSector] = useState<Sector>('All');
    const [tier, setTier] = useState<Tier>('All');

    const filtered = useMemo(() =>
        INSTITUTIONAL_ASSETS.filter(a => {
            const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.issuer.toLowerCase().includes(search.toLowerCase());
            const matchSector = sector === 'All' || a.sector === sector;
            const matchTier = tier === 'All' || a.tier === tier;
            return matchSearch && matchSector && matchTier;
        }),
    [search, sector, tier]);

    const smeCount = INSTITUTIONAL_ASSETS.filter(a => a.tier === 'SME').length;
    const entCount = INSTITUTIONAL_ASSETS.filter(a => a.tier === 'Enterprise').length;

    return (
        <div className="space-y-5">
            {/* ── Tier Segmentation Tabs ── */}
            <div className="grid grid-cols-3 gap-3">
                {TIERS.map(t => {
                    const isActive = tier === t;
                    const count = t === 'All' ? INSTITUTIONAL_ASSETS.length : t === 'SME' ? smeCount : entCount;
                    const cfg = t === 'All'
                        ? { icon: <Layers size={18} />, label: 'All Assets', desc: `${count} total assets`, color: isActive ? 'text-white' : 'text-slate-400', bg: isActive ? 'bg-slate-800/60' : 'bg-slate-900/30', border: isActive ? 'border-slate-600/50' : 'border-slate-800/40' }
                        : { ...TIER_CONFIG[t], icon: TIER_CONFIG[t].icon, bg: isActive ? TIER_CONFIG[t].bg : 'bg-slate-900/30', border: isActive ? TIER_CONFIG[t].border : 'border-slate-800/40', color: isActive ? TIER_CONFIG[t].color : 'text-slate-400' };
                    return (
                        <button key={t} onClick={() => setTier(t)}
                            className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all group hover:border-slate-700/60 ${cfg.bg} ${cfg.border}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? (t === 'All' ? 'bg-white/10' : TIER_CONFIG[t !== 'All' ? t : 'SME'].bg) : 'bg-slate-800/50'} ${cfg.color}`}>
                                {cfg.icon}
                            </div>
                            <div className="text-left min-w-0">
                                <p className={`text-sm font-bold ${cfg.color} transition-colors`}>{t === 'All' ? 'All Assets' : TIER_CONFIG[t].label}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{count} assets{t !== 'All' ? ` — ${TIER_CONFIG[t].desc}` : ''}</p>
                            </div>
                            {isActive && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by asset name or issuer..."
                        className="w-full bg-slate-900/50 border border-slate-800/60 rounded-xl pl-9 pr-9 py-2.5 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500/40 transition-all font-mono"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {SECTORS.map(s => (
                        <button
                            key={s}
                            onClick={() => setSector(s)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                                sector === s
                                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                    : 'bg-slate-900/30 border-slate-800/40 text-slate-500 hover:text-slate-300 hover:border-slate-700/60'
                            }`}
                        >
                            {s !== 'All' && SECTOR_ICONS[s]}{s}
                        </button>
                    ))}
                </div>
            </div>

            <p className="text-[11px] font-mono text-slate-600">
                Showing <span className="text-slate-400">{filtered.length}</span> of {INSTITUTIONAL_ASSETS.length} assets
                {tier !== 'All' && <span> — <span className={tier === 'SME' ? 'text-amber-400' : 'text-blue-400'}>{tier}</span> tier</span>}
            </p>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(asset => (
                    <button
                        key={asset.id}
                        onClick={() => onSelect(asset)}
                        className="group text-left bg-slate-900/40 rounded-xl border border-slate-800/50 overflow-hidden hover:border-slate-700/50 hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-all"
                    >
                        <div className="relative h-36 overflow-hidden bg-slate-800">
                            <img src={asset.image} alt={asset.name} className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                            <div className="absolute top-2 left-2">{auditBadge(asset.auditStatus)}</div>
                            <div className="absolute top-2 right-2">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/60" style={{ color: RATING_COLORS[asset.riskRating] }}>
                                    {asset.riskRating}
                                </span>
                            </div>
                            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] font-mono text-slate-300 bg-black/50 rounded px-1.5 py-0.5">
                                <span style={{ color: SECTOR_COLORS[asset.sector] }}>{SECTOR_ICONS[asset.sector]}</span>
                                {asset.sector}
                            </div>
                            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${asset.tier === 'SME' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                                    {asset.tier}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono text-slate-400">#{asset.id.toString().padStart(3, '0')}</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-slate-200 mb-0.5 group-hover:text-white transition-colors truncate">{asset.name}</h3>
                            <p className="text-[10px] text-slate-500 font-mono mb-3">{asset.issuer} - {asset.maturity}</p>
                            <div className="flex items-end justify-between mb-3">
                                <div>
                                    <p className="text-[9px] text-slate-600 uppercase tracking-wider">Valuation</p>
                                    <p className="text-lg font-bold font-mono text-white">{fmtFull(asset.valuation)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-600 uppercase tracking-wider">Max Loan</p>
                                    <p className="text-sm font-bold font-mono text-blue-400">{fmtFull(asset.maxLoan)}</p>
                                </div>
                            </div>
                            <div className="h-1 rounded-full bg-slate-800 overflow-hidden mb-3">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${100 - asset.riskScore}%`, background: riskColor(asset.riskScore) }} />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                                <span>APY <span className="text-emerald-400">{asset.apy}%</span></span>
                                <span>Gas: <span className="text-emerald-400">${asset.stylusGasCost}</span></span>
                                <span className="flex items-center gap-1 text-slate-400 group-hover:text-blue-400 transition-colors">
                                    Details <ChevronRight size={10} />
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16">
                    <Search size={32} className="mx-auto text-slate-700 mb-3" />
                    <p className="text-slate-500 text-sm">No assets match your search.</p>
                </div>
            )}
        </div>
    );
}

//  TOAST NOTIFICATION 
function Toast({ message, type, onClose }: { message: string; type: 'error' | 'success' | 'info'; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 8000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const colors = {
        error: 'bg-red-500/10 border-red-500/30 text-red-400',
        success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    };
    return (
        <div className={`fixed top-20 right-4 z-[60] max-w-md rounded-xl border p-4 shadow-2xl backdrop-blur-xl ${colors[type]}`} style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {type === 'error' ? <XCircle size={16} /> : type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold mb-1">{type === 'error' ? 'Transaction Failed' : type === 'success' ? 'Success' : 'Info'}</p>
                    <p className="text-[11px] font-mono opacity-80 break-all leading-relaxed">{message}</p>
                </div>
                <button onClick={onClose} className="flex-shrink-0 opacity-50 hover:opacity-100"><X size={14} /></button>
            </div>
        </div>
    );
}

//  ASSET DETAIL MODAL 
function AssetModal({
    asset, onClose, onMint, onApprove, onBorrow,
    mintStep, approveStep, borrowStep, isBusy, txHash, approveHash, mintHash,
}: {
    asset: InstitutionalAsset; onClose: () => void;
    onMint: (a: InstitutionalAsset) => void;
    onApprove: (a: InstitutionalAsset) => void;
    onBorrow: (a: InstitutionalAsset) => void;
    mintStep: 'idle' | 'pending' | 'confirming' | 'done' | 'error';
    approveStep: 'idle' | 'pending' | 'confirming' | 'done' | 'error';
    borrowStep: 'idle' | 'pending' | 'confirming' | 'done' | 'error';
    isBusy: boolean; txHash?: string; approveHash?: string; mintHash?: string;
}) {
    const [tab, setTab] = useState<ModalTab>('overview');
    const gasSaved = (asset.solidityGasCost - asset.stylusGasCost).toFixed(2);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-[#0A101F] border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                {/* Header */}
                <div className="relative h-40 overflow-hidden flex-shrink-0">
                    <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A101F] via-[#0A101F]/50 to-transparent" />
                    <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 text-slate-300 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                    <div className="absolute bottom-3 left-4 right-4">
                        <div className="flex items-center gap-2 mb-1">
                            {auditBadge(asset.auditStatus)}
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/50" style={{ color: RATING_COLORS[asset.riskRating] }}>
                                {asset.riskRating}
                            </span>
                            {statusDot(asset.status)}
                        </div>
                        <h2 className="text-lg font-bold text-white">{asset.name}</h2>
                        <p className="text-[11px] text-slate-400 font-mono">{asset.issuer} - {asset.sector} - {asset.maturity} maturity</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800/40 px-4 flex-shrink-0">
                    {([['overview', 'Overview'], ['contract-logic', 'Contract Logic'], ['history', 'Tx History']] as [ModalTab, string][]).map(([id, label]) => {
                        const tabIcon = id === 'contract-logic' ? <ScrollText size={12} className="mr-1" /> : id === 'history' ? <Activity size={12} className="mr-1" /> : null;
                        return (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            className={`flex items-center px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                                tab === id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {tabIcon}{label}
                        </button>
                    );
                    })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {tab === 'overview' && (
                        <>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Valuation', value: fmtFull(asset.valuation), color: 'text-white' },
                                    { label: 'Max Loan', value: fmtFull(asset.maxLoan), color: 'text-blue-400' },
                                    { label: 'LTV Ratio', value: `${asset.ltvRatio}%`, color: 'text-emerald-400' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/40">
                                        <p className="text-[10px] font-mono uppercase text-slate-500 mb-1">{s.label}</p>
                                        <p className={`text-base font-bold font-mono ${s.color}`}>{s.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-center">
                                {[
                                    { label: 'Risk', value: `${asset.riskScore}/100`, color: riskColor(asset.riskScore) },
                                    { label: 'APY', value: `${asset.apy}%`, color: '#22C55E' },
                                    { label: 'Depr.', value: `${asset.depreciation}%/yr`, color: '#F59E0B' },
                                    { label: 'Year', value: asset.year.toString(), color: '#94A3B8' },
                                ].map((d, i) => (
                                    <div key={i} className="py-2">
                                        <p className="text-[9px] font-mono uppercase text-slate-600">{d.label}</p>
                                        <p className="text-sm font-bold font-mono" style={{ color: d.color }}>{d.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                    <Zap size={16} className="text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-blue-300">Stylus WASM Engine</p>
                                    <p className="text-[10px] text-blue-400/60 font-mono">Gas saved: <span className="text-emerald-400 font-bold">${gasSaved}</span> per valuation tx</p>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                                </span>
                            </div>
                        </>
                    )}

                    {tab === 'contract-logic' && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <XCircle size={14} className="text-red-400" />
                                        <span className="text-xs font-bold text-red-400">Legacy Solidity</span>
                                    </div>
                                    <div className="font-mono text-[11px] text-slate-400 space-y-1.5 bg-slate-900/50 rounded-lg p-3 border border-slate-800/30">
                                        <p><span className="text-slate-600">// EVM - Expensive loops</span></p>
                                        <p><span className="text-purple-400">function</span> <span className="text-yellow-300">calcValue</span>() {'{'}</p>
                                        <p>  <span className="text-purple-400">uint</span> dep = age * rate;</p>
                                        <p>  <span className="text-slate-600">// No complex math</span></p>
                                        <p>  <span className="text-purple-400">return</span> value - dep;</p>
                                        <p>{'}'}</p>
                                    </div>
                                    <div className="mt-3 text-center">
                                        <p className="text-xl font-bold font-mono text-red-400">${asset.solidityGasCost.toFixed(2)}</p>
                                        <p className="text-[10px] text-slate-500">gas per tx</p>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-400">Stylus (Rust/WASM)</span>
                                    </div>
                                    <div className="font-mono text-[11px] text-slate-400 space-y-1.5 bg-slate-900/50 rounded-lg p-3 border border-slate-800/30">
                                        <p><span className="text-slate-600">// WASM - Full math</span></p>
                                        <p><span className="text-purple-400">fn</span> <span className="text-yellow-300">calc_risk</span>(&self) {'{'}</p>
                                        <p>  <span className="text-purple-400">let</span> curve = self.<span className="text-cyan-300">depreciation</span>();</p>
                                        <p>  <span className="text-purple-400">let</span> score = self.<span className="text-cyan-300">risk_model</span>();</p>
                                        <p>  Ok(val - curve + score)</p>
                                        <p>{'}'}</p>
                                    </div>
                                    <div className="mt-3 text-center">
                                        <p className="text-xl font-bold font-mono text-emerald-400">${asset.stylusGasCost.toFixed(2)}</p>
                                        <p className="text-[10px] text-slate-500">gas per tx</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border border-emerald-500/10 text-center">
                                <p className="text-[11px] text-slate-400 mb-1">Gas Saved via Stylus on this Asset</p>
                                <p className="text-3xl font-black font-mono text-emerald-400">${gasSaved}</p>
                                <p className="text-[10px] text-slate-500 font-mono mt-1">
                                    {((1 - asset.stylusGasCost / asset.solidityGasCost) * 100).toFixed(1)}% reduction - Per valuation tx - Arbitrum Sepolia
                                </p>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/40">
                                <Lock size={16} className="text-slate-400 flex-shrink-0" />
                                <div className="flex-1 text-xs text-slate-400">
                                    This contract valuation logic is deterministic and verifiable, a requirement for the <span className="text-blue-400">Arbitrum Audit Program</span>.
                                </div>
                                {auditBadge(asset.auditStatus)}
                            </div>
                        </>
                    )}

                    {tab === 'history' && (
                        <div className="space-y-2 font-mono text-xs">
                            {[
                                { time: '14:22:08', action: `Valuation computed -> ${fmtFull(asset.valuation)}`, type: 'ok' },
                                { time: '14:22:07', action: `Risk model executed -> Score: ${asset.riskScore}/100 (${asset.riskRating})`, type: 'ok' },
                                { time: '14:22:06', action: `Depreciation curve: ${asset.depreciation}%/yr applied`, type: 'info' },
                                { time: '14:22:05', action: `LTV set -> ${asset.ltvRatio}% | Max loan: ${fmtFull(asset.maxLoan)}`, type: 'info' },
                                { time: '14:22:04', action: `WASM gas metered: $${asset.stylusGasCost} (saved $${gasSaved} vs Solidity)`, type: 'ok' },
                                { time: '14:22:03', action: 'Oracle price feed integrated (Chainlink)', type: 'info' },
                                { time: '14:22:02', action: `NFT metadata verified for Asset #${asset.id.toString().padStart(3, '0')}`, type: 'ok' },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-3 py-1.5 border-b border-slate-800/20">
                                    <span className="text-slate-600 flex-shrink-0">{log.time}</span>
                                    <span className={log.type === 'ok' ? 'text-emerald-400/80' : 'text-slate-400/80'}>{log.action}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Footer — Separated Debug Flow */}
                <div className="p-4 border-t border-slate-800/40 flex-shrink-0 space-y-3">
                    {asset.status !== 'available' ? (
                        <div className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 text-sm font-bold text-center">
                            {asset.status === 'collateralized' ? 'Already Collateralized' : 'Pending Review'}
                        </div>
                    ) : (
                        <>
                            {/* Step 0: Mint NFT (Testnet Debug) */}
                            <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400 text-[10px] font-bold">0</span>
                                        <span className="text-[11px] font-medium text-amber-400">Debug: Mint This NFT</span>
                                        <span className="text-[9px] font-mono text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded">Testnet Only</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mb-2">Mint token #{asset.id} to your wallet so you own it before borrowing.</p>
                                <button
                                    onClick={() => onMint(asset)}
                                    disabled={mintStep === 'pending' || mintStep === 'confirming' || mintStep === 'done'}
                                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                                        mintStep === 'done'
                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                            : mintStep === 'pending' || mintStep === 'confirming'
                                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 cursor-wait'
                                                : mintStep === 'error'
                                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                                    }`}
                                >
                                    {mintStep === 'done' ? `Minted Token #${asset.id}` : mintStep === 'pending' ? 'Confirm in Wallet...' : mintStep === 'confirming' ? 'Minting...' : mintStep === 'error' ? 'Retry Mint' : `Mint NFT #${asset.id}`}
                                </button>
                                {mintHash && (
                                    <a href={`https://sepolia.arbiscan.io/tx/${mintHash}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-1 mt-1.5 text-[10px] font-mono text-blue-400 hover:text-blue-300">
                                        View mint tx <ExternalLink size={9} />
                                    </a>
                                )}
                            </div>

                            {/* Step 1: Approve */}
                            <button
                                onClick={() => onApprove(asset)}
                                disabled={approveStep === 'pending' || approveStep === 'confirming' || approveStep === 'done' || borrowStep === 'done'}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                    approveStep === 'done' || borrowStep !== 'idle'
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                        : approveStep === 'pending' || approveStep === 'confirming'
                                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20 cursor-wait'
                                            : approveStep === 'error'
                                                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15'
                                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50'
                                }`}
                            >
                                <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-bold">1</span>
                                {approveStep === 'done' || borrowStep !== 'idle' ? 'NFT Approved' : approveStep === 'pending' ? 'Confirm in Wallet...' : approveStep === 'confirming' ? 'Approving...' : approveStep === 'error' ? 'Retry Approve' : 'Approve NFT Transfer'}
                            </button>
                            {approveHash && (
                                <a href={`https://sepolia.arbiscan.io/tx/${approveHash}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1 text-[10px] font-mono text-blue-400 hover:text-blue-300">
                                    View approve tx <ExternalLink size={9} />
                                </a>
                            )}

                            {/* Step 2: Deposit & Borrow */}
                            <button
                                onClick={() => onBorrow(asset)}
                                disabled={approveStep !== 'done' || borrowStep === 'pending' || borrowStep === 'confirming' || borrowStep === 'done'}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                    borrowStep === 'done'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : borrowStep === 'pending' || borrowStep === 'confirming'
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20 cursor-wait'
                                            : borrowStep === 'error'
                                                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15'
                                                : approveStep === 'done'
                                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                    : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800/40'
                                }`}
                            >
                                <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-bold">2</span>
                                {borrowStep === 'done' ? `Loan Disbursed — ${fmtFull(asset.maxLoan)}`
                                    : borrowStep === 'pending' ? 'Confirm in Wallet...'
                                    : borrowStep === 'confirming' ? 'Computing Risk (Stylus/Rust)...'
                                    : borrowStep === 'error' ? 'Retry Borrow'
                                    : `Deposit & Borrow ${fmtFull(asset.maxLoan)}`}
                            </button>
                        </>
                    )}
                    {txHash && (
                        <a href={`https://sepolia.arbiscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors">
                            View borrow tx on Arbiscan <ExternalLink size={10} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

//  RISK ENGINE SECTION 
function RiskEngineSection() {
    const [feedLogs] = useState(generateStylusFeed);
    const totalVal = INSTITUTIONAL_ASSETS.reduce((s, a) => s + a.valuation, 0);
    const catBreakdown = SECTORS.filter(c => c !== 'All').map(cat => {
        const items = INSTITUTIONAL_ASSETS.filter(a => a.sector === cat);
        const val = items.reduce((s, a) => s + a.valuation, 0);
        return { sector: cat, value: val, count: items.length, pct: totalVal > 0 ? (val / totalVal) * 100 : 0 };
    }).sort((a, b) => b.value - a.value);
    const maxVal = Math.max(...catBreakdown.map(c => c.value));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-white">Risk Engine</h2>
                    <p className="text-xs text-slate-500 font-mono">Stylus WASM v1.0 - Real-time collateral analytics</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <Activity size={13} className="text-emerald-400" />
                    <span className="text-[11px] font-mono text-emerald-400">Streaming</span>
                </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-5">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
                    <BarChart3 size={15} className="text-purple-400" /> Collateral Distribution by Sector
                </h3>
                <div className="space-y-3">
                    {catBreakdown.map(cat => (
                        <div key={cat.sector}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span style={{ color: SECTOR_COLORS[cat.sector] }}>{SECTOR_ICONS[cat.sector]}</span>
                                    <span className="text-xs text-slate-300">{cat.sector}</span>
                                    <span className="text-[10px] font-mono text-slate-600">({cat.count})</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold font-mono text-white">{fmtFull(cat.value)}</span>
                                    <span className="text-[10px] font-mono text-slate-500 w-12 text-right">{cat.pct.toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${maxVal > 0 ? (cat.value / maxVal) * 100 : 0}%`, background: SECTOR_COLORS[cat.sector], opacity: 0.7 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-800/40">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <AlertTriangle size={15} className="text-amber-400" /> Per-Asset Risk Matrix
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-mono uppercase text-slate-600 border-b border-slate-800/40">
                                <th className="py-2.5 px-4">ID</th><th className="py-2.5 pr-3">Asset</th><th className="py-2.5 pr-3">Rating</th>
                                <th className="py-2.5 pr-3 text-right">Value</th><th className="py-2.5 pr-3 text-right">Score</th>
                                <th className="py-2.5 pr-3 text-right">Gas Saved</th><th className="py-2.5 pr-4 text-right">Audit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {INSTITUTIONAL_ASSETS.map(a => (
                                <tr key={a.id} className="border-b border-slate-800/20 hover:bg-slate-800/20 transition-colors">
                                    <td className="py-2.5 px-4 text-xs font-mono text-slate-500">#{a.id.toString().padStart(3, '0')}</td>
                                    <td className="py-2.5 pr-3 text-xs text-slate-300 max-w-[200px] truncate">{a.name}</td>
                                    <td className="py-2.5 pr-3 text-xs font-mono font-bold" style={{ color: RATING_COLORS[a.riskRating] }}>{a.riskRating}</td>
                                    <td className="py-2.5 pr-3 text-xs font-mono text-white text-right">{fmt(a.valuation)}</td>
                                    <td className="py-2.5 pr-3 text-right"><span className="text-xs font-bold font-mono" style={{ color: riskColor(a.riskScore) }}>{a.riskScore}</span></td>
                                    <td className="py-2.5 pr-3 text-xs font-mono text-emerald-400 text-right">${(a.solidityGasCost - a.stylusGasCost).toFixed(2)}</td>
                                    <td className="py-2.5 pr-4 text-right">{auditBadge(a.auditStatus)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/40">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Terminal size={15} className="text-emerald-400" /> Stylus Live Feed
                    </h3>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Streaming
                    </span>
                </div>
                <div className="max-h-56 overflow-y-auto p-4 font-mono text-[11px] space-y-1.5">
                    {feedLogs.map((log, i) => (
                        <div key={i} className="flex gap-3">
                            <span className="text-slate-600 flex-shrink-0">{log.time}</span>
                            <span className={log.type === 'ok' ? 'text-emerald-400/80' : log.type === 'warn' ? 'text-amber-400/80' : 'text-slate-400/80'}>
                                {log.msg}
                            </span>
                        </div>
                    ))}
                    <div className="flex gap-3 text-slate-600 animate-pulse"><span>--:--:--</span><span>Awaiting next block...</span></div>
                </div>
            </div>
        </div>
    );
}

//  GOVERNANCE SECTION 
function GovernanceSection() {
    const proposals = [
        { id: 'CXP-001', title: 'Increase LTV cap for Energy sector to 70%', status: 'Active', votes: { for: 842, against: 156 }, date: 'Feb 10, 2026' },
        { id: 'CXP-002', title: 'Onboard Lithium Mining assets to protocol', status: 'Active', votes: { for: 621, against: 289 }, date: 'Feb 08, 2026' },
        { id: 'CXP-003', title: 'Deploy Stylus v2 with multi-curve depreciation', status: 'Passed', votes: { for: 1204, against: 87 }, date: 'Feb 01, 2026' },
        { id: 'CXP-004', title: 'Apply for Arbitrum DAO Grant Phase 2', status: 'Passed', votes: { for: 1580, against: 42 }, date: 'Jan 25, 2026' },
        { id: 'CXP-005', title: 'Integrate Chainlink CCIP for cross-chain collateral', status: 'Discussion', votes: { for: 0, against: 0 }, date: 'Feb 13, 2026' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Landmark size={20} className="text-purple-400" /> Governance
                </h2>
                <p className="text-xs text-slate-500 font-mono">CX DAO - On-chain proposals and protocol direction</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Active Proposals', value: proposals.filter(p => p.status === 'Active').length.toString(), color: 'text-blue-400' },
                    { label: 'Total Voters', value: '2,467', color: 'text-purple-400' },
                    { label: 'Treasury', value: '$1.2M', color: 'text-emerald-400' },
                ].map((s, i) => (
                    <div key={i} className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4 text-center">
                        <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                {proposals.map(p => {
                    const total = p.votes.for + p.votes.against;
                    const forPct = total > 0 ? (p.votes.for / total) * 100 : 50;
                    return (
                        <div key={p.id} className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4 hover:border-slate-700/60 transition-colors">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-mono text-slate-500">{p.id}</span>
                                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                                            p.status === 'Active' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                            : p.status === 'Passed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : 'bg-slate-800 border-slate-700 text-slate-400'
                                        }`}>{p.status}</span>
                                    </div>
                                    <p className="text-sm text-slate-200 font-medium">{p.title}</p>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1">{p.date}</p>
                                </div>
                            </div>
                            {total > 0 && (
                                <div>
                                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
                                        <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${forPct}%` }} />
                                        <div className="h-full bg-red-500 rounded-r-full" style={{ width: `${100 - forPct}%` }} />
                                    </div>
                                    <div className="flex justify-between mt-1.5 text-[10px] font-mono">
                                        <span className="text-emerald-400">For: {p.votes.for} ({forPct.toFixed(0)}%)</span>
                                        <span className="text-red-400">Against: {p.votes.against}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

//  SETTINGS SECTION (with Faucet) 
function SettingsSection() {
    const { address } = useAccount();
    const [testnet, setTestnet] = useState(true);
    const [debugLogs, setDebugLogs] = useState(false);
    const [currency, setCurrency] = useState<'USDC' | 'ETH'>('USDC');
    const [cleared, setCleared] = useState(false);

    const { data: faucetHash, writeContract: writeFaucet, isPending: faucetPending } = useWriteContract();
    const { isLoading: faucetLoading, isSuccess: faucetSuccess } = useWaitForTransactionReceipt({ hash: faucetHash });

    const handleMint = useCallback(() => {
        if (!address) return;
        writeFaucet({
            address: MOCK_USDC_ADDRESS,
            abi: MOCK_USDC_ABI,
            functionName: 'mint',
            args: [address, BigInt(100_000) * BigInt(10 ** 6)],
        });
    }, [address, writeFaucet]);

    const isFaucetBusy = faucetPending || faucetLoading;

    const Toggle = ({ on, onToggle, label, desc }: { on: boolean; onToggle: () => void; label: string; desc: string }) => (
        <div className="flex items-center justify-between py-4 border-b border-slate-800/30">
            <div>
                <p className="text-sm font-medium text-slate-200">{label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
            </div>
            <button onClick={onToggle} className="flex-shrink-0">
                {on ? <ToggleRight size={32} className="text-blue-500" /> : <ToggleLeft size={32} className="text-slate-600" />}
            </button>
        </div>
    );

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h2 className="text-lg font-bold text-white">Settings</h2>
                <p className="text-xs text-slate-500 font-mono">Protocol configuration and sandbox tools</p>
            </div>

            <div className="bg-gradient-to-r from-blue-500/5 to-emerald-500/5 rounded-xl border border-blue-500/15 p-5">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <CircleDollarSign size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Institutional Sandbox Faucet</h3>
                        <p className="text-[11px] text-slate-400 font-mono">Mint 100,000 USDC (Testnet) to your wallet</p>
                    </div>
                </div>
                <button
                    onClick={handleMint}
                    disabled={isFaucetBusy || faucetSuccess || !address}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                        faucetSuccess
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : isFaucetBusy
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20 cursor-wait'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/15'
                    }`}
                >
                    {faucetSuccess ? 'Done - 100,000 USDC Minted' : isFaucetBusy ? 'Minting...' : 'Mint 100K USDC'}
                </button>
                {faucetHash && (
                    <a href={`https://sepolia.arbiscan.io/tx/${faucetHash}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 mt-2 text-[11px] font-mono text-blue-400 hover:text-blue-300">
                        View tx <ExternalLink size={10} />
                    </a>
                )}
            </div>

            <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <Zap size={15} className="text-blue-400" /> Protocol
                </h3>
                <Toggle on={testnet} onToggle={() => setTestnet(!testnet)} label="Testnet Mode" desc="Use Arbitrum Sepolia for all transactions." />
                <Toggle on={debugLogs} onToggle={() => setDebugLogs(!debugLogs)} label="Stylus Debug Logs" desc="Show verbose WASM execution logs in the Risk Engine feed." />
                <div className="flex items-center justify-between py-4 border-b border-slate-800/30">
                    <div>
                        <p className="text-sm font-medium text-slate-200">Currency Display</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">How values are shown across the dashboard.</p>
                    </div>
                    <div className="flex rounded-lg overflow-hidden border border-slate-700/50">
                        {(['USDC', 'ETH'] as const).map(c => (
                            <button key={c} onClick={() => setCurrency(c)}
                                className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors ${currency === c ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'}`}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {debugLogs && (
                <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800/40">
                        <Terminal size={13} className="text-emerald-400" /><span className="text-xs font-mono text-slate-400">Debug Console</span>
                    </div>
                    <div className="p-4 font-mono text-[11px] space-y-1 text-slate-500 max-h-40 overflow-y-auto">
                        <p><span className="text-emerald-400">[OK]</span> stylus_sdk::runtime initialized</p>
                        <p><span className="text-emerald-400">[OK]</span> wasm32-unknown-unknown target loaded</p>
                        <p><span className="text-blue-400">[INFO]</span> ValuationEngine: {INSTITUTIONAL_ASSETS.length} assets registered</p>
                        <p><span className="text-blue-400">[INFO]</span> DepreciationCurve: precomputed for {SECTORS.length - 1} sectors</p>
                        <p><span className="text-amber-400">[WARN]</span> Oracle latency: 1.1s (threshold: 2.0s)</p>
                        <p><span className="text-emerald-400">[OK]</span> All subsystems operational - ready for audit</p>
                    </div>
                </div>
            )}

            <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <SettingsIcon size={15} className="text-slate-400" /> Configuration
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {[
                        { k: 'Network', v: testnet ? 'Arbitrum Sepolia' : 'Arbitrum One', c: testnet ? 'text-amber-400' : 'text-emerald-400' },
                        { k: 'Currency', v: currency, c: 'text-blue-400' },
                        { k: 'Debug', v: debugLogs ? 'Enabled' : 'Disabled', c: debugLogs ? 'text-emerald-400' : 'text-slate-500' },
                        { k: 'Engine', v: 'Stylus WASM v1.0', c: 'text-purple-400' },
                    ].map((row, i) => (
                        <div key={i} className="flex justify-between py-1.5 px-3 rounded-lg bg-slate-800/30">
                            <span className="text-slate-500">{row.k}</span><span className={row.c}>{row.v}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-red-500/5 rounded-xl border border-red-500/10 p-5">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-[11px] text-slate-500 mb-4">Clear cached data and reset local state. On-chain data is unaffected.</p>
                <button
                    onClick={() => { setCleared(true); setTimeout(() => setCleared(false), 2000); }}
                    disabled={cleared}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        cleared ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    }`}
                >
                    {cleared ? 'Cleared' : 'Clear Cache and Reset'}
                </button>
            </div>
        </div>
    );
}

//  MAIN EXPORT 
export type DashboardSection = 'dashboard' | 'market' | 'risk-engine' | 'governance' | 'settings';

// ── Parse revert reason from error ──
function parseContractError(err: unknown): string {
    const e = err as { shortMessage?: string; message?: string; cause?: { reason?: string; data?: { message?: string } } };
    if (e?.shortMessage) return e.shortMessage;
    if (e?.cause?.reason) return e.cause.reason;
    if (e?.cause?.data?.message) return e.cause.data.message;
    if (e?.message) {
        const match = e.message.match(/reason="?([^"\n]+)"?/);
        if (match) return match[1];
        const revert = e.message.match(/reverted with reason string '([^']+)'/);
        if (revert) return revert[1];
        return e.message.length > 200 ? e.message.slice(0, 200) + '...' : e.message;
    }
    return 'Unknown error — check console for details';
}

export default function LendingDashboard({ section = 'dashboard', onNavigate }: { section?: DashboardSection; onNavigate?: (s: DashboardSection) => void }) {
    const { address, isConnected } = useAccount();
    const [localSection, setLocalSection] = useState<DashboardSection>(section);
    const [selectedAsset, setSelectedAsset] = useState<InstitutionalAsset | null>(null);

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

    // Step states: idle -> pending -> confirming -> done | error
    const [mintStep, setMintStep] = useState<'idle' | 'pending' | 'confirming' | 'done' | 'error'>('idle');
    const [approveStep, setApproveStep] = useState<'idle' | 'pending' | 'confirming' | 'done' | 'error'>('idle');
    const [borrowStep, setBorrowStep] = useState<'idle' | 'pending' | 'confirming' | 'done' | 'error'>('idle');

    useEffect(() => { setLocalSection(section); }, [section]);

    const activeSection = onNavigate ? section : localSection;
    const navigate = onNavigate || setLocalSection;

    // ── Mint NFT ──
    const { data: mintHash, writeContractAsync: writeMintAsync } = useWriteContract();
    const { isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({ hash: mintHash });
    useEffect(() => { if (isMintConfirmed && mintStep === 'confirming') { setMintStep('done'); setToast({ message: `NFT #${selectedAsset?.id} minted to your wallet`, type: 'success' }); } }, [isMintConfirmed, mintStep, selectedAsset]);

    // ── Approve NFT ──
    const { data: approveHash, writeContractAsync: writeApproveAsync } = useWriteContract();
    const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
    useEffect(() => { if (isApproveConfirmed && approveStep === 'confirming') { setApproveStep('done'); setToast({ message: 'NFT approved for LendingPool', type: 'success' }); } }, [isApproveConfirmed, approveStep]);

    // ── Borrow ──
    const { data: borrowTxHash, writeContractAsync: writeBorrowAsync } = useWriteContract();
    const { isSuccess: isBorrowConfirmed } = useWaitForTransactionReceipt({ hash: borrowTxHash });
    useEffect(() => { if (isBorrowConfirmed && borrowStep === 'confirming') { setBorrowStep('done'); setToast({ message: `Loan disbursed! ${fmtFull(selectedAsset?.maxLoan ?? 0)} USDC sent to your wallet.`, type: 'success' }); } }, [isBorrowConfirmed, borrowStep, selectedAsset]);

    // ── Handlers with try/catch ──
    const handleMint = async (asset: InstitutionalAsset) => {
        if (!address) { setToast({ message: 'Connect your wallet first', type: 'error' }); return; }
        try {
            setMintStep('pending');
            await writeMintAsync({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: 'mint', args: [address, BigInt(asset.id)], maxFeePerGas: parseGwei('0.5'), maxPriorityFeePerGas: parseGwei('0.01') });
            setMintStep('confirming');
        } catch (err) {
            console.error('Mint error:', err);
            setMintStep('error');
            setToast({ message: parseContractError(err), type: 'error' });
        }
    };

    const handleApprove = async (asset: InstitutionalAsset) => {
        try {
            setApproveStep('pending');
            await writeApproveAsync({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: 'approve', args: [LENDING_POOL_ADDRESS, BigInt(asset.id)], maxFeePerGas: parseGwei('0.5'), maxPriorityFeePerGas: parseGwei('0.01') });
            setApproveStep('confirming');
        } catch (err) {
            console.error('Approve error:', err);
            setApproveStep('error');
            setToast({ message: parseContractError(err), type: 'error' });
        }
    };

    const handleBorrow = async (asset: InstitutionalAsset) => {
        try {
            setBorrowStep('pending');
            await writeBorrowAsync({ address: LENDING_POOL_ADDRESS, abi: LENDING_ABI, functionName: 'depositCollateralAndBorrow', args: [BigInt(asset.id)], maxFeePerGas: parseGwei('0.5'), maxPriorityFeePerGas: parseGwei('0.01') });
            setBorrowStep('confirming');
        } catch (err) {
            console.error('Borrow error:', err);
            setBorrowStep('error');
            setToast({ message: parseContractError(err), type: 'error' });
        }
    };

    const handleCloseModal = () => { setSelectedAsset(null); setMintStep('idle'); setApproveStep('idle'); setBorrowStep('idle'); };
    const isBusy = mintStep === 'pending' || mintStep === 'confirming' || approveStep === 'pending' || approveStep === 'confirming' || borrowStep === 'pending' || borrowStep === 'confirming';

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                    <Shield size={28} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
                <p className="text-sm text-slate-500 max-w-sm">
                    Access the Colateral-X institutional RWA terminal. Connect to start collateralizing real-world assets on Arbitrum Stylus.
                </p>
                <div className="mt-6 flex items-center gap-2 text-[11px] font-mono text-slate-600">
                    <Zap size={12} className="text-blue-400" /> Powered by Arbitrum Stylus and Rust
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-white">
                        {activeSection === 'dashboard' && 'Protocol Overview'}
                        {activeSection === 'market' && 'Asset Market'}
                        {activeSection === 'risk-engine' && 'Risk Engine'}
                        {activeSection === 'governance' && 'Governance'}
                        {activeSection === 'settings' && 'Settings'}
                    </h1>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {INSTITUTIONAL_ASSETS.length} assets - Stylus WASM v1.0 - Arbitrum Sepolia
                    </p>
                </div>
                {!onNavigate && (
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/50 border border-slate-800/40 w-fit">
                        {([
                            ['dashboard', 'Overview', <Layers size={14} key="d" />],
                            ['market', 'Market', <Store size={14} key="m" />],
                            ['risk-engine', 'Risk', <BarChart3 size={14} key="r" />],
                            ['governance', 'DAO', <Vote size={14} key="g" />],
                            ['settings', 'Settings', <SettingsIcon size={14} key="s" />],
                        ] as [DashboardSection, string, React.ReactNode][]).map(([id, label, icon]) => (
                            <button key={id} onClick={() => navigate(id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    activeSection === id ? 'bg-blue-500/15 text-blue-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                                }`}>
                                {icon}<span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {activeSection === 'dashboard' && <DashboardOverview onGoToMarket={() => navigate('market')} />}
            {activeSection === 'market' && <MarketSection onSelect={setSelectedAsset} />}
            {activeSection === 'risk-engine' && <RiskEngineSection />}
            {activeSection === 'governance' && <GovernanceSection />}
            {activeSection === 'settings' && <SettingsSection />}

            {selectedAsset && (
                <AssetModal
                    asset={selectedAsset} onClose={handleCloseModal}
                    onMint={handleMint} onApprove={handleApprove} onBorrow={handleBorrow}
                    mintStep={mintStep} approveStep={approveStep} borrowStep={borrowStep}
                    isBusy={isBusy} txHash={borrowTxHash} approveHash={approveHash} mintHash={mintHash}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
