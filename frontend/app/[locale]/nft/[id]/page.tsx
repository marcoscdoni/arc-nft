'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { Heart, Share2, Flag, ExternalLink, Clock, DollarSign, User } from 'lucide-react'
import { formatUnits } from 'viem'

export default function NFTDetailPage() {
  const params = useParams()
  const { address } = useAccount()
  const [isLiked, setIsLiked] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)

  // Mock data - replace with actual contract data
  const nft = {
    id: params.id,
    name: 'Cosmic Journey #42',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=800&fit=crop',
    description: 'An ethereal journey through the cosmos, featuring vibrant nebulae and distant galaxies. This unique piece captures the infinite beauty of space in stunning detail.',
    price: '1250.00',
    owner: '0x1234567890123456789012345678901234567890',
    creator: '0x9876543210987654321098765432109876543210',
    royalty: 2.5,
    tokenId: '42',
    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    metadata: {
      created: '2024-01-15',
      edition: '1 of 1',
      category: 'Digital Art',
    },
  }

  const activity = [
    { type: 'Minted', from: 'NullAddress', to: '0x9876...3210', price: null, date: '2024-01-15' },
    { type: 'Listed', from: '0x9876...3210', to: null, price: '1250.00', date: '2024-01-16' },
  ]

  const isOwner = address?.toLowerCase() === nft.owner.toLowerCase()

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
              <img
                src={nft.image}
                alt={nft.name}
                className="aspect-square w-full object-cover"
              />
            </div>

            {/* Description */}
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">Description</h3>
              <p className="text-gray-400">{nft.description}</p>
            </div>

            {/* Details */}
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Contract Address</span>
                  <a
                    href={`https://testnet.arcscan.app/address/${nft.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-violet-400 hover:text-violet-300"
                  >
                    {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Token ID</span>
                  <span className="text-white">{nft.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Token Standard</span>
                  <span className="text-white">ERC-721</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Blockchain</span>
                  <span className="text-white">Arc Layer 1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Creator Royalty</span>
                  <span className="text-white">{nft.royalty}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-4">
            {/* Title and Actions */}
            <div>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white">{nft.name}</h1>
                  <p className="mt-2 text-gray-400">{nft.metadata.edition}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`rounded-lg border p-2 transition ${
                      isLiked
                        ? 'border-red-500 bg-red-500/10 text-red-500'
                        : 'border-gray-700 bg-gray-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Heart className="h-5 w-5" fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button className="rounded-lg border border-gray-700 bg-gray-900 p-2 text-gray-400 transition hover:text-white">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="rounded-lg border border-gray-700 bg-gray-900 p-2 text-gray-400 transition hover:text-white">
                    <Flag className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Owner */}
              <div className="mb-6 flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400">Owned by</p>
                  <a
                    href={`/profile/${nft.owner}`}
                    className="text-sm font-medium text-violet-400 hover:text-violet-300"
                  >
                    {isOwner ? 'You' : `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Created by</p>
                  <a
                    href={`/profile/${nft.creator}`}
                    className="text-sm font-medium text-violet-400 hover:text-violet-300"
                  >
                    {nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}
                  </a>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-400">Current Price</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-white">{nft.price}</p>
                  <p className="text-lg text-gray-400">USDC</p>
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-2">
                  <button className="w-full rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/50 transition hover:bg-violet-500">
                    Update Listing
                  </button>
                  <button className="w-full rounded-lg border border-gray-700 bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800">
                    Cancel Listing
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="w-full rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/50 transition hover:bg-violet-500"
                >
                  Buy Now
                </button>
              )}
            </div>

            {/* Activity */}
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Activity</h3>
              <div className="space-y-3">
                {activity.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-800 pb-3 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gray-800 p-2">
                        {item.type === 'Minted' ? (
                          <DollarSign className="h-4 w-4 text-green-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.type}</p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    </div>
                    {item.price && (
                      <p className="text-sm font-medium text-white">{item.price} USDC</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">Complete Purchase</h2>
            <div className="mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price</span>
                <span className="font-medium text-white">{nft.price} USDC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Creator Royalty</span>
                <span className="font-medium text-white">{nft.royalty}%</span>
              </div>
              <div className="border-t border-gray-800 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium text-white">Total</span>
                  <span className="text-xl font-bold text-white">{nft.price} USDC</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBuyModal(false)}
                className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                Cancel
              </button>
              <button className="flex-1 rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/50 transition hover:bg-violet-500">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
