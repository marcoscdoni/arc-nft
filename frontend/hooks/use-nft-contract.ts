'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACTS } from '@/lib/contracts'
import ArcNFTAbi from '@/lib/abis/ArcNFT.json'
import ArcMarketplaceAbi from '@/lib/abis/ArcMarketplace.json'

export function useNFTMint() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const mint = async (tokenURI: string) => {
    try {
      writeContract({
        address: CONTRACTS.NFT as `0x${string}`,
        abi: ArcNFTAbi,
        functionName: 'mint',
        args: [tokenURI],
      })
    } catch (err) {
      console.error('Mint error:', err)
      throw err
    }
  }

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

export function useNFTApprove() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = async (tokenId: bigint) => {
    try {
      writeContract({
        address: CONTRACTS.NFT as `0x${string}`,
        abi: ArcNFTAbi,
        functionName: 'approve',
        args: [CONTRACTS.MARKETPLACE, tokenId],
      })
    } catch (err) {
      console.error('Approve error:', err)
      throw err
    }
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

export function useMarketplaceListing() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createListing = async (tokenId: bigint, priceInUSDC: string) => {
    try {
      // Convert price to Wei (18 decimals for Arc USDC)
      const priceWei = parseUnits(priceInUSDC, 18)

      writeContract({
        address: CONTRACTS.MARKETPLACE as `0x${string}`,
        abi: ArcMarketplaceAbi,
        functionName: 'createListing',
        args: [CONTRACTS.NFT, tokenId, priceWei],
      })
    } catch (err) {
      console.error('Create listing error:', err)
      throw err
    }
  }

  return {
    createListing,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

export function useMarketplaceBuy() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const buyNFT = async (listingId: bigint, priceInUSDC: string) => {
    try {
      const priceWei = parseUnits(priceInUSDC, 18)

      writeContract({
        address: CONTRACTS.MARKETPLACE as `0x${string}`,
        abi: ArcMarketplaceAbi,
        functionName: 'buyNFT',
        args: [listingId],
        value: priceWei,
      })
    } catch (err) {
      console.error('Buy NFT error:', err)
      throw err
    }
  }

  return {
    buyNFT,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
