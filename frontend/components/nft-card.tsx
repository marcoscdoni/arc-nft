'use client'

import { Link } from '@/i18n/routing'
import { formatUnits } from 'viem'

interface NFTCardProps {
  id: string
  name: string
  image: string
  price: bigint
  owner: string
}

export function NFTCard({ id, name, image, price, owner }: NFTCardProps) {
  const formattedPrice = formatUnits(price, 18)

  return (
    <Link
      href={`/nft/${id}`}
      className="group overflow-hidden rounded-lg border border-gray-800 bg-gray-900 transition hover:border-violet-500"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white">{name}</h3>
        <p className="mt-1 text-sm text-gray-400">{owner}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-400">Price</span>
          <span className="font-semibold text-white">{formattedPrice} USDC</span>
        </div>
      </div>
    </Link>
  )
}
