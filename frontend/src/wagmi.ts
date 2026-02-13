import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrumSepolia } from 'wagmi/chains'

// Local Hardhat chain definition
const hardhatLocal = {
    id: 31337,
    name: 'Hardhat Local',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['http://127.0.0.1:8545'] },
    },
} as const

export const config = getDefaultConfig({
    appName: 'CollateralX',
    projectId: 'YOUR_PROJECT_ID', // Reemplazar con ID real para WalletConnect en prod
    chains: [arbitrumSepolia, hardhatLocal],
    ssr: false, // Vite es SPA
})
