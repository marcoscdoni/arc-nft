'use client'

import { useAccount, useBalance } from 'wagmi'
import { formatUnits } from 'viem'
import { TOKENS } from '@/lib/tokens'

export function WalletBalance() {
  const { address, isConnected } = useAccount()
  
  // Get native USDC balance
  const { data: usdcBalance, isLoading: usdcLoading } = useBalance({
    address: address,
  })

  // Get EURC balance
  const { data: eurcBalance, isLoading: eurcLoading } = useBalance({
    address: address,
    token: TOKENS.EURC as `0x${string}`,
  })

  if (!isConnected || !address) {
    return null
  }

  // Format balance - Arc uses 18 decimals internally despite being USDC
  const formatBalance = (value: bigint | undefined) => {
    if (!value) return '0.00'
    
    try {
      // Use 18 decimals (the actual format from Arc)
      const formatted = formatUnits(value, 18)
      const number = parseFloat(formatted)
      
      // Format with commas and 2 decimals
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number)
    } catch (error) {
      console.error('Error formatting balance:', error)
      return '0.00'
    }
  }

  const usdcFormatted = formatBalance(usdcBalance?.value)
  const eurcFormatted = formatBalance(eurcBalance?.value)

  // Don't show if still loading
  if (usdcLoading && eurcLoading) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {/* USDC Balance - only show if has balance or finished loading */}
      {!usdcLoading && usdcBalance && (
        <div className="flex h-10 items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900/80 px-3 backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-blue-400" />
          <span className="text-xs font-medium text-gray-400">USDC</span>
          <span className="text-sm font-semibold text-white">
            {usdcFormatted}
          </span>
        </div>
      )}

      {/* EURC Balance - only show if has balance */}
      {!eurcLoading && eurcBalance && eurcBalance.value > 0n && (
        <div className="flex h-10 items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900/80 px-3 backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-purple-400" />
          <span className="text-xs font-medium text-gray-400">EURC</span>
          <span className="text-sm font-semibold text-white">
            {eurcFormatted}
          </span>
        </div>
      )}
    </div>
  )
}
