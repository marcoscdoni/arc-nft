import { http, createConfig } from 'wagmi'
import { arcTestnet } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

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
