'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Copy, ExternalLink, Settings, Share2 } from 'lucide-react'
import { NFTCard } from '@/components/nft-card'

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'collected' | 'created' | 'listed'>('collected')

  // Mock data - replace with actual contract data
  const mockNFTs = [
    {
      id: '1',
      name: 'Cosmic Journey #42',
      image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
      price: '1250.00',
      creator: '0x1234...5678',
    },
    {
      id: '2',
      name: 'Digital Dreams',
      image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop',
      price: '890.50',
      creator: '0x1234...5678',
    },
    {
      id: '3',
      name: 'Abstract Reality',
      image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400&h=400&fit=crop',
      price: '2100.00',
      creator: '0x1234...5678',
    },
  ]

  const stats = [
    { label: 'Collected', value: '24' },
    { label: 'Created', value: '12' },
    { label: 'Total Value', value: '45,890 USDC' },
    { label: 'Floor Price', value: '890 USDC' },
  ]

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      alert('Address copied!')
    }
  }

  if (!isConnected) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="animated-gradient fixed inset-0 -z-10 opacity-30" />
        <div className="glass-card max-w-md rounded-2xl border border-white/10 p-12 text-center">
          <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
          <p className="mt-2 text-slate-400">
            Please connect your wallet to view your profile
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen py-12">
      <div className="animated-gradient fixed inset-0 -z-10 opacity-30" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="glass-card glow-violet mb-8 overflow-hidden rounded-3xl border border-white/10">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600" />
          
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <div className="h-32 w-32 rounded-full border-4 border-gray-900 bg-gradient-to-br from-violet-400 to-purple-400 p-1">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-900 text-4xl font-bold text-white">
                  {address?.slice(2, 4).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button className="glass-card rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="glass-card rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                <Settings className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <h1 className="text-3xl font-bold text-white">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </h1>
              <button
                onClick={copyAddress}
                className="mt-2 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                {address}
                <Copy className="h-4 w-4" />
              </button>
              <p className="mt-4 max-w-2xl text-slate-400">
                Digital artist and NFT collector on Arc Layer 1. Exploring the intersection of art and blockchain technology.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="glass-card rounded-xl border border-white/10 p-4 transition-all hover:bg-white/10">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-white/10">
          {(['collected', 'created', 'listed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-3 font-medium capitalize transition ${
                activeTab === tab
                  ? 'border-violet-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* NFT Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockNFTs.map((nft) => (
            <NFTCard key={nft.id} {...nft} />
          ))}
        </div>

        {/* Empty State */}
        {mockNFTs.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-800 bg-gray-900/50">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white">No NFTs Yet</h3>
              <p className="mt-2 text-gray-400">
                {activeTab === 'collected'
                  ? 'Start collecting NFTs from the marketplace'
                  : activeTab === 'created'
                  ? 'Create your first NFT to get started'
                  : 'List your NFTs for sale'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

