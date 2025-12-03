'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, TrendingUp, Clock, DollarSign } from 'lucide-react'
import { NFTCard } from '@/components/nft-card'

// Mock data - replace with actual contract data
const mockNFTs = [
  {
    id: '1',
    name: 'Cosmic Journey #42',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
    price: '1250.00',
    owner: '0x1234...5678',
    category: 'art',
  },
  {
    id: '2',
    name: 'Digital Dreams',
    image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop',
    price: '890.50',
    owner: '0x8765...4321',
    category: 'art',
  },
  {
    id: '3',
    name: 'Abstract Reality',
    image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400&h=400&fit=crop',
    price: '2100.00',
    owner: '0xabcd...ef12',
    category: '3d',
  },
  {
    id: '4',
    name: 'Neon Nights',
    image: 'https://images.unsplash.com/photo-1620121684840-edffcfc4b878?w=400&h=400&fit=crop',
    price: '1500.00',
    owner: '0x9876...5432',
    category: 'photography',
  },
  {
    id: '5',
    name: 'Cyber Punk City',
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=400&h=400&fit=crop',
    price: '3200.00',
    owner: '0x5678...1234',
    category: 'gaming',
  },
  {
    id: '6',
    name: 'Future Vision',
    image: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=400&h=400&fit=crop',
    price: '1750.00',
    owner: '0x3456...7890',
    category: '3d',
  },
  {
    id: '7',
    name: 'Ethereal Landscape',
    image: 'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=400&h=400&fit=crop',
    price: '999.00',
    owner: '0x2345...6789',
    category: 'photography',
  },
  {
    id: '8',
    name: 'Quantum Leap',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    price: '4200.00',
    owner: '0x7890...1234',
    category: 'art',
  },
]

const categories = [
  { id: 'all', label: 'All Items' },
  { id: 'art', label: 'Art' },
  { id: 'photography', label: 'Photography' },
  { id: 'gaming', label: 'Gaming' },
  { id: '3d', label: '3D Models' },
]

const sortOptions = [
  { id: 'recent', label: 'Recently Added', icon: Clock },
  { id: 'price-low', label: 'Price: Low to High', icon: DollarSign },
  { id: 'price-high', label: 'Price: High to Low', icon: DollarSign },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'price-low' | 'price-high' | 'trending'>('recent')
  const [category, setCategory] = useState<'all' | 'art' | 'photography' | 'gaming' | '3d'>('all')

  // Filter and sort NFTs
  const filteredNFTs = mockNFTs
    .filter((nft) => {
      const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = category === 'all' || nft.category === category
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price)
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price)
        case 'trending':
        case 'recent':
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Explore NFTs</h1>
          <p className="mt-2 text-gray-400">
            Discover unique digital assets on Arc Layer 1
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NFTs by name..."
              className="w-full rounded-lg border border-gray-700 bg-gray-900 py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as typeof category)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  category === cat.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/50'
                    : 'border border-gray-700 bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <SlidersHorizontal className="h-4 w-4" />
              Sort by:
            </div>
            {sortOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id as typeof sortBy)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                    sortBy === option.id
                      ? 'bg-violet-600 text-white'
                      : 'border border-gray-700 bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-400">
          {filteredNFTs.length} {filteredNFTs.length === 1 ? 'item' : 'items'} found
        </div>

        {/* NFT Grid */}
        {filteredNFTs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNFTs.map((nft) => (
              <NFTCard
                key={nft.id}
                id={nft.id}
                name={nft.name}
                image={nft.image}
                price={BigInt(parseFloat(nft.price) * 1e18)}
                owner={nft.owner}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-800 bg-gray-900/50">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white">No NFTs Found</h3>
              <p className="mt-2 text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

