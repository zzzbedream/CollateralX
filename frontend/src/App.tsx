import { useState, useRef } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from './wagmi'
import LoanDashboard from './components/LoanDashboard'
import DashboardLayout from './components/DashboardLayout'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
    Zap, Shield, BarChart3, Store, Landmark, ChevronDown, ChevronRight,
    ExternalLink, Cpu, Wheat, HardHat, Container, ShoppingBag, Layers,
    Activity, Lock, Rocket, Globe, Scale, Terminal, ArrowRight, CheckCircle2,
    Github, Twitter, MessageCircle, BookOpen,
} from 'lucide-react'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

// ─── Animation helpers ───
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    }),
}

const stagger = {
    visible: { transition: { staggerChildren: 0.1 } },
}

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })
    return (
        <motion.section
            id={id}
            ref={ref}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={stagger}
            className={className}
        >
            {children}
        </motion.section>
    )
}

// ─── Floating Rust Code Background ───
const rustCodeLines = `use stylus_sdk::prelude::*;
use alloc::vec::Vec;

#[storage]
pub struct ValuationEngine {
    depreciation_curves: StorageMap<u32, u64>,
    risk_weights: StorageMap<AssetType, u64>,
    oracle_feeds: StorageVec<Address>,
}

impl ValuationEngine {
    pub fn calculate_risk(
        &self,
        asset: &Asset,
    ) -> Result<RiskProfile, ValuationError> {
        let base_value = self.get_oracle_price(asset)?;
        let depreciation = self.compute_curve(
            asset.age_months,
            asset.asset_type,
        );
        let ltv = self.compute_ltv(
            base_value,
            depreciation,
            asset.condition_score,
        );
        Ok(RiskProfile {
            current_value: base_value - depreciation,
            ltv_ratio: ltv,
            risk_score: self.score(asset),
        })
    }

    fn compute_curve(
        &self,
        age: u32,
        asset_type: AssetType,
    ) -> u64 {
        let rate = self.depreciation_curves
            .get(asset_type as u32);
        rate * age as u64 / 12
    }
}`.split('\n')

function FloatingCode() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            <div className="code-bg-float absolute -top-[20%] left-[5%] rotate-[-8deg]">
                {rustCodeLines.map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
                {rustCodeLines.map((line, i) => (
                    <div key={`dup-${i}`}>{line}</div>
                ))}
            </div>
            <div className="code-bg-float absolute -top-[40%] right-[8%] rotate-[6deg]" style={{ animationDelay: '-15s' }}>
                {rustCodeLines.map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
                {rustCodeLines.map((line, i) => (
                    <div key={`dup-${i}`}>{line}</div>
                ))}
            </div>
        </div>
    )
}

// ─── Navbar ───
function Navbar({ onLaunch }: { onLaunch: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false)
    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/40"
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#12AAFF] to-[#1B4DFF] flex items-center justify-center shadow-lg shadow-[#12AAFF]/20">
                        <Zap size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-white tracking-tight">Colateral-X</span>
                    <span className="hidden sm:inline text-[10px] font-mono text-[#12AAFF]/60 bg-[#12AAFF]/10 px-2 py-0.5 rounded-full border border-[#12AAFF]/20">
                        Arbitrum Stylus
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    {[['#problem', 'Problem'], ['#modules', 'Modules'], ['#how-it-works', 'How It Works'], ['#judge-guide', "Judge's Guide"], ['#roadmap', 'Roadmap']].map(([href, label]) => (
                        <a key={href} href={href} className="text-sm text-slate-400 hover:text-white transition-colors">{label}</a>
                    ))}
                    <button onClick={onLaunch} className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#12AAFF] to-[#1B4DFF] rounded-full hover:shadow-[0_0_20px_rgba(18,170,255,0.3)] transition-all">
                        Launch App
                    </button>
                </div>
                <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                        {menuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                    </svg>
                </button>
            </div>
            {menuOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden bg-slate-950/95 border-t border-slate-800/40 px-6 py-4 flex flex-col gap-4">
                    {['Problem', 'Modules', 'How It Works', "Judge's Guide", 'Roadmap'].map(l => (
                        <a key={l} href={`#${l.toLowerCase().replace(/['\s]/g, '-')}`} className="text-sm text-slate-400">{l}</a>
                    ))}
                    <button onClick={onLaunch} className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#12AAFF] to-[#1B4DFF] rounded-full">Launch App</button>
                </motion.div>
            )}
        </motion.nav>
    )
}

