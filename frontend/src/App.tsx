import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from './wagmi'
import LoanDashboard from './components/LoanDashboard'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

export default function App() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#2563eb', // cx-blue
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                    })}
                >
                    <LoanDashboard />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
