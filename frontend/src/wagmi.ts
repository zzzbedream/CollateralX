import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrumSepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
    appName: 'CollateralX',
    projectId: '3a8170812b534d0ff9d794f19a901d64', // Public Demo ID
    chains: [arbitrumSepolia],
    ssr: false,
})
