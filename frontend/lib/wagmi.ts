import { http, createConfig } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'Arc', symbol: 'ARC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://explorer.testnet.arc.network' },
  },
  testnet: true,
} as const

export const config = createConfig({
  chains: [arcTestnet],
  connectors: [
    injected(),
    // Only include WalletConnect if projectId is configured
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [arcTestnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
