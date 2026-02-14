import { useState, cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
    LayoutDashboard,
    Store,
    ShieldAlert,
    Landmark,
    Settings,
    ChevronLeft,
    ChevronRight,
    Search,
    Bell,
    ChevronRight as BreadcrumbArrow,
    Menu,
    X,
    Zap,
    Activity,
    TrendingUp,
    Shield,
    Lock,
} from 'lucide-react';
import type { DashboardSection } from './LoanDashboard';

// ─── Types ───
interface NavItem {
    label: string;
    icon: ReactNode;
    id: string;
    badge?: string;
}

// ─── Navigation Config ───
const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, id: 'dashboard' },
    { label: 'Market', icon: <Store size={20} />, id: 'market', badge: '15' },
    { label: 'Risk Engine', icon: <ShieldAlert size={20} />, id: 'risk-engine' },
    { label: 'Governance', icon: <Landmark size={20} />, id: 'governance', badge: '2' },
    { label: 'Settings', icon: <Settings size={20} />, id: 'settings' },
];

// ─── Sidebar ───
function Sidebar({
    collapsed,
    onToggle,
    activeItem,
    onNavigate,
}: {
    collapsed: boolean;
    onToggle: () => void;
    activeItem: string;
    onNavigate: (id: string) => void;
}) {
    return (
        <aside
            className={`
                hidden lg:flex flex-col h-screen sticky top-0 z-40
                bg-[#020617] border-r border-slate-800/60
                transition-all duration-300 ease-in-out
                ${collapsed ? 'w-[72px]' : 'w-[260px]'}
            `}
        >
            {/* ── Logo ── */}
            <div className={`flex items-center h-16 px-4 border-b border-slate-800/60 ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap size={18} className="text-white" />
                    </div>
                    {/* Pulse dot */}
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#020617] animate-pulse" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white tracking-tight truncate">Colateral-X</span>
                        <span className="text-[10px] font-mono text-blue-400/60 truncate">Arbitrum Stylus</span>
                    </div>
                )}
            </div>

            {/* ── Protocol Stats (collapsed = hidden) ── */}
            {!collapsed && (
                <div className="px-4 py-4 border-b border-slate-800/40">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-800/40">
                            <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-0.5">TVL</p>
                            <p className="text-sm font-bold font-mono text-emerald-400">$2.4M</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-800/40">
                            <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-0.5">APY</p>
                            <p className="text-sm font-bold font-mono text-blue-400">8.2%</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Navigation ── */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {!collapsed && (
                    <p className="text-[10px] font-mono uppercase text-slate-600 tracking-[0.15em] px-3 mb-3">
                        Navigation
                    </p>
                )}
                {NAV_ITEMS.map((item) => {
                    const isActive = activeItem === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            title={collapsed ? item.label : undefined}
                            className={`
                                group relative w-full flex items-center gap-3 rounded-xl
                                transition-all duration-200 outline-none
                                ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
                                ${isActive
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                }
                            `}
                        >
                            {/* Active indicator glow */}
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                            )}

                            <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                {item.icon}
                            </span>

                            {!collapsed && (
                                <>
                                    <span className="text-sm font-medium truncate">{item.label}</span>
                                    {item.badge && (
                                        <span className={`
                                            ml-auto text-[10px] font-mono font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center
                                            ${isActive
                                                ? 'bg-blue-500/20 text-blue-300'
                                                : 'bg-slate-800 text-slate-400'
                                            }
                                        `}>
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* ── Network Status ── */}
            {!collapsed && (
                <div className="px-4 py-3 border-t border-slate-800/40">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <Activity size={14} className="text-emerald-400" />
                        <span className="text-[11px] font-mono text-emerald-400/80">Arbitrum Sepolia</span>
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                </div>
            )}

            {/* ── Collapse Toggle ── */}
            <div className="px-3 py-3 border-t border-slate-800/40">
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-colors"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    {!collapsed && <span className="text-xs">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}

// ─── Mobile Sidebar Overlay ───
function MobileSidebar({
    open,
    onClose,
    activeItem,
    onNavigate,
}: {
    open: boolean;
    onClose: () => void;
    activeItem: string;
    onNavigate: (id: string) => void;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#020617] border-r border-slate-800/60 flex flex-col animate-slide-in">
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/60">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            <Zap size={18} className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-white">Colateral-X</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Stats */}
                <div className="px-4 py-4 border-b border-slate-800/40">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-800/40">
                            <p className="text-[10px] font-mono uppercase text-slate-500">TVL</p>
                            <p className="text-sm font-bold font-mono text-emerald-400">$2.4M</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-800/40">
                            <p className="text-[10px] font-mono uppercase text-slate-500">APY</p>
                            <p className="text-sm font-bold font-mono text-blue-400">8.2%</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-1">
                    <p className="text-[10px] font-mono uppercase text-slate-600 tracking-[0.15em] px-3 mb-3">Navigation</p>
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeItem === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { onNavigate(item.id); onClose(); }}
                                className={`
                                    group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5
                                    transition-all duration-200
                                    ${isActive
                                        ? 'bg-blue-500/10 text-blue-400'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                    }
                                `}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                )}
                                <span className={isActive ? 'text-blue-400' : 'text-slate-500'}>{item.icon}</span>
                                <span className="text-sm font-medium">{item.label}</span>
                                {item.badge && (
                                    <span className={`ml-auto text-[10px] font-mono font-bold rounded-full px-1.5 py-0.5 ${isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Network */}
                <div className="px-4 py-3 border-t border-slate-800/40">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <Activity size={14} className="text-emerald-400" />
                        <span className="text-[11px] font-mono text-emerald-400/80">Arbitrum Sepolia</span>
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                </div>
            </aside>
        </div>
    );
}

// ─── Topbar ───
function Topbar({
    onMenuOpen,
    activeItem,
}: {
    onMenuOpen: () => void;
    activeItem: string;
}) {
    const [searchFocused, setSearchFocused] = useState(false);

    const breadcrumbLabel = NAV_ITEMS.find((n) => n.id === activeItem)?.label ?? 'Dashboard';

    return (
        <header className="sticky top-0 z-30 h-16 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/60 flex items-center px-4 lg:px-6 gap-4">
            {/* Mobile menu button */}
            <button
                onClick={onMenuOpen}
                className="lg:hidden flex-shrink-0 text-slate-400 hover:text-white transition-colors p-1"
            >
                <Menu size={22} />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs min-w-0">
                <span className="text-slate-500 font-mono">Home</span>
                <BreadcrumbArrow size={12} className="text-slate-700 flex-shrink-0" />
                <span className="text-slate-300 font-medium truncate">{breadcrumbLabel}</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-auto lg:mx-0 lg:ml-8">
                <div className={`
                    relative flex items-center rounded-xl transition-all duration-200
                    ${searchFocused
                        ? 'bg-slate-800/80 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'bg-slate-900/50 border-slate-800/60'
                    }
                    border
                `}>
                    <Search size={15} className="absolute left-3 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search assets, loans, addresses…"
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 pl-9 pr-4 py-2 outline-none font-mono"
                    />
                    <kbd className="hidden lg:flex items-center gap-0.5 absolute right-3 text-[10px] font-mono text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/50">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Live indicator */}
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 mr-1">
                    <TrendingUp size={13} className="text-emerald-400" />
                    <span className="text-[11px] font-mono text-emerald-400/80">Live</span>
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all group">
                    <Bell size={18} />
                    {/* Unread dot */}
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 border border-[#020617] group-hover:animate-ping" />
                </button>

                {/* Divider */}
                <div className="hidden md:block w-px h-8 bg-slate-800/60 mx-1" />

                {/* Network Status */}
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <Activity size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-mono text-emerald-400/80">Sepolia</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* Audit Status */}
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <Lock size={12} className="text-amber-400" />
                    <span className="text-[10px] font-mono text-amber-400/80">Audit: Phase 1</span>
                </div>

                {/* Wallet connect — Reserved slot */}
                <div className="ml-1">
                    <ConnectButton
                        accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
                        showBalance={{ smallScreen: false, largeScreen: true }}
                        chainStatus={{ smallScreen: 'none', largeScreen: 'icon' }}
                    />
                </div>
            </div>
        </header>
    );
}

// ─── Main Layout Export ───
export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeItem, setActiveItem] = useState<DashboardSection>('dashboard');

    // Clone children to inject section + onNavigate props into LendingDashboard
    const enhancedChildren = isValidElement(children)
        ? cloneElement(children as ReactElement<{ section?: DashboardSection; onNavigate?: (s: DashboardSection) => void }>, {
            section: activeItem,
            onNavigate: setActiveItem,
          })
        : children;

    return (
        <div className="flex h-screen bg-[#020617] text-white overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                activeItem={activeItem}
                onNavigate={(id) => setActiveItem(id as DashboardSection)}
            />

            {/* Mobile Sidebar */}
            <MobileSidebar
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                activeItem={activeItem}
                onNavigate={(id) => setActiveItem(id as DashboardSection)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar
                    onMenuOpen={() => setMobileMenuOpen(true)}
                    activeItem={activeItem}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    {/* Subtle top gradient */}
                    <div className="pointer-events-none absolute top-16 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/[0.02] to-transparent z-0" />

                    <div className="relative z-10 p-4 lg:p-6">
                        {enhancedChildren}
                    </div>
                </main>

                {/* Bottom Status Bar */}
                <div className="h-7 bg-[#010410] border-t border-slate-800/40 flex items-center px-4 gap-4 text-[10px] font-mono text-slate-600 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Connected</span>
                    </div>
                    <span className="text-slate-800">|</span>
                    <span>Block: <span className="text-slate-400">14,205,887</span></span>
                    <span className="text-slate-800">|</span>
                    <span>Gas: <span className="text-emerald-400/70">0.02 gwei</span></span>
                    <span className="ml-auto text-slate-700">Colateral-X v1.0.0</span>
                </div>
            </div>
        </div>
    );
}