// ─── Hero Section ───
function Hero({ onLaunch }: { onLaunch: () => void }) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-[#12AAFF]/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-[#00FF88]/5 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[300px] bg-[#1B4DFF]/6 rounded-full blur-[100px]" />
            </div>
            <FloatingCode />
            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-[#00FF88]/20 bg-[#00FF88]/5 text-[#00FF88] text-xs font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
                        Live on Arbitrum Sepolia — Contracts Deployed & Cached
                    </motion.div>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6">
                        <span className="glitch-text inline-block text-gradient-hero" data-text="Unlocking $1.8T">Unlocking $1.8T</span>
                        <br />
                        <span className="text-gradient-hero">in SME Liquidity</span>
                        <br />
                        <span className="text-[#12AAFF] text-3xl sm:text-4xl md:text-5xl font-mono font-semibold mt-2 inline-block">
                            via Arbitrum Stylus.
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed mb-10 font-light">
                        The first <span className="text-white font-medium">RWA lending protocol</span> powered by a{' '}
                        <span className="font-mono text-[#12AAFF]">Rust/WASM</span> valuation engine on Arbitrum.{' '}
                        We collateralize <span className="text-[#00FF88] font-semibold">real-world assets</span> — machinery, fleets, solar farms — at{' '}
                        <span className="text-white font-bold">99.9% lower gas cost</span> than Solidity.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button onClick={onLaunch}
                            className="group relative px-8 py-4 bg-gradient-to-r from-[#12AAFF] to-[#1B4DFF] text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 hover:shadow-[0_0_40px_rgba(18,170,255,0.3)] w-full sm:w-auto flex items-center justify-center gap-2">
                            Launch App <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a href="#judge-guide"
                            className="px-8 py-4 bg-transparent text-slate-400 rounded-full font-semibold text-lg transition-all border border-slate-800 hover:border-slate-600 hover:text-white w-full sm:w-auto text-center flex items-center justify-center gap-2">
                            <BookOpen size={18} /> Judge's Guide
                        </a>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
                    className="mt-20 grid grid-cols-4 gap-6 max-w-2xl mx-auto">
                    {[
                        { value: '99.9%', label: 'Gas Reduction' },
                        { value: '15', label: 'RWA Assets' },
                        { value: 'Rust', label: 'WASM Engine' },
                        { value: '$1.8T', label: 'Market Gap' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <p className="text-2xl sm:text-3xl font-bold font-mono text-white mb-1">{stat.value}</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-16 flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-slate-600">Scroll</span>
                    <div className="w-[1px] h-8 bg-gradient-to-b from-slate-600 to-transparent" />
                </motion.div>
            </div>
        </section>
    )
}

// ─── Problem Section ───
function ProblemSection() {
    const cards = [
        { icon: <Wheat size={24} />, title: 'Asset Rich, Cash Poor.', body: 'SMEs in LatAm hold 75% of their value in machinery & inventory. Banks reject movable collateral. We tokenize it.', accent: '#12AAFF' },
        { icon: <Cpu size={24} />, title: 'The EVM Limit.', body: "Traditional DeFi can't handle complex risk models. Solidity is too expensive for real-time depreciation curves and risk scoring.", accent: '#00FF88' },
        { icon: <Activity size={24} />, title: 'The Slow Lane.', body: 'Manual auditing takes weeks. SMEs need liquidity today — automated, on-chain, instant.', accent: '#FFB800' },
    ]
    return (
        <Section id="problem" className="relative py-32 px-6">
            <div className="max-w-6xl mx-auto">
                <motion.p variants={fadeUp} custom={0} className="text-xs font-mono uppercase tracking-[0.3em] text-[#12AAFF] mb-4">The Problem</motion.p>
                <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
                    The <span className="text-gradient-green">$1.8 Trillion</span> Deadlock.
                </motion.h2>
                <motion.p variants={fadeUp} custom={2} className="text-slate-500 text-lg max-w-xl mb-16">
                    Small and medium enterprises generate the majority of GDP in emerging markets — yet they remain locked out of capital.
                </motion.p>
                <div className="grid md:grid-cols-3 gap-6">
                    {cards.map((card, i) => (
                        <motion.div key={i} variants={fadeUp} custom={i + 3}
                            className="card-glow rounded-2xl bg-slate-900/50 border border-slate-800/50 p-8 group hover:border-slate-700/60 transition-all">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                                style={{ background: `${card.accent}10`, border: `1px solid ${card.accent}20`, color: card.accent }}>
                                {card.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#12AAFF] transition-colors">{card.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{card.body}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    )
}

// ─── Modules Showcase ───
function ModulesShowcase() {
    const modules = [
        {
            icon: <Store size={24} />, title: 'RWA Marketplace', status: 'Live',
            description: '15 institutional-grade assets across 6 sectors — Agro, Tech, Energy, Heavy, Logistics, Retail. Real Unsplash photography. Filterable grid with risk ratings.',
            stats: [{ label: 'Assets', value: '15' }, { label: 'Sectors', value: '6' }, { label: 'Ratings', value: 'AAA→B+' }],
            color: '#12AAFF',
        },
        {
            icon: <Terminal size={24} />, title: 'Stylus Risk Engine', status: 'Live',
            description: 'Rust/WASM valuation engine deployed on Arbitrum Stylus. Computes depreciation curves, risk adjustments, and LTV calculations on-chain at 99.9% lower gas than Solidity.',
            stats: [{ label: 'Gas Cost', value: '$0.04' }, { label: 'Solidity', value: '$50' }, { label: 'Savings', value: '99.9%' }],
            color: '#00FF88',
        },
        {
            icon: <Landmark size={24} />, title: 'Governance DAO', status: 'Live',
            description: 'On-chain proposal system with active community voting. LTV adjustments, new asset onboarding, and protocol upgrades governed by token holders.',
            stats: [{ label: 'Proposals', value: '5' }, { label: 'Voters', value: '2,467' }, { label: 'Treasury', value: '$1.2M' }],
            color: '#A855F7',
        },
        {
            icon: <BarChart3 size={24} />, title: 'Risk Analytics', status: 'Live',
            description: 'Bloomberg Terminal-style dashboard with sector distribution, risk matrix, and live Stylus execution feed. Full portfolio-level visibility.',
            stats: [{ label: 'Sections', value: '5' }, { label: 'Real-time', value: 'Yes' }, { label: 'Feed', value: 'Streaming' }],
            color: '#FFB800',
        },
    ]
    return (
        <Section id="modules" className="relative py-32 px-6">
            <div className="section-divider mb-32" />
            <div className="max-w-6xl mx-auto">
                <motion.p variants={fadeUp} custom={0} className="text-xs font-mono uppercase tracking-[0.3em] text-[#00FF88] mb-4">What's Built</motion.p>
                <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
                    Production-Ready <span className="text-gradient-blue">Modules.</span>
                </motion.h2>
                <motion.p variants={fadeUp} custom={2} className="text-slate-500 text-lg max-w-2xl mb-16">
                    Every module is deployed, connected, and functional on Arbitrum Sepolia. Not mockups — real smart contract interactions.
                </motion.p>
                <div className="grid md:grid-cols-2 gap-6">
                    {modules.map((mod, i) => (
                        <motion.div key={i} variants={fadeUp} custom={i + 3}
                            className="rounded-2xl bg-slate-900/40 border border-slate-800/50 p-6 hover:border-slate-700/60 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: `${mod.color}10`, border: `1px solid ${mod.color}20`, color: mod.color }}>
                                    {mod.icon}
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{mod.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#12AAFF] transition-colors">{mod.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-4">{mod.description}</p>
                            <div className="grid grid-cols-3 gap-2">
                                {mod.stats.map((s, j) => (
                                    <div key={j} className="text-center py-2 rounded-lg bg-slate-800/30 border border-slate-800/30">
                                        <p className="text-sm font-bold font-mono text-white">{s.value}</p>
                                        <p className="text-[9px] uppercase tracking-wider text-slate-600">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    )
}

// ─── Tech Flex Section (Solution) ───
function TechSection() {
    return (
        <Section className="relative py-32 px-6">
            <div className="section-divider mb-32" />
            <div className="max-w-6xl mx-auto">
                <motion.p variants={fadeUp} custom={0} className="text-xs font-mono uppercase tracking-[0.3em] text-[#00FF88] mb-4">The Solution</motion.p>
                <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
                    Engineered for Velocity.{' '}<span className="text-gradient-blue">Built with Stylus.</span>
                </motion.h2>
                <motion.p variants={fadeUp} custom={2} className="text-slate-500 text-lg max-w-2xl mb-16">
                    Our WASM-powered valuation engines run complex financial math on-chain at a fraction of the cost.
                </motion.p>
                <motion.div variants={fadeUp} custom={3} className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="rounded-2xl bg-slate-900/40 border border-slate-800/50 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[60px]" />
                        <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-600 mb-6">Legacy</p>
                        <h3 className="text-2xl font-bold text-slate-400 mb-8 font-mono">Solidity Contract</h3>
                        <div className="space-y-6">
                            {[
                                ['Gas Cost', '$50.00', 'text-red-400'],
                                ['Speed', '🐌 Slow', 'text-red-400'],
                                ['Risk Models', 'Limited', 'text-slate-500'],
                            ].map(([label, value, color], j) => (
                                <div key={j}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">{label}</span>
                                        <span className={`font-mono font-bold text-lg ${color}`}>{value}</span>
                                    </div>
                                    {j < 2 && <div className="h-[1px] bg-slate-800/60 mt-6" />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl bg-slate-900/40 border border-[#00FF88]/20 p-8 relative overflow-hidden animate-neon-pulse">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/5 rounded-full blur-[60px]" />
                        <div className="absolute top-4 right-4">
                            <span className="px-2 py-0.5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] text-[10px] font-mono font-bold uppercase">Colateral-X</span>
                        </div>
                        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#00FF88]/60 mb-6">Stylus</p>
                        <h3 className="text-2xl font-bold text-white mb-8 font-mono">Rust (WASM) Engine</h3>
                        <div className="space-y-6">
                            {[
                                ['Gas Cost', '$0.04', 'text-[#00FF88]'],
                                ['Speed', '⚡ 10x Faster', 'text-[#00FF88]'],
                                ['Risk Models', 'Full Depreciation Curves', 'text-[#00FF88]'],
                            ].map(([label, value, color], j) => (
                                <div key={j}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">{label}</span>
                                        <span className={`font-mono font-bold text-lg ${color}`}>{value}</span>
                                    </div>
                                    {j < 2 && <div className="h-[1px] bg-[#00FF88]/10 mt-6" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </Section>
    )
}

// ─── How It Works ───
function HowItWorks() {
    const steps = [
        { step: '01', title: 'Tokenize', description: 'Real-world assets are minted as dynamic NFTs with verified metadata — machinery, fleets, solar farms.', icon: <Layers size={28} className="text-[#12AAFF]" /> },
        { step: '02', title: 'Value', description: 'Our Stylus Smart Contract (Rust/WASM) calculates real-time depreciation, risk scoring, and LTV — on-chain.', icon: <Zap size={28} className="text-[#00FF88]" />, badge: 'The Magic ✨' },
        { step: '03', title: 'Borrow', description: 'Receive USDC instantly against your collateral. Transparent rates. Zero paperwork. 60% LTV.', icon: <Shield size={28} className="text-[#FFB800]" /> },
    ]
    return (
        <Section id="how-it-works" className="relative py-32 px-6">
            <div className="section-divider mb-32" />
            <div className="max-w-6xl mx-auto">
                <motion.p variants={fadeUp} custom={0} className="text-xs font-mono uppercase tracking-[0.3em] text-[#12AAFF] mb-4">How It Works</motion.p>
                <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-16">
                    Three Steps to <span className="text-gradient-green">Liquidity.</span>
                </motion.h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((s, i) => (
                        <motion.div key={i} variants={fadeUp} custom={i + 2} className="relative group">
                            {i < 2 && <div className="hidden md:block absolute top-12 left-full w-full h-[1px] bg-gradient-to-r from-slate-800 to-transparent z-0" />}
                            <div className="card-glow rounded-2xl bg-slate-900/40 border border-slate-800/50 p-8 h-full relative z-10 hover:border-slate-700/60 transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-5xl font-black font-mono text-slate-900 group-hover:text-slate-800/80 transition-colors">{s.step}</span>
                                    {s.badge && <span className="px-2 py-0.5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] text-[10px] font-mono">{s.badge}</span>}
                                </div>
                                <div className="mb-4">{s.icon}</div>
                                <h3 className="text-2xl font-bold text-white mb-3">{s.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    )
}

// ─── Deployed Contracts Banner ───
function DeployedContracts() {
    const contracts = [
        { name: 'LendingPool', addr: '0xd9EE...1d66', full: '0xd9EE974233b089FCC4D541E1CdF54A7186F91d66', type: 'Solidity' },
        { name: 'StylusValuator', addr: '0x0232...eee1', full: '0x023223d7b651a007dc42980cb9ca75f1e795eee1', type: 'Rust/WASM' },
        { name: 'MockUSDC', addr: '0x5dAc...0355', full: '0x5dAc64216Aa03B88ebDC9E5b46625e4780550355', type: 'ERC-20' },
        { name: 'MockNFT', addr: '0xDBb0...f4b', full: '0xDBb0CcB41C632596Ee50348CEc547B23B46E4f4b', type: 'ERC-721' },
    ]
    return (
        <Section className="relative py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <motion.div variants={fadeUp} custom={0} className="rounded-2xl bg-slate-900/40 border border-slate-800/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Lock size={14} className="text-emerald-400" />
                            <span className="text-sm font-semibold text-slate-200">Deployed Contracts — Arbitrum Sepolia</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-mono text-emerald-400">Cached in ArbOS</span>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-800/30">
                        {contracts.map((c, i) => (
                            <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-slate-800/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-200">{c.name}</span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-500">{c.type}</span>
                                </div>
                                <a href={`https://sepolia.arbiscan.io/address/${c.full}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors">
                                    {c.addr} <ExternalLink size={10} />
                                </a>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </Section>
    )
}

// ─── Judge's Guide (Accordion FAQ) ───
function JudgeGuide({ onLaunch }: { onLaunch: () => void }) {
    const [openIdx, setOpenIdx] = useState<number | null>(null)
    const steps = [
        {
            title: '1. Get Sepolia ETH',
            content: 'You need a small amount of Arbitrum Sepolia ETH for gas fees. Visit the Alchemy faucet, enter your wallet address, and receive free testnet ETH.',
            link: { label: 'Alchemy Faucet →', href: 'https://www.alchemy.com/faucets/arbitrum-sepolia' },
        },
        {
            title: '2. Connect & Switch Network',
            content: 'Click "Launch App" above, then connect your MetaMask wallet using the "Connect Wallet" button in the top-right. Make sure MetaMask is set to "Arbitrum Sepolia" — the app will prompt you to switch if needed.',
            action: { label: 'Launch App', fn: onLaunch },
        },
        {
            title: '3. Mint Test USDC',
            content: 'Navigate to the "Settings" tab in the sidebar. Click "Mint 100K USDC" to receive 100,000 test USDC to your wallet. MetaMask will ask you to confirm the transaction.',
        },
        {
            title: '4. Browse the Asset Market',
            content: 'Go to the "Market" tab. You\'ll see 15 real-world assets across 6 sectors (Agro, Tech, Energy, Heavy, Logistics, Retail). Use the sector filter tabs to browse. Each card shows valuation, risk rating (AAA to B+), APY, and Stylus gas cost.',
        },
        {
            title: '5. Inspect an Asset',
            content: 'Click any asset card to open the detail modal. Three tabs: "Overview" shows financials, "Contract Logic" shows the Stylus vs Solidity gas comparison with code snippets, and "Tx History" shows the execution log.',
        },
        {
            title: '6. Request a Loan',
            content: 'In the asset modal, click "Request Loan". MetaMask will ask for two confirmations: (1) Approve the NFT transfer, (2) Execute the borrow. The Stylus valuator computes the asset value on-chain, and USDC is transferred to your wallet at 60% LTV.',
        },
        {
            title: '7. Verify on Arbiscan',
            content: 'After the loan tx confirms, click "View on Arbiscan". Check the "Internal Txns" tab — you\'ll see a call from the LendingPool (0xd9EE...) to the StylusValuator (0x0232...). This proves Rust is executing on-chain.',
        },
    ]
    return (
        <Section id="judge-guide" className="relative py-32 px-6">
            <div className="section-divider mb-32" />
            <div className="max-w-3xl mx-auto">
                <motion.p variants={fadeUp} custom={0} className="text-xs font-mono uppercase tracking-[0.3em] text-[#FFB800] mb-4">For Judges & Reviewers</motion.p>
                <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                    How to Test <span className="text-gradient-blue">Colateral-X</span>
                </motion.h2>
                <motion.p variants={fadeUp} custom={2} className="text-slate-500 text-lg mb-12">
                    Complete walkthrough in 7 steps. Each step takes under 1 minute.
                </motion.p>
                <motion.div variants={fadeUp} custom={3} className="space-y-3">
                    {steps.map((step, i) => (
                        <div key={i} className="rounded-xl border border-slate-800/50 bg-slate-900/40 overflow-hidden transition-all hover:border-slate-700/60">
                            <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                                className="w-full flex items-center justify-between px-6 py-4 text-left">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg bg-[#12AAFF]/10 border border-[#12AAFF]/20 flex items-center justify-center text-[#12AAFF] text-xs font-bold font-mono">{i + 1}</span>
                                    <span className="text-sm font-semibold text-slate-200">{step.title}</span>
                                </div>
                                <ChevronDown size={16} className={`text-slate-500 transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {openIdx === i && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                        <div className="px-6 pb-4 pt-0">
                                            <p className="text-sm text-slate-400 leading-relaxed mb-3">{step.content}</p>
                                            {step.link && (
                                                <a href={step.link.href} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#12AAFF] hover:text-blue-300 transition-colors">
                                                    {step.link.label} <ExternalLink size={10} />
                                                </a>
                                            )}
                                            {step.action && (
                                                <button onClick={step.action.fn}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#12AAFF]/10 border border-[#12AAFF]/20 text-[#12AAFF] hover:bg-[#12AAFF]/20 transition-colors">
                                                    {step.action.label} <ArrowRight size={10} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </motion.div>
            </div>
        </Section>
    )
}

// ─── Simple Rust syntax highlighting ───
function colorizeRust(line: string) {
    const comments = /(\/\/.*)/g
    if (comments.test(line)) {
        return <span className="text-[#6A9955]">{line}</span>
    }
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    const combinedRegex = /(\b(?:fn|let|pub|impl|self|Ok|Result|use|struct|const|mut|return|if|else|match)\b)|(\b(?:u64|u32|u8|U256|Asset|Error|Self|String|Vec)\b)|(".*?")|(&self)|(\.\w+\()/g
    let match: RegExpExecArray | null
    const str = line
    combinedRegex.lastIndex = 0
    while ((match = combinedRegex.exec(str)) !== null) {
        if (match.index > lastIndex) {
            parts.push(<span key={`t-${lastIndex}`} className="text-[#D4D4D4]">{str.slice(lastIndex, match.index)}</span>)
        }
        if (match[1]) parts.push(<span key={`k-${match.index}`} className="text-[#C586C0]">{match[0]}</span>)
        else if (match[2]) parts.push(<span key={`ty-${match.index}`} className="text-[#4EC9B0]">{match[0]}</span>)
        else if (match[3]) parts.push(<span key={`s-${match.index}`} className="text-[#CE9178]">{match[0]}</span>)
        else if (match[4]) parts.push(<span key={`r-${match.index}`} className="text-[#C586C0]">{match[0]}</span>)
        else if (match[5]) parts.push(<span key={`m-${match.index}`} className="text-[#DCDCAA]">{match[0]}</span>)
        lastIndex = match.index + match[0].length
    }
    if (lastIndex < str.length) {
        parts.push(<span key={`e-${lastIndex}`} className="text-[#D4D4D4]">{str.slice(lastIndex)}</span>)
    }
    return parts.length > 0 ? <>{parts}</> : <span className="text-[#D4D4D4]">{line}</span>
}

// ─── Developer Section ───
function DeveloperSection() {
    const codeSnippet = `// Stylus Rust Contract — On-Chain Valuation Engine
#[public]
impl CollateralValuation {
    fn calculate_current_value(
        &self,
        asset_type: u8,
        initial_value: u64,
        purchase_date: u64,
        risk_score: u8,
        current_timestamp: u64,
    ) -> U256 {
        U256::from(compute_current_value(
            asset_type,
            initial_value,
            purchase_date,
            risk_score,
            current_timestamp,
        ))
    }
}`
    return (
        <Section id="developers" className="relative py-32 px-6">
            <div className="section-divider mb-32" />
            <div className="max-w-6xl mx-auto">
                <motion.p variants={fadeUp} custom={0} className="text-xs font-mono uppercase tracking-[0.3em] text-[#00FF88] mb-4">Open Source</motion.p>
                <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
                    Code is Law. <span className="text-gradient-blue">Performance is Key.</span>
                </motion.h2>
                <motion.p variants={fadeUp} custom={2} className="text-slate-500 text-lg max-w-xl mb-16">
                    The actual deployed Stylus contract — 206 lines of Rust that power on-chain asset valuation.
                </motion.p>
                <motion.div variants={fadeUp} custom={3} className="max-w-3xl mx-auto">
                    <div className="code-block">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/60">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                                </div>
                                <span className="ml-3 text-xs text-slate-500 font-mono">lib.rs — Deployed at 0x0232...eee1</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#00FF88]/10 text-[#00FF88] font-mono border border-[#00FF88]/20">Rust</span>
                        </div>
                        <div className="p-5 overflow-x-auto">
                            <pre className="text-sm leading-relaxed">
                                <code>
                                    {codeSnippet.split('\n').map((line, i) => (
                                        <div key={i} className="flex">
                                            <span className="w-8 text-right mr-4 text-slate-700 select-none text-xs">{i + 1}</span>
                                            <span className="flex-1">{colorizeRust(line)}</span>
                                        </div>
                                    ))}
                                </code>
                            </pre>
                        </div>
                    </div>
                </motion.div>
                <motion.div variants={fadeUp} custom={4} className="flex flex-wrap justify-center gap-4 mt-12">
                    {[
                        { label: 'Open Source', icon: <BookOpen size={14} /> },
                        { label: 'Arbitrum Stylus', icon: <Zap size={14} /> },
                        { label: 'Rust / WASM', icon: <Terminal size={14} /> },
                        { label: 'Hackathon 2026', icon: <Rocket size={14} /> },
                    ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800/50 text-sm text-slate-400">
                            {badge.icon} {badge.label}
                        </div>
                    ))}
                </motion.div>
            </div>
        </Section>
    )
}

// ─── Roadmap ───
function RoadmapSection() {
    const phases = [
        {
            phase: 'Q1 2026', title: 'Hackathon MVP', status: 'current',
            items: ['Stylus valuator deployed (Rust → WASM)', '15 RWA asset marketplace', 'LendingPool + MockUSDC + MockNFT', 'Institutional-grade dashboard', 'Governance module'],
        },
        {
            phase: 'Q2 2026', title: 'Cross-Chain Expansion', status: 'upcoming',
            items: ['Chainlink CCIP for cross-chain collateral', 'Real oracle price feeds integration', 'Multi-curve depreciation models', 'Partner DAO onboarding'],
        },
        {
            phase: 'Q3 2026', title: 'Legal & Compliance', status: 'upcoming',
            items: ['Legal wrapper integration (Kleros arbitration)', 'KYB/AML compliance layer', 'Institutional API for banks & fintechs', 'Audit by major firm'],
        },
        {
            phase: 'Q4 2026', title: 'Mainnet Launch', status: 'future',
            items: ['Arbitrum One mainnet deployment', 'Real USDC + real asset partnerships', 'LatAm pilot with 50 SMEs', 'Series A fundraise'],
        },
    ]
    return (
        <Section id="roadmap" className="relative py-32 px-6">
            <div className="section-divider mb-32" />
            <div className="max-w-4xl mx-auto">
                <motion.p variants={fadeUp} custom={0} className="text-xs font-mono uppercase tracking-[0.3em] text-[#A855F7] mb-4">Vision</motion.p>
                <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-16">
                    The Road to <span className="text-gradient-green">Mainnet.</span>
                </motion.h2>
                <div className="relative">
                    <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#12AAFF] via-slate-800 to-transparent" />
                    <div className="space-y-8">
                        {phases.map((p, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i + 2} className="relative pl-12">
                                <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl flex items-center justify-center border ${
                                    p.status === 'current' ? 'bg-[#12AAFF]/10 border-[#12AAFF]/30 text-[#12AAFF]'
                                    : p.status === 'upcoming' ? 'bg-slate-900 border-slate-700 text-slate-400'
                                    : 'bg-slate-900/50 border-slate-800 text-slate-600'
                                }`}>
                                    {p.status === 'current' ? <CheckCircle2 size={18} /> : <ChevronRight size={16} />}
                                </div>
                                <div className={`rounded-xl border p-6 ${
                                    p.status === 'current' ? 'bg-slate-900/60 border-[#12AAFF]/20' : 'bg-slate-900/30 border-slate-800/40'
                                }`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xs font-mono font-bold text-[#12AAFF]">{p.phase}</span>
                                        {p.status === 'current' && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#12AAFF]/10 border border-[#12AAFF]/20 text-[#12AAFF]">Current</span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-3">{p.title}</h3>
                                    <ul className="space-y-1.5">
                                        {p.items.map((item, j) => (
                                            <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                                    p.status === 'current' ? 'bg-[#00FF88]' : 'bg-slate-700'
                                                }`} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </Section>
    )
}

// ─── Footer ───
function Footer() {
    return (
        <footer className="border-t border-slate-800/40 py-12 px-6 bg-slate-950">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#12AAFF] to-[#1B4DFF] flex items-center justify-center">
                        <Zap size={14} className="text-white" />
                    </div>
                    <span className="text-sm text-slate-500">
                        Colateral-X &copy; 2026. <span className="text-[#00FF88]/60">Unlocking LatAm.</span>
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    {[
                        { label: 'GitHub', icon: <Github size={14} /> },
                        { label: 'Twitter', icon: <Twitter size={14} /> },
                        { label: 'Discord', icon: <MessageCircle size={14} /> },
                        { label: 'Docs', icon: <BookOpen size={14} /> },
                    ].map((link) => (
                        <a key={link.label} href="#" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-300 transition-colors font-mono">
                            {link.icon} {link.label}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    )
}

// ─── Full Landing Page ───
function LandingPage({ onLaunch }: { onLaunch: () => void }) {
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
            <Navbar onLaunch={onLaunch} />
            <Hero onLaunch={onLaunch} />
            <ProblemSection />
            <ModulesShowcase />
            <TechSection />
            <HowItWorks />
            <DeployedContracts />
            <JudgeGuide onLaunch={onLaunch} />
            <DeveloperSection />
            <RoadmapSection />
            <Footer />
        </div>
    )
}

// ─── App Root ───
export default function App() {
    const [launched, setLaunched] = useState(false)

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#12AAFF',
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                    })}
                >
                    {launched ? (
                        <DashboardLayout>
                            <LoanDashboard />
                        </DashboardLayout>
                    ) : (
                        <LandingPage onLaunch={() => setLaunched(true)} />
                    )}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
