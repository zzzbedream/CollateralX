import { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from './wagmi'
import LoanDashboard from './components/LoanDashboard'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

function LandingPage({ onLaunch }: { onLaunch: () => void }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1121] text-white px-6 text-center relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl animate-fade-in-up">
                <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="text-3xl font-bold">CX</span>
                    </div>
                </div>

                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-300">
                    Collateral-X
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed">
                    La primera plataforma DeFi que convierte tus <span className="text-blue-400 font-semibold">activos físicos</span> en liquidez inmediata.
                    <br className="hidden sm:block" />
                    Powered by <span className="text-[#FF9F1C] font-semibold">Arbitrum Stylus</span> & Rust.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={onLaunch}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-blue-900/40 w-full sm:w-auto"
                    >
                        Lanzar App 🚀
                    </button>
                    <a
                        href="#"
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-full font-semibold text-lg transition-all border border-white/10 w-full sm:w-auto"
                    >
                        Ver Demo
                    </a>
                </div>

                <div className="mt-16 grid grid-cols-3 gap-8 text-center opacity-60">
                    <div>
                        <p className="text-2xl font-bold text-white mb-1">10x</p>
                        <p className="text-xs uppercase tracking-widest text-gray-500">Más Barato</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white mb-1">Rust</p>
                        <p className="text-xs uppercase tracking-widest text-gray-500">Core Logic</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white mb-1">$1.8T</p>
                        <p className="text-xs uppercase tracking-widest text-gray-500">Liquidez</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function App() {
    const [launched, setLaunched] = useState(false)

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#2563eb',
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                    })}
                >
                    {launched ? <LoanDashboard /> : <LandingPage onLaunch={() => setLaunched(true)} />}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
