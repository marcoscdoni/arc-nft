'use client'

import { useEffect, useRef } from 'react'
import { usePublicClient, useAccount } from 'wagmi'
import { parseAbi } from 'viem'
import { CONTRACTS, ARC_CHAIN_ID } from '@/lib/contracts'
import { createSupabaseClient } from '@/lib/supabase'

// Hook para monitorar transferências de NFTs e atualizar o Supabase
export function useNFTSync() {
  const { address } = useAccount()
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID })
  const isWatchingRef = useRef(false)

  useEffect(() => {
    if (!publicClient || !address || isWatchingRef.current) return

    console.log('👀 Iniciando monitoramento de transferências...')
    isWatchingRef.current = true

    // Monitorar eventos Transfer em tempo real
    const unwatch = publicClient.watchContractEvent({
      address: CONTRACTS.NFT as `0x${string}`,
      abi: parseAbi([
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
      ]),
      eventName: 'Transfer',
      onLogs: async (logs) => {
        for (const log of logs) {
          const { from, to, tokenId } = log.args as { from: string; to: string; tokenId: bigint }
          
          // Ignorar mints (from = zero address)
          if (from === '0x0000000000000000000000000000000000000000') {
            continue
          }

          console.log(`🔄 Transfer detectado: NFT #${tokenId} de ${from} para ${to}`)

          // Atualizar owner no Supabase
          try {
            const supabase = createSupabaseClient(to)
            const { error } = await supabase
              .from('nfts')
              .update({
                owner_address: to.toLowerCase(),
                last_transfer_at: new Date().toISOString(),
              })
              .eq('contract_address', CONTRACTS.NFT.toLowerCase())
              .eq('token_id', Number(tokenId))

            if (error) {
              console.error('Erro ao atualizar owner:', error)
            } else {
              console.log(`✅ Owner atualizado para NFT #${tokenId}`)
            }
          } catch (err) {
            console.error('Erro ao processar transferência:', err)
          }
        }
      },
    })

    return () => {
      console.log('🛑 Parando monitoramento de transferências...')
      unwatch()
      isWatchingRef.current = false
    }
  }, [publicClient, address])
}
